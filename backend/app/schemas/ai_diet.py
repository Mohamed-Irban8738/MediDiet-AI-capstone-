from decimal import Decimal

from pydantic import BaseModel, Field


class AIDietMeal(BaseModel):
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


class AIDietDay(BaseModel):
    day_number: int = Field(..., ge=1, le=7)
    meals: list[AIDietMeal] = Field(..., min_length=1)


class AIDietPlan(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    goal: str | None = None
    daily_calories: Decimal | None = Field(default=None, ge=0)

    notes: str | None = None

    days: list[AIDietDay] = Field(..., min_length=7, max_length=7)