import logging
import hashlib
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.statement import Statement
from models.account import Account
from pipeline.stage1_docling import run_stage1_docling
from pipeline.stage2_metadata import run_stage2_metadata
from pipeline.stage3_groq_analysis import run_stage3_groq_analysis
from pipeline.stage4_persistence import run_stage4_persistence

logger = logging.getLogger(__name__)

async def run_pipeline(db: AsyncSession, user_id: str, statement: Statement, file_path: str, password: str | None = None):
    """
    Orchestrates the entire 4-stage pipeline for a given statement.
    Updates the statement status and progress in the DB along the way.
    """
    try:
        # Stage 1
        statement.status = "PROCESSING"
        statement.progress = 10
        await db.commit()
        
        logger.info(f"[{statement.id}] Stage 1: Docling Extraction")
        docling_json = run_stage1_docling(file_path, password)
        
        # We can store the raw docling json if needed, but for MVP we skip it to save space
        # statement.docling_output = docling_json
        statement.progress = 30
        await db.commit()

        # Stage 2
        logger.info(f"[{statement.id}] Stage 2: Metadata & Raw Text")
        metadata, raw_text, bank_slug = run_stage2_metadata(docling_json)
        
        statement.bank_slug = bank_slug
        statement.progress = 50
        
        # Stage 2 Addendum: Account Resolution & Continuity Check
        account_no = statement.account_number
        if account_no:
            # 1. Account Resolution
            result = await db.execute(select(Account).where(Account.user_id == user_id, Account.account_no == account_no))
            account = result.scalar_one_or_none()
            if not account:
                account = Account(
                    user_id=user_id,
                    account_no=account_no,
                    account_type="savings", # default
                    display_name=f"{statement.bank_slug.capitalize()} {account_no[-4:]}" if len(account_no) >= 4 else f"{statement.bank_slug.capitalize()} Account"
                )
                db.add(account)
                await db.flush()
            
            statement.account_id = account.id

            # 2. Idempotent Re-upload Protection
            file_hash_val = statement.file_hash or hashlib.sha256(file_path.encode()).hexdigest()
            statement.source_file_hash = file_hash_val
            
            existing_stmt = await db.execute(
                select(Statement).where(
                    Statement.account_id == account.id,
                    Statement.source_file_hash == file_hash_val,
                    Statement.id != statement.id,
                    Statement.status == "COMPLETED"
                )
            )
            if existing_stmt.scalar_one_or_none():
                logger.warning(f"[{statement.id}] Duplicate statement detected. Short-circuiting.")
                statement.status = "COMPLETED"
                statement.progress = 100
                statement.error_msg = "Already processed"
                await db.commit()
                return

            # 3. Continuity Check
            if statement.period_start and statement.opening_bal is not None:
                prev_stmt_res = await db.execute(
                    select(Statement).where(
                        Statement.account_id == account.id,
                        Statement.period_end < statement.period_start,
                        Statement.id != statement.id,
                        Statement.status == "COMPLETED"
                    ).order_by(Statement.period_end.desc()).limit(1)
                )
                prev_stmt = prev_stmt_res.scalar_one_or_none()
                if prev_stmt and prev_stmt.closing_bal is not None:
                    diff = abs(prev_stmt.closing_bal - statement.opening_bal)
                    if diff > 0.01:
                        gap_days = (statement.period_start - prev_stmt.period_end).days if prev_stmt.period_end else 0
                        statement.continuity_warning = {
                            "expected_opening": float(prev_stmt.closing_bal),
                            "actual_opening": float(statement.opening_bal),
                            "gap_days": gap_days
                        }
                        logger.warning(f"[{statement.id}] Continuity warning: Gap of {gap_days} days. Diff: {diff}")

        await db.commit()

        # Stage 3
        logger.info(f"[{statement.id}] Stage 3: Groq LLM Analysis")
        categorized_tx, insights = await run_stage3_groq_analysis(db, raw_text, bank_slug)
        
        statement.progress = 80
        await db.commit()

        # Stage 4
        logger.info(f"[{statement.id}] Stage 4: Persistence")
        summary = await run_stage4_persistence(db, user_id, statement.id, categorized_tx, insights)
        
        # Done
        statement.status = "COMPLETED"
        statement.progress = 100
        await db.commit()
        
        logger.info(f"[{statement.id}] Pipeline Success: {summary}")

    except Exception as e:
        logger.error(f"[{statement.id}] Pipeline Error: {e}", exc_info=True)
        await db.rollback()
        from sqlalchemy import update
        await db.execute(update(Statement).where(Statement.id == statement.id).values(status="FAILED"))
        await db.commit()
        raise e
