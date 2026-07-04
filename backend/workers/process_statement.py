import asyncio
from workers.celery_app import celery_app
from sqlalchemy import select
from db.database import AsyncSessionLocal
from models.statement import Statement
import time
import logging

logger = logging.getLogger(__name__)

async def _process_statement_async(statement_id: str):
    """
    Async implementation of the processing pipeline.
    For Checkpoint 3, this is just a stub that updates the status to COMPLETE.
    Real implementation comes in Checkpoint 5.
    """
    logger.info(f"Starting to process statement: {statement_id}")
    
    async with AsyncSessionLocal() as session:
        stmt = select(Statement).where(Statement.id == statement_id)
        result = await session.execute(stmt)
        statement = result.scalar_one_or_none()
        
        if not statement:
            logger.error(f"Statement {statement_id} not found in database")
            return
            
        # Update to PROCESSING
        statement.status = "PROCESSING"
        statement.progress = 10
        statement.current_stage = "Initialization"
        await session.commit()
        
        # Simulate some work
        time.sleep(2)
        
        # In a real pipeline, we'd do parsing, groq, etc. here
        # Update to COMPLETE
        statement.status = "COMPLETE"
        statement.progress = 100
        statement.current_stage = "Done"
        statement.tx_count = 0  # Stub
        await session.commit()
        
        logger.info(f"Finished processing statement: {statement_id}")


@celery_app.task(name="workers.process_statement.process_statement_task")
def process_statement_task(statement_id: str, password: str = None):
    """
    Celery task that acts as a wrapper around the async orchestrator.
    """
    # Create a new event loop for this sync Celery worker process
    loop = asyncio.get_event_loop()
    if loop.is_closed():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
    loop.run_until_complete(_process_statement_async(statement_id))
    return f"Processed {statement_id}"
