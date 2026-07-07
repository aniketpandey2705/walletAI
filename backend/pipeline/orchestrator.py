import logging
from sqlalchemy.ext.asyncio import AsyncSession
from models.statement import Statement
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
        statement.status = "FAILED"
        # We could save the error string to a field if we had one
        await db.commit()
        raise e
