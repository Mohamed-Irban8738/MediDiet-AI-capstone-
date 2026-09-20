from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app.api.dependencies import get_current_user
from app.database.session import get_db
from app.models.consultation import AIAssessment, Consultation
from app.models.diet import DietPlan, Meal, MealLog
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.user import User
from app.schemas.diet import (
    DietPlanCreate,
    DietPlanResponse,
    MealCreate,
    MealLogCreate,
    MealLogResponse,
    MealResponse,
)
from app.services.diet_ai_service import diet_ai_service


router = APIRouter(
    prefix="/api/diets",
    tags=["Diets"],
)


# ============================================================
# CREATE MANUAL DIET PLAN
# ============================================================

@router.post(
    "/plans",
    response_model=DietPlanResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_diet_plan(
    data: DietPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Only doctors can create diet plans",
        )

    doctor = db.query(Doctor).filter(
        Doctor.user_id == current_user.id
    ).first()

    if not doctor:
        raise HTTPException(
            status_code=403,
            detail="Doctor profile not found",
        )

    patient = db.query(Patient).filter(
        Patient.id == data.patient_id
    ).first()

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    if data.consultation_id is not None:
        consultation = db.query(Consultation).filter(
            Consultation.id == data.consultation_id,
            Consultation.patient_id == data.patient_id,
        ).first()

        if not consultation:
            raise HTTPException(
                status_code=404,
                detail="Consultation not found for this patient",
            )

    diet_plan = DietPlan(
        patient_id=data.patient_id,
        doctor_id=doctor.id,
        consultation_id=data.consultation_id,
        name=data.name,
        goal=data.goal,
        daily_calories=data.daily_calories,
        start_date=data.start_date,
        end_date=data.end_date,
        status=data.status,
        notes=data.notes,
    )

    db.add(diet_plan)
    db.commit()
    db.refresh(diet_plan)

    return diet_plan


# ============================================================
# AI-GENERATED 7-DAY DIET PLAN
# ============================================================

@router.post(
    "/consultations/{consultation_id}/generate-ai",
    response_model=DietPlanResponse,
    status_code=status.HTTP_201_CREATED,
)
async def generate_ai_diet_plan(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # --------------------------------------------------------
    # 1. Only doctors can generate AI diet plans
    # --------------------------------------------------------

    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Only doctors can generate AI diet plans",
        )

    # --------------------------------------------------------
    # 2. Find logged-in doctor profile
    # --------------------------------------------------------

    doctor = db.query(Doctor).filter(
        Doctor.user_id == current_user.id
    ).first()

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor profile not found",
        )

    # --------------------------------------------------------
    # 3. Find consultation
    # --------------------------------------------------------

    consultation = db.query(Consultation).filter(
        Consultation.id == consultation_id
    ).first()

    if not consultation:
        raise HTTPException(
            status_code=404,
            detail="Consultation not found",
        )

    # --------------------------------------------------------
    # 4. Shared-patient architecture
    #
    # Any authenticated doctor can work with a consultation
    # belonging to any patient.
    #
    # We intentionally DO NOT check:
    #
    # consultation.doctor_id == doctor.id
    # --------------------------------------------------------

    # --------------------------------------------------------
    # 5. Find patient
    # --------------------------------------------------------

    patient = db.query(Patient).filter(
        Patient.id == consultation.patient_id
    ).first()

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    # --------------------------------------------------------
    # 6. Find existing AI assessment
    # --------------------------------------------------------

    ai_assessment = db.query(AIAssessment).filter(
        AIAssessment.consultation_id == consultation.id
    ).first()

    if not ai_assessment:
        raise HTTPException(
            status_code=404,
            detail="AI assessment has not been generated yet",
        )

    # --------------------------------------------------------
    # 7. Build patient context
    # --------------------------------------------------------

    patient_context = f"""
Name: {patient.name}
Age: {patient.age}
Gender: {patient.gender}
Height: {patient.height} cm
Weight: {patient.weight} kg
Medical Conditions: {patient.medical_conditions or "None provided"}
Allergies: {patient.allergies or "None provided"}
Dietary Preferences: {patient.dietary_preferences or "None provided"}
Activity Level: {patient.activity_level or "Not provided"}
"""

    # --------------------------------------------------------
    # 8. Build consultation context
    # --------------------------------------------------------

    consultation_context = f"""
Symptoms: {consultation.symptoms or "None provided"}
Doctor Diagnosis: {consultation.diagnosis or "None provided"}
Doctor Notes: {consultation.notes or "None provided"}
"""

    # --------------------------------------------------------
    # 9. Generate structured diet using Gemma
    # --------------------------------------------------------

    try:
        ai_diet = await diet_ai_service.generate_diet(
            patient_context=patient_context,
            consultation_context=consultation_context,
            ai_assessment=ai_assessment.response,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        )

    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"AI service unavailable: {str(exc)}",
        )

    # --------------------------------------------------------
    # 10. Verify exactly 7 days
    # --------------------------------------------------------

    if len(ai_diet.days) != 7:
        raise HTTPException(
            status_code=502,
            detail="AI did not generate exactly 7 days",
        )

    # --------------------------------------------------------
    # 11. Prevent duplicate draft plans
    # --------------------------------------------------------

    existing_plan = db.query(DietPlan).filter(
        DietPlan.consultation_id == consultation.id,
        DietPlan.status == "draft",
    ).first()

    if existing_plan:
        raise HTTPException(
            status_code=409,
            detail="A draft diet plan already exists for this consultation",
        )

    # --------------------------------------------------------
    # 12. Save DietPlan + Meals in one transaction
    # --------------------------------------------------------

    try:
        diet_plan = DietPlan(
            patient_id=patient.id,
            doctor_id=doctor.id,
            consultation_id=consultation.id,
            name=ai_diet.name,
            goal=ai_diet.goal,
            daily_calories=ai_diet.daily_calories,
            start_date=date.today(),
            status="draft",
            notes=ai_diet.notes,
        )

        db.add(diet_plan)

        # Get generated DietPlan ID before creating meals.
        db.flush()

        # ----------------------------------------------------
        # Create all meals
        # ----------------------------------------------------

        for day in ai_diet.days:
            for meal_data in day.meals:

                meal = Meal(
                    diet_plan_id=diet_plan.id,
                    name=meal_data.name,
                    meal_type=meal_data.meal_type,
                    day_number=day.day_number,
                    description=meal_data.description,
                    calories=meal_data.calories,
                    protein_g=meal_data.protein_g,
                    carbohydrates_g=meal_data.carbohydrates_g,
                    fat_g=meal_data.fat_g,
                    serving_size=meal_data.serving_size,
                    scheduled_time=meal_data.scheduled_time,
                )

                db.add(meal)

        # ----------------------------------------------------
        # Commit everything together
        # ----------------------------------------------------

        db.commit()

        # Reload DietPlan with meals
        saved_plan = (
            db.query(DietPlan)
            .options(selectinload(DietPlan.meals))
            .filter(DietPlan.id == diet_plan.id)
            .first()
        )

        return saved_plan

    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to save AI diet plan: {str(exc)}",
        )


# ============================================================
# GET DIET PLAN
# ============================================================

@router.get(
    "/plans/{diet_plan_id}",
    response_model=DietPlanResponse,
)
def get_diet_plan(
    diet_plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    diet_plan = (
        db.query(DietPlan)
        .options(selectinload(DietPlan.meals))
        .filter(DietPlan.id == diet_plan_id)
        .first()
    )

    if not diet_plan:
        raise HTTPException(
            status_code=404,
            detail="Diet plan not found",
        )

    # Patient can view their own diet plans.
    patient = db.query(Patient).filter(
        Patient.id == diet_plan.patient_id,
        Patient.user_id == current_user.id,
    ).first()

    # Any doctor can view the diet plan.
    doctor = None

    if current_user.role == "doctor":
        doctor = db.query(Doctor).filter(
            Doctor.user_id == current_user.id
        ).first()

    if not patient and not doctor:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to view this diet plan",
        )

    return diet_plan


# ============================================================
# GET PATIENT DIET PLANS
# ============================================================

@router.get(
    "/patient/{patient_id}",
    response_model=list[DietPlanResponse],
)
def get_patient_diet_plans(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Patient can see their own plans.
    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.user_id == current_user.id,
    ).first()

    if patient:
        plans = (
            db.query(DietPlan)
            .options(selectinload(DietPlan.meals))
            .filter(
                DietPlan.patient_id == patient_id
            )
            .order_by(DietPlan.created_at.desc())
            .all()
        )

        return plans

    # Any doctor can see plans for any patient.
    if current_user.role == "doctor":
        doctor = db.query(Doctor).filter(
            Doctor.user_id == current_user.id
        ).first()

        if not doctor:
            raise HTTPException(
                status_code=403,
                detail="Doctor profile not found",
            )

        plans = (
            db.query(DietPlan)
            .options(selectinload(DietPlan.meals))
            .filter(
                DietPlan.patient_id == patient_id,
            )
            .order_by(DietPlan.created_at.desc())
            .all()
        )

        return plans

    raise HTTPException(
        status_code=403,
        detail="Not authorized to view these diet plans",
    )


# ============================================================
# CREATE MANUAL MEAL
# ============================================================

@router.post(
    "/plans/{diet_plan_id}/meals",
    response_model=MealResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_meal(
    diet_plan_id: int,
    data: MealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    diet_plan = db.query(DietPlan).filter(
        DietPlan.id == diet_plan_id
    ).first()

    if not diet_plan:
        raise HTTPException(
            status_code=404,
            detail="Diet plan not found",
        )

    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Only doctors can add meals",
        )

    doctor = db.query(Doctor).filter(
        Doctor.user_id == current_user.id
    ).first()

    if not doctor:
        raise HTTPException(
            status_code=403,
            detail="Doctor profile not found",
        )

    meal = Meal(
        diet_plan_id=diet_plan.id,
        name=data.name,
        meal_type=data.meal_type,
        day_number=data.day_number,
        description=data.description,
        calories=data.calories,
        protein_g=data.protein_g,
        carbohydrates_g=data.carbohydrates_g,
        fat_g=data.fat_g,
        serving_size=data.serving_size,
        scheduled_time=data.scheduled_time,
    )

    db.add(meal)
    db.commit()
    db.refresh(meal)

    return meal

# ============================================================
# GET PATIENT MEAL LOGS
# ============================================================

@router.get(
    "/patient/{patient_id}/meal-logs",
    response_model=list[MealLogResponse],
)
def get_patient_meal_logs(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "patient":
        raise HTTPException(
            status_code=403,
            detail="Only patients can access meal logs",
        )

    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.user_id == current_user.id,
    ).first()

    if not patient:
        raise HTTPException(
            status_code=403,
            detail="Access denied",
        )

    logs = (
        db.query(MealLog)
        .filter(
            MealLog.patient_id == patient.id
        )
        .order_by(
            MealLog.consumed_at.desc()
        )
        .all()
    )

    return logs
# ============================================================
# LOG MEAL
# ============================================================

@router.post(
    "/meals/{meal_id}/log",
    response_model=MealLogResponse,
    status_code=status.HTTP_201_CREATED,
)
def log_meal(
    meal_id: int,
    data: MealLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meal = db.query(Meal).filter(
        Meal.id == meal_id
    ).first()

    if not meal:
        raise HTTPException(
            status_code=404,
            detail="Meal not found",
        )

    patient = db.query(Patient).filter(
        Patient.id == (
            db.query(DietPlan.patient_id)
            .filter(DietPlan.id == meal.diet_plan_id)
            .scalar_subquery()
        ),
        Patient.user_id == current_user.id,
    ).first()

    if not patient:
        raise HTTPException(
            status_code=403,
            detail="Only the assigned patient can log this meal",
        )

    meal_log = MealLog(
        meal_id=meal.id,
        patient_id=patient.id,
        consumed_at=data.consumed_at,
        status=data.status,
        notes=data.notes,
    )

    db.add(meal_log)
    db.commit()
    db.refresh(meal_log)

    return meal_log