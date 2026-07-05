import hashlib
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.transaction import Transaction

class DedupService:
    @staticmethod
    def compute_tx_hash(user_id: str, date_str: str, description: str, amount: float) -> str:
        """
        Computes a deterministic SHA-256 hash for a transaction to prevent duplicates.
        """
        # Normalize strings to prevent slight variation mismatches
        desc_norm = " ".join(description.strip().lower().split())
        raw_str = f"{user_id}|{date_str}|{desc_norm}|{amount:.2f}"
        return hashlib.sha256(raw_str.encode('utf-8')).hexdigest()

    @staticmethod
    async def filter_existing(db: AsyncSession, user_id: str, hashes: List[str]) -> List[str]:
        """
        Takes a list of transaction hashes and returns a list of hashes that DO NOT exist in the DB.
        """
        if not hashes:
            return []
            
        stmt = select(Transaction.tx_hash).where(
            Transaction.user_id == user_id,
            Transaction.tx_hash.in_(hashes)
        )
        result = await db.execute(stmt)
        existing_hashes = set(result.scalars().all())
        
        # Return only the hashes that are NOT in existing_hashes
        return [h for h in hashes if h not in existing_hashes]

dedup_service = DedupService()
