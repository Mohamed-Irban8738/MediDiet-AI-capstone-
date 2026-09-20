from datetime import datetime

from pydantic import BaseModel


class ConsultationCreate(BaseModel):
    patient_id: int
    symptoms: str | None = None
    diagnosis: str | None = None
    notes: str | None = None


class ConsultationResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    doctor_name: str
    symptoms: str | None
    diagnosis: str | None
    notes: str | None
    consultation_date: datetime

    class Config:
        from_attributes = True