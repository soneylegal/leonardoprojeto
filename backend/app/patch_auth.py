from app.models.user import User

async def mock_get_current_user() -> User:
    return User(id=1, email="test@test.com")
