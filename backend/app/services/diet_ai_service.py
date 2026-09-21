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
- Return ONLY ONE VALID JSON OBJECT.
- The root object MUST contain: name, goal, daily_calories, notes, days.
- Do NOT return markdown.
- Do NOT use ``` fences.
- Do NOT include any text before or after the JSON.
- Use double quotes for all JSON keys and string values.
- All strings MUST be properly closed.
- All arrays and objects MUST be properly closed.
- Do not use trailing commas.
- Do not use comments.
- Do not use single quotes.
- Do not include newline characters inside JSON string values.
- The "days" array MUST contain exactly 7 day objects.
- Day numbers MUST be exactly 1, 2, 3, 4, 5, 6, 7.
- Each day MUST contain exactly 3 meals.
- Each meal MUST contain the fields:
  name, meal_type, day_number, description, calories,
  protein_g, carbohydrates_g, fat_g, serving_size, scheduled_time.
- meal_type MUST be exactly one of:
  breakfast, lunch, dinner.
- Each meal's day_number MUST match its parent day.
- Do not invent medical conditions.
- Do not prescribe medication.
- Respect allergies.
- Respect dietary preferences.
- Use realistic Indian vegetarian meals where appropriate.
- Use concise descriptions.
- Use approximate nutritional values.

REQUIRED JSON STRUCTURE:

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
          "description": "Vegetable semolina upma with mixed vegetables.",
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

The structure above is only an example.

You MUST generate all 7 days.
You MUST generate exactly 3 meals for every day.

PATIENT INFORMATION
-------------------
{patient_context}

CONSULTATION INFORMATION
------------------------
{consultation_context}

EXISTING AI NUTRITION ASSESSMENT
--------------------------------
{ai_assessment}

Generate the complete 7-day diet plan now.

FINAL REQUIREMENT:
Return ONLY valid JSON.
"""

        json_schema = AIDietPlan.model_json_schema()

        async def clean_response(response: str) -> str:
            cleaned = response.strip()

            if cleaned.startswith("```"):
                lines = cleaned.splitlines()

                if lines and lines[0].strip().startswith("```"):
                    lines = lines[1:]

                if lines and lines[-1].strip() == "```":
                    lines = lines[:-1]

                cleaned = "\n".join(lines).strip()

            return cleaned

        # --------------------------------------------------
        # First AI request
        # --------------------------------------------------

        response = await ollama.generate(
            prompt,
            format=json_schema,
        )

        cleaned = await clean_response(response)

        # --------------------------------------------------
        # Parse first response
        # --------------------------------------------------

        try:
            data = json.loads(cleaned)

        except json.JSONDecodeError:
            # --------------------------------------------------
            # Retry once with a strict JSON repair prompt
            # --------------------------------------------------

            retry_prompt = f"""
You previously generated an invalid JSON response.

Generate the complete 7-day vegetarian diet plan again.

CRITICAL JSON RULES:
- Return ONLY ONE JSON OBJECT.
- No markdown.
- No ``` fences.
- No explanations.
- No comments.
- Use double quotes only.
- Every string must have a closing double quote.
- Every object must have matching {{ and }}.
- Every array must have matching [ and ].
- No trailing commas.
- Do not put line breaks inside string values.

ROOT OBJECT:
{{
  "name": "7-Day Vegetarian Diet Plan",
  "goal": "Dietary management and balanced nutrition",
  "daily_calories": 1800,
  "notes": "General dietary guidance for doctor review.",
  "days": []
}}

The "days" array MUST contain exactly 7 objects.

Each day MUST have:
- day_number
- meals

Each day MUST contain exactly 3 meals.

Each meal MUST have:
- name
- meal_type
- day_number
- description
- calories
- protein_g
- carbohydrates_g
- fat_g
- serving_size
- scheduled_time

meal_type must be:
breakfast, lunch, or dinner.

Day numbers must be:
1, 2, 3, 4, 5, 6, 7.

The meal day_number must match the parent day.

PATIENT INFORMATION
-------------------
{patient_context}

CONSULTATION INFORMATION
------------------------
{consultation_context}

EXISTING AI NUTRITION ASSESSMENT
--------------------------------
{ai_assessment}

RETURN ONLY THE COMPLETE VALID JSON OBJECT.
"""

            retry_response = await ollama.generate(
                retry_prompt,
                format=json_schema,
            )

            cleaned = await clean_response(retry_response)

            try:
                data = json.loads(cleaned)

            except json.JSONDecodeError as exc:
                raise ValueError(
                    f"AI returned invalid JSON after retry: {exc}"
                ) from exc

        # --------------------------------------------------
        # Pydantic validation
        # --------------------------------------------------

        try:
            diet = AIDietPlan.model_validate(data)

        except Exception as exc:
            raise ValueError(
                f"AI returned data that failed validation: {exc}"
            ) from exc

        # --------------------------------------------------
        # Verify exactly 7 days
        # --------------------------------------------------

        if len(diet.days) != 7:
            raise ValueError(
                f"AI returned {len(diet.days)} days instead of exactly 7"
            )

        # --------------------------------------------------
        # Verify day numbers
        # --------------------------------------------------

        day_numbers = sorted(
            day.day_number
            for day in diet.days
        )

        if day_numbers != list(range(1, 8)):
            raise ValueError(
                f"Invalid day numbers returned by AI: {day_numbers}"
            )

        # --------------------------------------------------
        # Verify exactly 3 meals per day
        # --------------------------------------------------

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

            if meal_types != {
                "breakfast",
                "lunch",
                "dinner",
            }:
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