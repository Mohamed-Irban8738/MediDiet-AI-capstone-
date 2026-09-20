from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models import Patient, User
from app.schemas.patient import (
    PatientCreate,
    PatientResponse,
)
from app.core.security import hash_password
from app.api.dependencies import get_current_user


router = APIRouter(
    prefix="/api/patient",
    tags=["Patient"],
)


@router.post(
    "/create",
    response_model=PatientResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_patient_account(
    data: PatientCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Only doctors can create patient accounts",
        )

    existing_user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email already registered",
        )

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        role="patient",
    )

    db.add(user)
    db.flush()

    patient = Patient(
        user_id=user.id,
        name=data.name,
        age=data.age,
        gender=data.gender,
        height=data.height,
        weight=data.weight,
        medical_conditions=data.medical_conditions,
        allergies=data.allergies,
        dietary_preferences=data.dietary_preferences,
        activity_level=data.activity_level,
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)

    return patient


@router.get(
    "/profile",
    response_model=PatientResponse,
)
def get_patient_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    patient = (
        db.query(Patient)
        .filter(
            Patient.user_id == current_user.id
        )
        .first()
    )

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient profile not found",
        )

    return patient


@router.get(
    "/",
    response_model=list[PatientResponse],
)
def get_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Only doctors can access patients",
        )

    return (
        db.query(Patient)
        .order_by(Patient.id.desc())
        .all()
    )