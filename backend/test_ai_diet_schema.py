from app.schemas.ai_diet import AIDietPlan


test_data = {
    "name": "Test 7 Day Diet",
    "goal": "Balanced nutrition",
    "daily_calories": 2000,
    "notes": "Schema validation test",
    "days": [
        {
            "day_number": day,
            "meals": [
                {
                    "name": f"Test Breakfast Day {day}",
                    "meal_type": "breakfast",
                    "day_number": day,
                    "description": "Test meal",
                    "calories": 350,
                    "protein_g": 12,
                    "carbohydrates_g": 50,
                    "fat_g": 10,
                    "serving_size": "1 bowl",
                    "scheduled_time": "08:00",
                }
            ],
        }
        for day in range(1, 8)
    ],
}


diet = AIDietPlan.model_validate(test_data)

print("AI diet schema validation successful")
print("Plan:", diet.name)
print("Days:", len(diet.days))
print("First day:", diet.days[0].day_number)
print("Last day:", diet.days[-1].day_number)