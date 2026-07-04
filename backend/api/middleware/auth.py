from fastapi import Request, HTTPException, status
import httpx
from jose import jwt
from config import settings
from db.database import AsyncSessionLocal
from models.user import User
from sqlalchemy import select

# We fetch Clerk's JWKS to verify the token signature
CLERK_JWKS_URL = f"https://api.clerk.com/v1/jwks"


async def get_clerk_jwks():
    """Fetch JSON Web Key Set from Clerk."""
    async with httpx.AsyncClient() as client:
        # Note: In production, you'd use your Frontend API URL or the Clerk Backend API
        # depending on whether it's a cross-origin request.
        # For simplicity in MVP, we might skip full signature verification
        # or use Clerk's python SDK. We will implement basic JWT decoding here.
        pass


async def get_current_user(request: Request) -> User:
    """
    FastAPI dependency that extracts the Clerk JWT from the Authorization header,
    decodes it (or fetches user from DB based on clerk_id), and returns the User model.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        # FOR DEVELOPMENT ONLY: Return a dummy user if no auth is provided,
        # so we can easily test the API without a frontend.
        if settings.app_env == "development":
            return await _get_or_create_dev_user()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )

    token = auth_header.split(" ")[1]
    try:
        # In a real app, verify the signature with Clerk's public key (JWKS)
        # For this MVP, we will decode the unverified token to get the user ID.
        # Clerk JWTs put the user id in the "sub" claim.
        payload = jwt.get_unverified_claims(token)
        clerk_id = payload.get("sub")
        
        if not clerk_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        async with AsyncSessionLocal() as session:
            stmt = select(User).where(User.clerk_id == clerk_id)
            result = await session.execute(stmt)
            user = result.scalar_one_or_none()
            
            if not user:
                # User exists in Clerk but not our DB yet?
                # The frontend webhook usually handles this, but we can lazy-create:
                user = User(
                    clerk_id=clerk_id,
                    email=f"{clerk_id}@placeholder.com" # We don't get email from pure JWT usually
                )
                session.add(user)
                await session.commit()
                await session.refresh(user)
                
            return user

    except Exception as e:
        if settings.app_env == "development":
            return await _get_or_create_dev_user()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )


async def _get_or_create_dev_user() -> User:
    """Helper for local testing without frontend auth."""
    async with AsyncSessionLocal() as session:
        clerk_id = "user_dev_123"
        stmt = select(User).where(User.clerk_id == clerk_id)
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            user = User(
                clerk_id=clerk_id,
                email="dev@walletdna.local",
                display_name="Dev User"
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)
        return user
