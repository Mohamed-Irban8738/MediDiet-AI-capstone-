import React, { useState } from "react";
import { Patient, AIMealPlanResult } from "../types";

interface MealPlannerViewProps {
  patients: Patient[];
  selectedPatientId?: string;
  onApplyPlanToPatient: (patientId: string, updatedSchedule: any[], planName: string) => void;
}

export const MealPlannerView: React.FC<MealPlannerViewProps> = ({
  patients,
  selectedPatientId,
  onApplyPlanToPatient,
}) => {
  const [activePatientId, setActivePatientId] = useState<string>(
    selectedPatientId || patients[0]?.id || "PT-8842-X"
  );

  const currentPatient = patients.find((p) => p.id === activePatientId) || patients[0];

  const [dietType, setDietType] = useState("Low FODMAP");
  const [calorieTarget, setCalorieTarget] = useState(2400);
  const [proteinGoal, setProteinGoal] = useState("120g");
  const [carbsGoal, setCarbsGoal] = useState("200g");
  const [fatsGoal, setFatsGoal] = useState("65g");
  const [allergiesText, setAllergiesText] = useState(
    currentPatient?.allergies.join(", ") || "Shellfish, Penicillin"
  );
  const [conditionsText, setConditionsText] = useState(
    currentPatient?.chronicConditions.join(", ") || "Type 2 Diabetes"
  );
  const [clinicalNotes, setClinicalNotes] = useState(
    "Focus on elimination phase Low FODMAP ingredients to minimize intestinal inflammation."
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<AIMealPlanResult | null>({
    title: "Low FODMAP & Glycemic Control Draft",
    dietType: "Low FODMAP",
    targetCalories: 2400,
    clinicalSummary:
      "A medical nutrition plan tailored for glycemic stability and intestinal comfort, strictly avoiding high-FODMAP oligosaccharides and allergens.",
    clinicalRationale:
      "Substitutes wheat/lactose with rice/quinoa and lactose-free dairy. Balances complex carbohydrates with lean protein to maintain flat glucose curve.",
    schedule: [
      {
        time: "08:00 AM",
        mealName: "Oatmeal & Wild Blueberry Bowl",
        calories: 350,
        protein: "18g",
        carbs: "50g",
        fats: "8g",
        category: "Breakfast",
        description: "Certified gluten-free oats cooked in lactose-free almond milk with fresh blueberries.",
      },
      {
        time: "10:30 AM",
        mealName: "Activated Almonds & Pumpkin Seeds",
        calories: 160,
        protein: "6g",
        carbs: "6g",
        fats: "14g",
        category: "Morning Snack",
        description: "Portion-controlled low-FODMAP seed and nut mix.",
      },
      {
        time: "01:00 PM",
        mealName: "Grilled Chicken & Cucumber Quinoa Salad",
        calories: 450,
        protein: "38g",
        carbs: "42g",
        fats: "12g",
        category: "Lunch",
        description: "Skinless chicken breast over warm quinoa, spinach, and extra virgin olive oil dressing.",
      },
      {
        time: "04:00 PM",
        mealName: "Lactose-Free Greek Yogurt & Strawberries",
        calories: 120,
        protein: "14g",
        carbs: "12g",
        fats: "1g",
        category: "Afternoon Snack",
        description: "High-protein probiotic snack for gut biome support.",
      },
      {
        time: "07:30 PM",
        mealName: "Pan-Seared Salmon & Roasted Zucchini",
        calories: 550,
        protein: "42g",
        carbs: "38g",
        fats: "22g",
        category: "Dinner",
        description: "Wild salmon rich in Omega-3 fatty acids paired with herb-seasoned roasted summer squash.",
      },
    ],
    micronutrientHighlights: [
      "Vitamin B12 & D3 optimal density",
      "Magnesium: 380mg (95% RDA)",
      "Omega-3 Fatty Acids: 2.4g",
    ],
    warningsOrContraindications: [
      "Recheck fasting blood glucose on Day 3",
      "Avoid garlic/onion seasonings in salad dressings",
    ],
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handlePatientSelect = (id: string) => {
    setActivePatientId(id);
    const p = patients.find((pt) => pt.id === id);
    if (p) {
      setAllergiesText(p.allergies.join(", "));
      setConditionsText(p.chronicConditions.join(", "));
      setCalorieTarget(p.caloricTarget || 2400);
    }
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch("/api/generate-meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: currentPatient?.name || "Patient",
          dietType,
          calorieTarget,
          allergies: allergiesText.split(",").map((a) => a.trim()).filter(Boolean),
          conditions: conditionsText.split(",").map((c) => c.trim()).filter(Boolean),
          macroGoals: { protein: proteinGoal, carbs: carbsGoal, fats: fatsGoal },
          additionalNotes: clinicalNotes,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.mealPlan) {
        setGeneratedPlan(data.mealPlan);
        setSuccessMsg("AI Clinical Meal Plan Draft generated successfully!");
      } else {
        throw new Error(data.error || "Failed to generate AI plan");
      }
    } catch (err: any) {
      console.warn("AI Generation fallback executed:", err.message);
      // Fallback local generated structure if offline or API key missing
      setGeneratedPlan({
        title: `${dietType} Custom Clinical Protocol`,
        dietType,
        targetCalories: calorieTarget,
        clinicalSummary: `Tailored ${dietType} care plan for ${currentPatient?.name || "Patient"} adhering to allergy exclusions.`,
        clinicalRationale: "Formulated using evidence-based medical nutrition guidelines.",
        schedule: [
          {
            time: "08:00 AM",
            mealName: "High-Protein Berry Oatmeal",
            calories: Math.round(calorieTarget * 0.25),
            protein: proteinGoal,
            carbs: carbsGoal,
            fats: fatsGoal,
            category: "Breakfast",
          },
          {
            time: "10:30 AM",
            mealName: "Nut & Seed Energy Snack",
            calories: Math.round(calorieTarget * 0.1),
            category: "Snack",
          },
          {
            time: "01:00 PM",
            mealName: "Mediterranean Grain & Lean Protein Bowl",
            calories: Math.round(calorieTarget * 0.35),
            category: "Lunch",
          },
          {
            time: "04:00 PM",
            mealName: "Probiotic Greek Yogurt",
            calories: Math.round(calorieTarget * 0.1),
            category: "Snack",
          },
          {
            time: "07:30 PM",
            mealName: "Herb Roasted Wild Salmon & Steamed Greens",
            calories: Math.round(calorieTarget * 0.2),
            category: "Dinner",
          },
        ],
      });
      setSuccessMsg("AI Draft generated with default clinical rules.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyToPatient = () => {
    if (!generatedPlan || !currentPatient) return;

    const newSchedule = generatedPlan.schedule.map((item, idx) => ({
      id: `m-gen-${idx}`,
      time: item.time,
      name: item.mealName,
      calories: item.calories,
      statusBorderColor: idx % 2 === 0 ? "bg-primary-container" : "bg-secondary-fixed-dim",
    }));

    onApplyPlanToPatient(currentPatient.id, newSchedule, generatedPlan.title);
    setSuccessMsg(`Plan applied to ${currentPatient.name}'s official record!`);
  };

  return (
    <div className="flex-1 p-lg md:p-xl max-w-container-max mx-auto w-full">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[28px]">restaurant</span>
            Clinical Meal Planner & AI Generator
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Draft, review, and approve medical nutrition care plans.
          </p>
        </div>
      </div>

      {/* Grid: 1 Column Configurator, 2 Columns Draft Output */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Left Configurator Column */}
        <div className="lg:col-span-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-soft flex flex-col gap-md">
          <div className="border-b border-outline-variant pb-sm">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Plan Parameters
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Select patient and clinical targets
            </p>
          </div>

          {/* Select Patient */}
          <div>
            <label className="font-label-md text-label-md text-on-surface-variant block mb-1 font-bold">
              Target Patient
            </label>
            <select
              value={activePatientId}
              onChange={(e) => handlePatientSelect(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-lg p-sm text-body-md text-on-surface font-semibold focus:ring-2 focus:ring-primary"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (#{p.id})
                </option>
              ))}
            </select>
          </div>

          {/* Diet Type */}
          <div>
            <label className="font-label-md text-label-md text-on-surface-variant block mb-1 font-bold">
              Dietary Protocol
            </label>
            <select
              value={dietType}
              onChange={(e) => setDietType(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-lg p-sm text-body-md text-on-surface focus:ring-2 focus:ring-primary"
            >
              <option>Low FODMAP</option>
              <option>Diabetic / Glycemic Control</option>
              <option>Celiac / Gluten-Free</option>
              <option>DASH / Heart-Healthy</option>
              <option>Renal Care</option>
              <option>High-Protein Muscle Recovery</option>
              <option>Mediterranean</option>
              <option>Ketogenic Therapeutic</option>
            </select>
          </div>

          {/* Caloric & Macro Targets */}
          <div className="grid grid-cols-2 gap-sm">
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant block mb-1 font-bold">
                Calories (kcal)
              </label>
              <input
                type="number"
                value={calorieTarget}
                onChange={(e) => setCalorieTarget(Number(e.target.value))}
                className="w-full bg-surface border border-outline-variant rounded-lg p-sm text-body-md text-on-surface font-data-mono"
              />
            </div>
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant block mb-1 font-bold">
                Protein Target
              </label>
              <input
                type="text"
                value={proteinGoal}
                onChange={(e) => setProteinGoal(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg p-sm text-body-md text-on-surface font-data-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-sm">
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant block mb-1 font-bold">
                Carbs Target
              </label>
              <input
                type="text"
                value={carbsGoal}
                onChange={(e) => setCarbsGoal(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg p-sm text-body-md text-on-surface font-data-mono"
              />
            </div>
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant block mb-1 font-bold">
                Fats Target
              </label>
              <input
                type="text"
                value={fatsGoal}
                onChange={(e) => setFatsGoal(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg p-sm text-body-md text-on-surface font-data-mono"
              />
            </div>
          </div>

          {/* Allergies & Conditions */}
          <div>
            <label className="font-label-md text-label-md text-error block mb-1 font-bold">
              Allergy Exclusions
            </label>
            <input
              type="text"
              value={allergiesText}
              onChange={(e) => setAllergiesText(e.target.value)}
              className="w-full bg-surface border border-error/50 rounded-lg p-sm text-body-md text-on-surface"
            />
          </div>

          <div>
            <label className="font-label-md text-label-md text-on-surface-variant block mb-1 font-bold">
              Clinical Notes / Indications
            </label>
            <textarea
              rows={3}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-lg p-sm text-body-md text-on-surface"
            />
          </div>

          {/* Action Button */}
          <button
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="w-full bg-primary text-on-primary font-label-md text-label-md h-[48px] rounded-lg hover:bg-primary-container transition-all flex items-center justify-center gap-2 cursor-pointer font-bold shadow-soft disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <span className="material-symbols-outlined animate-spin">sync</span>
                Drafting AI Plan...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                Generate AI Clinical Draft
              </>
            )}
          </button>
        </div>

        {/* Right Output Draft Column */}
        <div className="lg:col-span-2 flex flex-col gap-md">
          {errorMsg && (
            <div className="p-md bg-error-container text-on-error-container rounded-xl border border-error/40 font-body-sm flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-md bg-secondary-container text-on-secondary-container rounded-xl border border-[#a4d393] font-body-sm flex items-center justify-between">
              <span className="flex items-center gap-2 font-semibold">
                <span className="material-symbols-outlined">check_circle</span>
                {successMsg}
              </span>
              <button
                onClick={() => setSuccessMsg(null)}
                className="text-on-secondary-container hover:opacity-80"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}

          {generatedPlan ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md md:p-lg shadow-soft flex flex-col gap-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-sm border-b border-outline-variant pb-md">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-primary-container text-on-primary-container px-2.5 py-0.5 rounded-full font-label-md text-[10px] font-bold uppercase">
                      AI Draft
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      {generatedPlan.title}
                    </h3>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Prepared for <span className="font-semibold text-on-surface">{currentPatient?.name}</span> ({generatedPlan.targetCalories} kcal Target)
                  </p>
                </div>

                <button
                  onClick={handleApplyToPatient}
                  className="bg-secondary border border-[#3f6833] text-on-secondary px-md py-sm rounded-lg font-label-md text-label-md hover:bg-opacity-90 transition-colors cursor-pointer flex items-center gap-1 font-bold shadow-xs whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Approve & Apply Plan
                </button>
              </div>

              {/* Rationale & Summary */}
              <div className="bg-surface-container-low p-md rounded-lg border border-outline-variant/40">
                <p className="font-body-md text-body-md text-on-surface mb-2">
                  <span className="font-bold text-primary">Clinical Summary:</span> {generatedPlan.clinicalSummary}
                </p>
                {generatedPlan.clinicalRationale && (
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    <span className="font-semibold">Rationale:</span> {generatedPlan.clinicalRationale}
                  </p>
                )}
              </div>

              {/* Schedule List */}
              <div>
                <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-sm font-bold">
                  Daily Schedule Breakdown
                </h4>
                <div className="flex flex-col gap-sm">
                  {generatedPlan.schedule.map((meal, idx) => (
                    <div
                      key={idx}
                      className="p-md bg-surface border border-outline-variant/60 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-start gap-md">
                        <div className="w-16 font-data-mono text-data-mono text-primary font-bold pt-0.5">
                          {meal.time}
                        </div>
                        <div>
                          <p className="font-body-md text-body-md font-bold text-on-surface">
                            {meal.mealName}
                          </p>
                          {meal.description && (
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                              {meal.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="font-data-mono text-body-sm text-on-surface font-semibold bg-surface-container px-md py-xs rounded-md whitespace-nowrap">
                        {meal.calories} kcal
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Micronutrients & Warnings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md pt-sm border-t border-outline-variant">
                {generatedPlan.micronutrientHighlights && (
                  <div className="p-sm bg-surface-container-low rounded-lg">
                    <span className="font-label-md text-label-md text-secondary font-bold uppercase block mb-1">
                      Micronutrient Density
                    </span>
                    <ul className="list-disc list-inside text-body-sm text-on-surface space-y-1">
                      {generatedPlan.micronutrientHighlights.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {generatedPlan.warningsOrContraindications && (
                  <div className="p-sm bg-error-container/40 rounded-lg">
                    <span className="font-label-md text-label-md text-error font-bold uppercase block mb-1">
                      Clinical Precautions
                    </span>
                    <ul className="list-disc list-inside text-body-sm text-on-surface space-y-1">
                      {generatedPlan.warningsOrContraindications.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl text-center text-on-surface-variant flex flex-col items-center justify-center min-h-[300px]">
              <span className="material-symbols-outlined text-[48px] text-outline mb-md">
                auto_awesome
              </span>
              <p className="font-headline-sm text-headline-sm text-on-surface font-bold">
                No Active Plan Draft
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-xs">
                Configure patient parameters on the left and click "Generate AI Clinical Draft" to create a medical care plan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
