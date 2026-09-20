from sqlalchemy import ForeignKey, String, Text, Float, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[str] = mapped_column(String(20), nullable=False)
    height: Mapped[float] = mapped_column(Float, nullable=False)
    weight: Mapped[float] = mapped_column(Float, nullable=False)
    medical_conditions: Mapped[str | None] = mapped_column(Text, nullable=True)
    allergies: Mapped[str | None] = mapped_column(Text, nullable=True)
    dietary_preferences: Mapped[str | None] = mapped_column(Text, nullable=True)
    activity_level: Mapped[str | None] = mapped_column(String(30), nullable=True)

    user = relationship("User", back_populates="patient")
    consultations = relationship("Consultation", back_populates="patient", cascade="all, delete-orphan")
    diet_plans = relationship("DietPlan", back_populates="patient", cascade="all, delete-orphan")
    meal_logs = relationship("MealLog", back_populates="patient", cascade="all, delete-orphan")
    medical_condition_records = relationship("MedicalCondition", back_populates="patient", cascade="all, delete-orphan")
    allergy_records = relationship("Allergy", back_populates="patient", cascade="all, delete-orphan")
    vital_records = relationship("VitalRecord", back_populates="patient", cascade="all, delete-orphan")
    weight_records = relationship("WeightRecord", back_populates="patient", cascade="all, delete-orphan")
