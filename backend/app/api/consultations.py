from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models import Consultation, Doctor, Patient, User
from app.schemas.consultation import (
    ConsultationCreate,
    ConsultationResponse,
)
from app.schemas.ai_assessment import AIAssessmentResponse
from app.api.dependencies import get_current_user
from app.services.ollama_service import ollama


router = APIRouter(
    prefix="/api/consultations",
    tags=["Consultations"],
)


# ============================================================
# CREATE CONSULTATION
# ============================================================

@router.post(
    "",
    response_model=ConsultationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_consultation(
    data: ConsultationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Only doctors can create consultations
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can create consultations",
        )

    # Get doctor profile
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

    # Get patient
    patient = (
        db.query(Patient)
        .filter(Patient.id == data.patient_id)
        .first()
    )

    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    # Create consultation
    consultation = Consultation(
        patient_id=patient.id,
        doctor_id=doctor.id,
        symptoms=data.symptoms,
        diagnosis=data.diagnosis,
        notes=data.notes,
    )

    db.add(consultation)
    db.commit()
    db.refresh(consultation)

    return consultation


# ============================================================
# GET PATIENT CONSULTATIONS
# ============================================================

@router.get(
    "/patient/{patient_id}",
    response_model=list[ConsultationResponse],
)
def get_patient_consultations(
    patient_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Get patient
    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    # Patients can only see their own consultations
    if (
        current_user.role == "patient"
        and patient.user_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    consultations = (
        db.query(Consultation)
        .filter(Consultation.patient_id == patient_id)
        .order_by(Consultation.consultation_date.desc())
        .all()
    )

    return consultations


# ============================================================
# GENERATE AI ASSESSMENT
# ============================================================

@router.post(
    "/{consultation_id}/ai-assessment",
    response_model=AIAssessmentResponse,
)
async def generate_ai_assessment(
    consultation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Only doctors can generate AI assessments
    # --------------------------------------------------------

    if current_user.role != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can generate AI assessments",
        )

    # --------------------------------------------------------
    # Get doctor profile
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Get consultation
    # --------------------------------------------------------

    consultation = (
        db.query(Consultation)
        .filter(Consultation.id == consultation_id)
        .first()
    )

    if consultation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found",
        )

    # --------------------------------------------------------
    # Security:
    # Make sure this doctor owns the consultation
    # --------------------------------------------------------

    if consultation.doctor_id != doctor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this consultation",
        )

    # --------------------------------------------------------
    # Get patient
    # --------------------------------------------------------

    patient = (
        db.query(Patient)
        .filter(Patient.id == consultation.patient_id)
        .first()
    )

    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    # --------------------------------------------------------
    # Check if assessment already exists
    # --------------------------------------------------------

    existing_assessment = (
        db.query(Consultation)
        .filter(Consultation.id == consultation_id)
        .first()
    )

    if existing_assessment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found",
        )

    if consultation.ai_assessment is not None:
        return consultation.ai_assessment

    # --------------------------------------------------------
    # Build AI prompt
    # --------------------------------------------------------

    prompt = f"""
You are MediDiet-AI, an AI nutrition assessment assistant.

You are assisting a qualified doctor.
Provide a structured preliminary nutrition assessment based
ONLY on the information provided below.

Do not claim to replace a doctor.
Do not make emergency diagnoses.
Clearly mention when additional clinical evaluation may be needed.

PATIENT INFORMATION
-------------------
Name: {patient.name}
Age: {patient.age}
Gender: {patient.gender}
Height: {patient.height} cm
Weight: {patient.weight} kg

Medical Conditions:
{patient.medical_conditions or "None provided"}

Allergies:
{patient.allergies or "None provided"}

Dietary Preferences:
{patient.dietary_preferences or "None provided"}

Activity Level:
{patient.activity_level or "Not provided"}

CONSULTATION INFORMATION
------------------------
Symptoms:
{consultation.symptoms or "None provided"}

Doctor Diagnosis:
{consultation.diagnosis or "None provided"}

Doctor Notes:
{consultation.notes or "None provided"}

TASK
----
Provide a concise but useful nutrition assessment.

Include:

1. Nutrition observations
2. Possible dietary concerns
3. Recommended dietary approach
4. Foods or nutrients to prioritize
5. Foods or habits to limit
6. Suggested meal-pattern guidance
7. Important precautions
8. Follow-up considerations

Use clear headings and bullet points.
Do not prescribe medication.
Do not invent medical information.
"""

    # --------------------------------------------------------
    # Call local Ollama / Gemma
    # --------------------------------------------------------

    try:
        ai_response = await ollama.generate(prompt)

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service unavailable: {str(exc)}",
        )

    # --------------------------------------------------------
    # Save AI assessment
    # --------------------------------------------------------

    from app.models.consultation import AIAssessment

    assessment = AIAssessment(
        consultation_id=consultation.id,
        prompt=prompt,
        response=ai_response,
        model_name=ollama.model,
    )

    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    return assessment


# ============================================================
# GET AI ASSESSMENT
# ============================================================

@router.get(
    "/{consultation_id}/ai-assessment",
    response_model=AIAssessmentResponse,
)
def get_ai_assessment(
    consultation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Get consultation
    # --------------------------------------------------------

    consultation = (
        db.query(Consultation)
        .filter(Consultation.id == consultation_id)
        .first()
    )

    if consultation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found",
        )

    # --------------------------------------------------------
    # Access control
    # --------------------------------------------------------

    if current_user.role == "doctor":

        doctor = (
            db.query(Doctor)
            .filter(Doctor.user_id == current_user.id)
            .first()
        )

        if doctor is None or consultation.doctor_id != doctor.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )

    elif current_user.role == "patient":

        patient = (
            db.query(Patient)
            .filter(Patient.user_id == current_user.id)
            .first()
        )

        if patient is None or consultation.patient_id != patient.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )

    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    # --------------------------------------------------------
    # Get assessment
    # --------------------------------------------------------

    assessment = consultation.ai_assessment

    if assessment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI assessment has not been generated yet",
        )

    return assessment