from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models import User, Doctor
from app.schemas.doctor import DoctorCreate, DoctorResponse
from app.api.dependencies import get_current_user


router = APIRouter(
    prefix="/api/doctor",
    tags=["Doctor"],
)


@router.post(
    "/profile",
    response_model=DoctorResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_doctor_profile(
    data: DoctorCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can create a doctor profile",
        )

    existing_doctor = (
        db.query(Doctor)
        .filter(Doctor.user_id == current_user.id)
        .first()
    )

    if existing_doctor:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Doctor profile already exists",
        )

    if data.license_number:
        existing_license = (
            db.query(Doctor)
            .filter(Doctor.license_number == data.license_number)
            .first()
        )

        if existing_license:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="License number already registered",
            )

    doctor = Doctor(
        user_id=current_user.id,
        first_name=data.first_name,
        last_name=data.last_name,
        specialization=data.specialization,
        license_number=data.license_number,
        phone=data.phone,
    )

    db.add(doctor)
    db.commit()
    db.refresh(doctor)

    return doctor


@router.get(
    "/profile",
    response_model=DoctorResponse,
)
def get_doctor_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doctor = (
        db.query(Doctor)
        .filter(Doctor.user_id == current_user.id)
        .first()
    )

    if doctor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )

    return doctor