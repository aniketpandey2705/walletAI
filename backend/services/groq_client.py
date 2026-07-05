from groq import AsyncGroq
from config import settings
import json
import logging

logger = logging.getLogger(__name__)

class GroqClient:
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.groq_api_key)
        self.model = settings.groq_model

    async def _call_json_mode(self, system_prompt: str, user_content: str, max_retries=3) -> dict:
        for attempt in range(max_retries):
            try:
                response = await self.client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_content}
                    ],
                    model=self.model,
                    response_format={"type": "json_object"},
                    temperature=0.1, # Low temp for data extraction
                )
                return json.loads(response.choices[0].message.content)
            except Exception as e:
                logger.error(f"Groq API error on attempt {attempt+1}: {e}")
                if attempt == max_retries - 1:
                    raise e
                    
    async def extract_transactions(self, table_rows: list[dict], prompt: str) -> list[dict]:
        """Uses Groq to extract standardized transactions from raw table rows."""
        result = await self._call_json_mode(
            system_prompt=prompt,
            user_content=json.dumps(table_rows, default=str)
        )
        return result.get("transactions", [])

    async def categorize_transactions(self, transactions: list[dict], prompt: str) -> list[dict]:
        """Categorizes transactions."""
        # For batching, you might split huge lists. We assume < 100 for MVP in one call.
        result = await self._call_json_mode(
            system_prompt=prompt,
            user_content=json.dumps(transactions, default=str)
        )
        return result.get("categorized_transactions", [])
        
    async def generate_insights(self, stats: dict, prompt: str) -> list[dict]:
        """Generates AI insights based on spending stats."""
        result = await self._call_json_mode(
            system_prompt=prompt,
            user_content=json.dumps(stats, default=str)
        )
        return result.get("insights", [])

groq_client = GroqClient()
