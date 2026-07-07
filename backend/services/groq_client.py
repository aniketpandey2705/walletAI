from groq import AsyncGroq
from config import settings
import json
import logging

logger = logging.getLogger(__name__)

BATCH_SIZE = 30  # Process this many rows per Groq call to avoid token limits

class GroqClient:
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.groq_api_key)
        self.model = settings.groq_model

    async def _call_json_mode(self, system_prompt: str, user_content: str, max_tokens=3000, max_retries=3) -> dict:
        for attempt in range(max_retries):
            try:
                response = await self.client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_content}
                    ],
                    model=self.model,
                    response_format={"type": "json_object"},
                    temperature=0.1,
                    max_tokens=max_tokens,
                )
                return json.loads(response.choices[0].message.content)
            except Exception as e:
                logger.error(f"Groq API error on attempt {attempt+1}: {e}")
                if attempt == max_retries - 1:
                    raise e

    async def extract_transactions(self, table_rows: list[dict], prompt: str) -> list[dict]:
        """Uses Groq to extract standardized transactions, batching to avoid token limits."""
        all_transactions = []
        total_rows = len(table_rows)
        logger.info(f"Extracting {total_rows} raw rows in batches of {BATCH_SIZE}...")

        for i in range(0, total_rows, BATCH_SIZE):
            batch = table_rows[i:i + BATCH_SIZE]
            logger.info(f"  -> Extraction batch {i // BATCH_SIZE + 1}: rows {i+1}-{min(i+BATCH_SIZE, total_rows)}")
            result = await self._call_json_mode(
                system_prompt=prompt,
                user_content=json.dumps(batch, default=str)
            )
            batch_txs = result.get("transactions", [])
            all_transactions.extend(batch_txs)
            logger.info(f"     Got {len(batch_txs)} transactions from this batch.")

        logger.info(f"Total extracted: {len(all_transactions)} transactions from {total_rows} rows.")
        return all_transactions

    async def categorize_transactions(self, transactions: list[dict], prompt: str) -> list[dict]:
        """Categorizes transactions in batches."""
        all_categorized = []
        total = len(transactions)
        logger.info(f"Categorizing {total} transactions in batches of {BATCH_SIZE}...")

        for i in range(0, total, BATCH_SIZE):
            batch = transactions[i:i + BATCH_SIZE]
            logger.info(f"  -> Categorization batch {i // BATCH_SIZE + 1}: txns {i+1}-{min(i+BATCH_SIZE, total)}")
            result = await self._call_json_mode(
                system_prompt=prompt,
                user_content=json.dumps(batch, default=str)
            )
            batch_cat = result.get("categorized_transactions", [])
            all_categorized.extend(batch_cat)

        logger.info(f"Total categorized: {len(all_categorized)} transactions.")
        return all_categorized

    async def extract_from_text(self, raw_text: str, prompt: str) -> list[dict]:
        """
        Extracts ALL transactions from the full markdown text in a single Groq call.
        The full statement is ~10KB which is well within Groq's 131k token context window.
        Chunking was causing missed rows by splitting mid-table.
        """
        logger.info(f"Sending full statement text to Groq ({len(raw_text)} chars)...")
        result = await self._call_json_mode(
            system_prompt=prompt,
            user_content=raw_text
        )
        transactions = result.get("transactions", [])
        logger.info(f"Groq extracted {len(transactions)} transactions from full text.")
        return transactions

    async def generate_insights(self, stats: dict, prompt: str) -> list[dict]:
        """Generates AI insights based on spending stats."""
        result = await self._call_json_mode(
            system_prompt=prompt,
            user_content=json.dumps(stats, default=str)
        )
        return result.get("insights", [])

groq_client = GroqClient()
