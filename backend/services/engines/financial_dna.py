from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.transaction import Transaction

async def generate_financial_dna(db: AsyncSession, user_id: str):
    """
    Generates user financial behaviour traits deterministically.
    """
    stmt = select(Transaction).where(Transaction.user_id == user_id, Transaction.type == "DEBIT")
    res = await db.execute(stmt)
    expenses = res.scalars().all()
    
    if not expenses:
        return {"traits": []}
    
    traits = []
    
    # Weekend Shopper Trait
    weekend_expenses = [e for e in expenses if e.date.weekday() >= 5]
    weekend_ratio = len(weekend_expenses) / len(expenses) if expenses else 0
    
    if weekend_ratio > 0.4:
        traits.append({
            "trait": "Weekend Shopper",
            "score": round(weekend_ratio * 100),
            "confidence": 90,
            "reason": f"{round(weekend_ratio * 100)}% of your transactions happen on weekends."
        })
        
    # Food Enthusiast Trait
    food_expenses = [e for e in expenses if e.subcategory and "food" in e.subcategory.lower() or e.merchant_name and ("swiggy" in e.merchant_name.lower() or "zomato" in e.merchant_name.lower())]
    food_ratio = len(food_expenses) / len(expenses) if expenses else 0
    if food_ratio > 0.2:
        traits.append({
            "trait": "Food Enthusiast",
            "score": round(food_ratio * 100),
            "confidence": 85,
            "reason": "A significant portion of your spending goes to food and dining."
        })
        
    # Subscription Heavy
    sub_expenses = [e for e in expenses if e.subcategory and "subscription" in e.subcategory.lower()]
    if len(sub_expenses) >= 3:
         traits.append({
            "trait": "Subscription Heavy",
            "score": 80,
            "confidence": 95,
            "reason": f"You have {len(sub_expenses)} active subscriptions detected."
        })
         
    return {"traits": traits}
