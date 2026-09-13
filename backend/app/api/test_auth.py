from fastapi import APIRouter, Depends

from app.api.dependencies import get_current_user
from app.models import User


router = APIRouter(
    prefix="/api/test",
    tags=["Authentication Test"],
)


@router.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
    }