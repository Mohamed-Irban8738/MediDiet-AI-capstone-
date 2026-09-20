from pydantic import BaseModel, EmailStr, Field


class PatientCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

    name: str = Field(..., min_length=2, max_length=150)
    age: int | None = Field(default=None, ge=0, le=150)
    gender: str | None = Field(default=None, max_length=50)

    height: float | None = Field(default=None, gt=0)
    weight: float | None = Field(default=None, gt=0)

    medical_conditions: str | None = None
    allergies: str | None = None
    dietary_preferences: str | None = None
    activity_level: str | None = None


class PatientResponse(BaseModel):
    id: int
    user_id: int
    name: str
    age: int | None
    gender: str | None
    height: float | None
    weight: float | None
    medical_conditions: str | None
    allergies: str | None
    dietary_preferences: str | None
    activity_level: str | None

    class Config:
        from_attributes = True