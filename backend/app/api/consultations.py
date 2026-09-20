from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models import (
    Consultation,
    Doctor,
    Patient,
    User,
    AIAssessment,
)
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
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Only doctors can create consultations",
        )

    doctor = (
        db.query(Doctor)
        .filter(Doctor.user_id == current_user.id)
        .first()
    )

    if doctor is None:
        raise HTTPException(
            status_code=404,
            detail="Doctor profile not found",
        )

    patient = (
        db.query(Patient)
        .filter(Patient.id == data.patient_id)
        .first()
    )

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

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

    doctor_name = (
        f"Dr. {doctor.first_name} {doctor.last_name or ''}"
        .strip()
    )

    return {
        "id": consultation.id,
        "patient_id": consultation.patient_id,
        "doctor_id": consultation.doctor_id,
        "doctor_name": doctor_name,
        "symptoms": consultation.symptoms,
        "diagnosis": consultation.diagnosis,
        "notes": consultation.notes,
        "consultation_date": consultation.consultation_date,
    }


@router.get(
    "/patient/{patient_id}",
    response_model=list[ConsultationResponse],
)
def get_patient_consultations(
    patient_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    # Patients can only see their own consultations.
    # Doctors can see consultations for any patient.
    if (
        current_user.role == "patient"
        and patient.user_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Access denied",
        )

    consultations = (
        db.query(Consultation, Doctor)
        .join(
            Doctor,
            Consultation.doctor_id == Doctor.id,
        )
        .filter(
            Consultation.patient_id == patient_id
        )
        .order_by(
            Consultation.consultation_date.desc()
        )
        .all()
    )

    return [
        {
            "id": consultation.id,
            "patient_id": consultation.patient_id,
            "doctor_id": consultation.doctor_id,
            "doctor_name": (
                f"Dr. {doctor.first_name} "
                f"{doctor.last_name or ''}"
            ).strip(),
            "symptoms": consultation.symptoms,
            "diagnosis": consultation.diagnosis,
            "notes": consultation.notes,
            "consultation_date": consultation.consultation_date,
        }
        for consultation, doctor in consultations
    ]


@router.post(
    "/{consultation_id}/ai-assessment",
    response_model=AIAssessmentResponse,
)
async def generate_ai_assessment(
    consultation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Only doctors can generate AI assessments",
        )

    doctor = (
        db.query(Doctor)
        .filter(Doctor.user_id == current_user.id)
        .first()
    )

    if doctor is None:
        raise HTTPException(
            status_code=404,
            detail="Doctor profile not found",
        )

    consultation = (
        db.query(Consultation)
        .filter(Consultation.id == consultation_id)
        .first()
    )

    if consultation is None:
        raise HTTPException(
            status_code=404,
            detail="Consultation not found",
        )

    patient = (
        db.query(Patient)
        .filter(Patient.id == consultation.patient_id)
        .first()
    )

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    if consultation.ai_assessment is not None:
        return consultation.ai_assessment

    prompt = f"""
You are MediDiet-AI, an AI nutrition assessment assistant.

You are assisting a qualified doctor.
Provide a structured preliminary nutrition assessment based ONLY on the information provided below.
Do not claim to replace a doctor. Do not make emergency diagnoses. Clearly mention when additional clinical evaluation may be needed.

PATIENT INFORMATION
-------------------
Name: {patient.name}
Age: {patient.age}
Gender: {patient.gender}
Height: {patient.height} cm
Weight: {patient.weight} kg
Medical Conditions: {patient.medical_conditions or 'None provided'}
Allergies: {patient.allergies or 'None provided'}
Dietary Preferences: {patient.dietary_preferences or 'None provided'}
Activity Level: {patient.activity_level or 'Not provided'}

CONSULTATION INFORMATION
------------------------
Symptoms: {consultation.symptoms or 'None provided'}
Doctor Diagnosis: {consultation.diagnosis or 'None provided'}
Doctor Notes: {consultation.notes or 'None provided'}

TASK
----
Provide a concise but useful nutrition assessment. Include:
1. Nutrition observations
2. Possible dietary concerns
3. Recommended dietary approach
4. Foods or nutrients to prioritize
5. Foods or habits to limit
6. Suggested meal-pattern guidance
7. Important precautions
8. Follow-up considerations

Use clear headings and bullet points. Do not prescribe medication. Do not invent medical information.
"""

    try:
        ai_response = await ollama.generate(prompt)
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"AI service unavailable: {str(exc)}",
        )

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


@router.get(
    "/{consultation_id}/ai-assessment",
    response_model=AIAssessmentResponse,
)
def get_ai_assessment(
    consultation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    consultation = (
        db.query(Consultation)
        .filter(Consultation.id == consultation_id)
        .first()
    )

    if consultation is None:
        raise HTTPException(
            status_code=404,
            detail="Consultation not found",
        )

    if current_user.role == "doctor":
        doctor = (
            db.query(Doctor)
            .filter(Doctor.user_id == current_user.id)
            .first()
        )

        if doctor is None or consultation.doctor_id != doctor.id:
            raise HTTPException(
                status_code=403,
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
                status_code=403,
                detail="Access denied",
            )

    else:
        raise HTTPException(
            status_code=403,
            detail="Access denied",
        )

    if consultation.ai_assessment is None:
        raise HTTPException(
            status_code=404,
            detail="AI assessment has not been generated yet",
        )

    return consultation.ai_assessment