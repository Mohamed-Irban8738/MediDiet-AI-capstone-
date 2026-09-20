from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models import User, Doctor
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
)
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
    # Check whether email already exists
    existing_user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Create doctor login account
    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        role="doctor",
    )

    db.add(user)
    db.flush()

    # Create doctor profile
    doctor = Doctor(
        user_id=user.id,
        first_name=data.first_name,
        last_name=data.last_name,
        specialization=data.specialization,
        license_number=data.license_number,
        phone=data.phone,
    )

    db.add(doctor)

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create doctor account",
        )

    db.refresh(user)
    db.refresh(doctor)

    # Generate login token
    token = create_access_token(user.id)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=user.role,
    )


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    # Find user
    user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    # Validate credentials
    if not user or not verify_password(
        data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Generate token
    token = create_access_token(user.id)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=user.role,
    )