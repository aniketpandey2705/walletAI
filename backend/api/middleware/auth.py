from fastapi import Request, HTTPException, status
from jose import jwt, JWTError
from config import settings
from db.database import AsyncSessionLocal
from models.user import User
from sqlalchemy import select

async def get_current_user(request: Request) -> User:
    """
    FastAPI dependency that extracts the Supabase JWT from the Authorization header,
    decodes it, and returns the User model.
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
        # Decode and verify the Supabase JWT using the JWT secret
        # Supabase JWTs use HS256 algorithm.
        payload = jwt.decode(
            token, 
            settings.supabase_jwt_secret, 
            algorithms=["HS256"],
            options={"verify_aud": False} # Supabase sets aud to 'authenticated' usually
        )
        auth_id = payload.get("sub")
        
        if not auth_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: no sub claim")

        async with AsyncSessionLocal() as session:
            stmt = select(User).where(User.auth_id == auth_id)
            result = await session.execute(stmt)
            user = result.scalar_one_or_none()
            
            if not user:
                # User exists in Supabase Auth but not our public DB yet
                # We can lazy-create them here
                email = payload.get("email", f"{auth_id}@placeholder.com")
                user = User(
                    auth_id=auth_id,
                    email=email
                )
                session.add(user)
                await session.commit()
                await session.refresh(user)
                
            return user

    except JWTError as e:
        if settings.app_env == "development":
            return await _get_or_create_dev_user()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
        )


async def _get_or_create_dev_user() -> User:
    """Helper for local testing without frontend auth."""
    async with AsyncSessionLocal() as session:
        auth_id = "user_dev_123"
        stmt = select(User).where(User.auth_id == auth_id)
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            user = User(
                auth_id=auth_id,
                email="dev@walletdna.local",
                display_name="Dev User"
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)
        return user
