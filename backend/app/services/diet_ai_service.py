import json

from app.schemas.ai_diet import AIDietPlan
from app.services.ollama_service import ollama


class DietAIService:
    async def generate_diet(
        self,
        patient_context: str,
        consultation_context: str,
        ai_assessment: str,
    ) -> AIDietPlan:

        prompt = f"""
You are MediDiet-AI, an AI nutrition planning assistant.

You are assisting a qualified doctor.

Create a practical 7-day vegetarian diet plan based ONLY on the information provided.

IMPORTANT:
- Do not invent medical conditions.
- Do not prescribe medication.
- Do not claim to replace a doctor.
- Respect allergies and dietary preferences.
- Generate exactly 7 days.
- Generate exactly 3 meals per day.
- Use breakfast, lunch, and dinner.
- Every meal must have the correct day_number.
- Use realistic Indian vegetarian meals where appropriate.
- Use concise descriptions.
- Use approximate nutritional values.
- Do not include unnecessary explanations.
- Return ONLY JSON matching the provided schema.

PATIENT INFORMATION
-------------------
{patient_context}

CONSULTATION INFORMATION
------------------------
{consultation_context}

EXISTING AI NUTRITION ASSESSMENT
--------------------------------
{ai_assessment}

Generate the complete 7-day diet plan.
"""

        # Use the actual Pydantic JSON schema.
        json_schema = AIDietPlan.model_json_schema()

        response = await ollama.generate(
            prompt,
            format=json_schema,
        )

        cleaned = response.strip()

        # ----------------------------------------------------
        # Remove accidental Markdown code fences
        # ----------------------------------------------------

        if cleaned.startswith("```"):
            lines = cleaned.splitlines()

            if lines and lines[0].strip().startswith("```"):
                lines = lines[1:]

            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]

            cleaned = "\n".join(lines).strip()

        # ----------------------------------------------------
        # Parse JSON
        # ----------------------------------------------------

        try:
            data = json.loads(cleaned)

        except json.JSONDecodeError as exc:
            raise ValueError(
                f"Gemma returned invalid JSON: {exc}"
            ) from exc

        # ----------------------------------------------------
        # Pydantic validation
        # ----------------------------------------------------

        try:
            diet = AIDietPlan.model_validate(data)

        except Exception as exc:
            raise ValueError(
                f"Gemma returned data that failed validation: {exc}"
            ) from exc

        # ----------------------------------------------------
        # Verify exactly 7 days
        # ----------------------------------------------------

        if len(diet.days) != 7:
            raise ValueError(
                f"Gemma returned {len(diet.days)} days instead of exactly 7"
            )

        # ----------------------------------------------------
        # Verify day numbers
        # ----------------------------------------------------

        day_numbers = sorted(
            day.day_number
            for day in diet.days
        )

        if day_numbers != list(range(1, 8)):
            raise ValueError(
                f"Invalid day numbers returned by Gemma: {day_numbers}"
            )

        # ----------------------------------------------------
        # Verify meals
        # ----------------------------------------------------

        for day in diet.days:

            if not day.meals:
                raise ValueError(
                    f"Day {day.day_number} contains no meals"
                )

            for meal in day.meals:

                if meal.day_number != day.day_number:
                    raise ValueError(
                        f"Meal '{meal.name}' has day_number "
                        f"{meal.day_number}, but belongs to "
                        f"Day {day.day_number}"
                    )

        return diet


diet_ai_service = DietAIService()