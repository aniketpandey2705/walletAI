"""
Seed script — inserts the 27 system categories into the database.
Run once after migrations: python db/seed.py
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from db.database import AsyncSessionLocal


# ──────────────────────────────────────────
# Category seed data
# ──────────────────────────────────────────

TOP_LEVEL = [
    ("cat-food",       "Food & Dining",      "food_dining",      "🍕", "#FF6B6B"),
    ("cat-transport",  "Transport",          "transport",        "🚗", "#4ECDC4"),
    ("cat-shopping",   "Shopping",           "shopping",         "🛍️", "#45B7D1"),
    ("cat-utilities",  "Bills & Utilities",  "bills_utilities",  "💡", "#96CEB4"),
    ("cat-health",     "Health & Medical",   "health_medical",   "🏥", "#88D8B0"),
    ("cat-income",     "Income",             "income",           "💰", "#2ECC71"),
    ("cat-emi",        "EMI & Loans",        "emi_loans",        "🏦", "#E74C3C"),
    ("cat-invest",     "Investments",        "investments",      "📈", "#9B59B6"),
    ("cat-entertain",  "Entertainment",      "entertainment",    "🎬", "#F39C12"),
    ("cat-travel",     "Travel",             "travel",           "✈️", "#1ABC9C"),
    ("cat-education",  "Education",          "education",        "📚", "#3498DB"),
    ("cat-other",      "Other",              "other",            "❓", "#95A5A6"),
]

SUBCATEGORIES = [
    # (id, name, slug, icon, color_hex, parent_id)
    ("cat-restaurants",   "Restaurants",      "restaurants",      "🍽️", "#FF6B6B", "cat-food"),
    ("cat-groceries",     "Groceries",        "groceries",        "🛒", "#FF8E53", "cat-food"),
    ("cat-delivery",      "Food Delivery",    "food_delivery",    "🛵", "#FF6B9D", "cat-food"),
    ("cat-fuel",          "Fuel",             "fuel",             "⛽", "#4ECDC4", "cat-transport"),
    ("cat-metro",         "Metro & Bus",      "metro_bus",        "🚇", "#26D0CE", "cat-transport"),
    ("cat-cab",           "Cab & Ride Share", "cab_rideshare",    "🚕", "#1A2980", "cat-transport"),
    ("cat-electricity",   "Electricity",      "electricity",      "⚡", "#96CEB4", "cat-utilities"),
    ("cat-internet",      "Internet & Phone", "internet_phone",   "📱", "#88D8A0", "cat-utilities"),
    ("cat-streaming",     "Streaming",        "streaming",        "📺", "#F39C12", "cat-entertain"),
    ("cat-salary",        "Salary",           "salary",           "💼", "#2ECC71", "cat-income"),
    ("cat-freelance",     "Freelance",        "freelance",        "💻", "#27AE60", "cat-income"),
    ("cat-home-loan",     "Home Loan EMI",    "home_loan_emi",    "🏠", "#E74C3C", "cat-emi"),
    ("cat-car-loan",      "Car Loan EMI",     "car_loan_emi",     "🚗", "#C0392B", "cat-emi"),
    ("cat-mf",            "Mutual Funds",     "mutual_funds",     "📊", "#9B59B6", "cat-invest"),
    ("cat-stocks",        "Stocks",           "stocks",           "📈", "#8E44AD", "cat-invest"),
]


async def seed_categories():
    async with AsyncSessionLocal() as session:
        # Check if already seeded
        result = await session.execute(text("SELECT COUNT(*) FROM categories"))
        count = result.scalar()
        if count > 0:
            print(f"⚠️  Categories already seeded ({count} rows). Skipping.")
            return

        print("🌱 Seeding top-level categories...")
        for row in TOP_LEVEL:
            await session.execute(
                text("""
                    INSERT INTO categories (id, name, slug, icon, color_hex, parent_id, is_system)
                    VALUES (:id, :name, :slug, :icon, :color_hex, NULL, TRUE)
                    ON CONFLICT (slug) DO NOTHING
                """),
                {"id": row[0], "name": row[1], "slug": row[2], "icon": row[3], "color_hex": row[4]},
            )

        print("🌱 Seeding subcategories...")
        for row in SUBCATEGORIES:
            await session.execute(
                text("""
                    INSERT INTO categories (id, name, slug, icon, color_hex, parent_id, is_system)
                    VALUES (:id, :name, :slug, :icon, :color_hex, :parent_id, TRUE)
                    ON CONFLICT (slug) DO NOTHING
                """),
                {
                    "id": row[0], "name": row[1], "slug": row[2],
                    "icon": row[3], "color_hex": row[4], "parent_id": row[5],
                },
            )

        await session.commit()
        print(f"✅ Seeded {len(TOP_LEVEL)} top-level + {len(SUBCATEGORIES)} subcategories")


if __name__ == "__main__":
    asyncio.run(seed_categories())
