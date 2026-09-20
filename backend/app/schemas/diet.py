from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class MealCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    meal_type: str = Field(..., min_length=2, max_length=30)
    day_number: int = Field(..., ge=1, le=7)
    description: str | None = None
    calories: Decimal | None = Field(default=None, ge=0)
    protein_g: Decimal | None = Field(default=None, ge=0)
    carbohydrates_g: Decimal | None = Field(default=None, ge=0)
    fat_g: Decimal | None = Field(default=None, ge=0)
    serving_size: str | None = Field(default=None, max_length=100)
    scheduled_time: str | None = Field(default=None, max_length=20)


class MealResponse(BaseModel):
    id: int
    diet_plan_id: int
    name: str
    meal_type: str
    day_number: int
    description: str | None
    calories: Decimal | None
    protein_g: Decimal | None
    carbohydrates_g: Decimal | None
    fat_g: Decimal | None
    serving_size: str | None
    scheduled_time: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class DietPlanCreate(BaseModel):
    patient_id: int
    consultation_id: int | None = None
    name: str = Field(..., min_length=2, max_length=150)
    goal: str | None = None
    daily_calories: Decimal | None = Field(default=None, ge=0)
    start_date: date
    end_date: date | None = None
    status: str = Field(default="draft", max_length=30)
    notes: str | None = None


class DietPlanResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    consultation_id: int | None
    name: str
    goal: str | None
    daily_calories: Decimal | None
    start_date: date
    end_date: date | None
    status: str
    notes: str | None
    created_at: datetime
    meals: list[MealResponse] = []

    class Config:
        from_attributes = True


class MealLogCreate(BaseModel):
    consumed_at: datetime | None = None
    status: str = Field(default="completed", max_length=30)
    notes: str | None = None


class MealLogResponse(BaseModel):
    id: int
    meal_id: int
    patient_id: int
    consumed_at: datetime | None
    status: str
    notes: str | None
    created_at: datetime

    class Config:
        from_attributes = True
        