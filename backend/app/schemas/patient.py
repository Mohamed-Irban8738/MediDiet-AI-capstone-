from pydantic import BaseModel, Field


class PatientCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    age: int = Field(..., ge=1, le=120)
    gender: str = Field(..., max_length=20)
    height: float = Field(..., gt=0)
    weight: float = Field(..., gt=0)

    medical_conditions: str | None = None
    allergies: str | None = None
    dietary_preferences: str | None = None
    activity_level: str | None = None


class PatientResponse(BaseModel):
    id: int
    user_id: int
    name: str
    age: int
    gender: str
    height: float
    weight: float
    medical_conditions: str | None
    allergies: str | None
    dietary_preferences: str | None
    activity_level: str | None

    class Config:
        from_attributes = True