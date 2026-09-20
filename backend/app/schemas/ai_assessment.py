from datetime import datetime
from pydantic import BaseModel


class AIAssessmentResponse(BaseModel):
    id: int
    consultation_id: int
    prompt: str
    response: str
    model_name: str
    created_at: datetime

    class Config:
        from_attributes = True
