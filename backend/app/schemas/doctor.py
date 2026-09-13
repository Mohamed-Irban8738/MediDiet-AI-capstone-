from pydantic import BaseModel, Field


class DoctorCreate(BaseModel):
    first_name: str = Field(..., min_length=2, max_length=100)
    last_name: str = Field(..., min_length=2, max_length=100)
    specialization: str | None = Field(default=None, max_length=150)
    license_number: str | None = Field(default=None, max_length=100)
    phone: str | None = Field(default=None, max_length=30)


class DoctorResponse(BaseModel):
    id: int
    user_id: int
    first_name: str
    last_name: str
    specialization: str | None
    license_number: str | None
    phone: str | None

    class Config:
        from_attributes = True