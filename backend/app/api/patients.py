from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models import User, Patient
from app.schemas.patient import PatientCreate, PatientResponse
from app.api.dependencies import get_current_user


router = APIRouter(
    prefix="/api/patient",
    tags=["Patient"],
)


@router.post(
    "/profile",
    response_model=PatientResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_patient_profile(
    data: PatientCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    if current_user.role != "patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can create a patient profile",
        )

    existing_patient = (
        db.query(Patient)
        .filter(Patient.user_id == current_user.id)
        .first()
    )

    if existing_patient:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Patient profile already exists",
        )

    patient = Patient(
        user_id=current_user.id,
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
        .filter(Patient.user_id == current_user.id)
        .first()
    )

    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found",
        )

    return patient