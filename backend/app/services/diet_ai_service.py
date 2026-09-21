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

IMPORTANT RULES:
- Return ONLY ONE JSON OBJECT.
- Do NOT return a meal object by itself.
- Do NOT return a day object by itself.
- The JSON root object MUST contain exactly these main fields:
  "name"
  "goal"
  "daily_calories"
  "notes"
  "days"
- "days" MUST be an array containing exactly 7 day objects.
- Each day object MUST contain:
  "day_number"
  "meals"
- Each day MUST contain exactly 3 meals.
- Each meal MUST contain:
  "name"
  "meal_type"
  "day_number"
  "description"
  "calories"
  "protein_g"
  "carbohydrates_g"
  "fat_g"
  "serving_size"
  "scheduled_time"
- meal_type MUST be one of:
  "breakfast", "lunch", "dinner"
- day_number MUST match the day containing the meal.
- Day numbers MUST be exactly 1, 2, 3, 4, 5, 6, 7.
- Do not invent medical conditions.
- Do not prescribe medication.
- Respect allergies.
- Respect dietary preferences.
- Use realistic Indian vegetarian meals where appropriate.
- Use concise descriptions.
- Use approximate nutritional values.
- Do not include markdown.
- Do not include ``` fences.
- Do not include explanations outside the JSON object.

The required structure is:

{{
  "name": "7-Day Vegetarian Diet Plan",
  "goal": "Dietary management and balanced nutrition",
  "daily_calories": 1800,
  "notes": "General dietary guidance for doctor review.",
  "days": [
    {{
      "day_number": 1,
      "meals": [
        {{
          "name": "Vegetable Upma",
          "meal_type": "breakfast",
          "day_number": 1,
          "description": "Vegetable semolina upma with vegetables.",
          "calories": 300,
          "protein_g": 8,
          "carbohydrates_g": 45,
          "fat_g": 9,
          "serving_size": "1 bowl",
          "scheduled_time": "08:00"
        }},
        {{
          "name": "Vegetable Rice and Dal",
          "meal_type": "lunch",
          "day_number": 1,
          "description": "Brown rice with dal and mixed vegetables.",
          "calories": 500,
          "protein_g": 18,
          "carbohydrates_g": 70,
          "fat_g": 12,
          "serving_size": "1 plate",
          "scheduled_time": "13:00"
        }},
        {{
          "name": "Vegetable Roti",
          "meal_type": "dinner",
          "day_number": 1,
          "description": "Whole wheat roti with mixed vegetable curry.",
          "calories": 450,
          "protein_g": 14,
          "carbohydrates_g": 60,
          "fat_g": 12,
          "serving_size": "2 rotis",
          "scheduled_time": "19:30"
        }}
      ]
    }}
  ]
}}

The example above only demonstrates the structure.
You MUST generate all 7 days.

PATIENT INFORMATION
-------------------
{patient_context}

CONSULTATION INFORMATION
------------------------
{consultation_context}

EXISTING AI NUTRITION ASSESSMENT
--------------------------------
{ai_assessment}

Now generate the complete 7-day diet plan.

Remember:
THE ROOT MUST BE A DIET PLAN OBJECT.
THE ROOT MUST HAVE "name" AND "days".
THE "days" ARRAY MUST CONTAIN 7 DAYS.
EACH DAY MUST CONTAIN 3 MEALS.
RETURN ONLY JSON.
"""

        json_schema = AIDietPlan.model_json_schema()

        response = await ollama.generate(
            prompt,
            format=json_schema,
        )

        cleaned = response.strip()

        if cleaned.startswith("```"):
            lines = cleaned.splitlines()

            if lines and lines[0].strip().startswith("```"):
                lines = lines[1:]

            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]

            cleaned = "\n".join(lines).strip()

        try:
            data = json.loads(cleaned)

        except json.JSONDecodeError as exc:
            raise ValueError(
                f"AI returned invalid JSON: {exc}"
            ) from exc

        try:
            diet = AIDietPlan.model_validate(data)

        except Exception as exc:
            raise ValueError(
                f"AI returned data that failed validation: {exc}"
            ) from exc

        if len(diet.days) != 7:
            raise ValueError(
                f"AI returned {len(diet.days)} days instead of exactly 7"
            )

        day_numbers = sorted(
            day.day_number
            for day in diet.days
        )

        if day_numbers != list(range(1, 8)):
            raise ValueError(
                f"Invalid day numbers returned by AI: {day_numbers}"
            )

        for day in diet.days:

            if len(day.meals) != 3:
                raise ValueError(
                    f"Day {day.day_number} contains "
                    f"{len(day.meals)} meals instead of exactly 3"
                )

            meal_types = {
                meal.meal_type.lower()
                for meal in day.meals
            }

            if meal_types != {"breakfast", "lunch", "dinner"}:
                raise ValueError(
                    f"Day {day.day_number} must contain "
                    "breakfast, lunch, and dinner"
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