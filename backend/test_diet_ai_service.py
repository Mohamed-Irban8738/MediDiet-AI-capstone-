import asyncio

from app.services.diet_ai_service import diet_ai_service


async def main():
    patient_context = """
Name: Test Patient
Age: 30
Gender: Male
Height: 170 cm
Weight: 70 kg
Medical Conditions: None provided
Allergies: None provided
Dietary Preferences: Vegetarian
Activity Level: Moderate
"""

    consultation_context = """
Symptoms: None
Doctor Diagnosis: General nutritional guidance
Doctor Notes: Focus on balanced meals and regular meal timing.
"""

    ai_assessment = """
Nutrition observations:
- Patient requires a balanced dietary pattern.

Dietary approach:
- Emphasize vegetables, whole grains, legumes and adequate protein.

Precautions:
- Monitor nutritional needs during follow-up.
"""

    try:
        diet = await diet_ai_service.generate_diet(
            patient_context=patient_context,
            consultation_context=consultation_context,
            ai_assessment=ai_assessment,
        )

        print("AI diet generation successful")
        print("Plan:", diet.name)
        print("Goal:", diet.goal)
        print("Days:", len(diet.days))

        for day in diet.days:
            print(
                f"Day {day.day_number}: "
                f"{len(day.meals)} meals"
            )

    except Exception as exc:
        print("AI diet generation failed")
        print(type(exc).__name__, ":", exc)


if __name__ == "__main__":
    asyncio.run(main())