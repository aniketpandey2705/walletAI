import asyncio
from workers.celery_app import celery_app
from db.database import AsyncSessionLocal
from models.statement import Statement
from pipeline.orchestrator import run_pipeline
import logging

logger = logging.getLogger(__name__)

async def _process_statement_async(statement_id: str, password: str | None = None):
    async with AsyncSessionLocal() as session:
        statement = await session.get(Statement, statement_id)
        if not statement:
            logger.error(f"Statement {statement_id} not found in DB.")
            return

        user_id = statement.user_id
        
        # In upload.py, we saved the file to supabase as {user_id}/{statement_id}.pdf
        # This is saved in the statement.s3_key property
        file_path = statement.s3_key

        try:
            await run_pipeline(session, user_id, statement, file_path, password)
        except Exception as e:
            logger.error(f"Error processing statement {statement_id}: {e}")
        finally:
            from db.database import engine
            await engine.dispose()

@celery_app.task(name="process_statement")
def process_statement_task(statement_id: str, password: str | None = None):
    """
    Celery task entrypoint. Celery is sync, so we run the asyncio event loop.
    """
    logger.info(f"Starting background processing for statement {statement_id}")
    
    # Run the async pipeline
    asyncio.run(_process_statement_async(statement_id, password))
    
    logger.info(f"Finished background processing for statement {statement_id}")
