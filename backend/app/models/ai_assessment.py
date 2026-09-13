from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class AIAssessment(Base):
    __tablename__ = "ai_assessments"

    id: Mapped[int] = mapped_column(primary_key=True)

    consultation_id: Mapped[int] = mapped_column(
        ForeignKey("consultations.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    prompt: Mapped[str] = mapped_column(Text, nullable=False)

    response: Mapped[str] = mapped_column(Text, nullable=False)

    model_name: Mapped[str] = mapped_column(nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    consultation = relationship(
        "Consultation",
        back_populates="ai_assessment",
    )