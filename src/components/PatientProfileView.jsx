import React, { useState } from "react";

export const PatientProfileView = ({
  patient,
  onBackToPatients,
  onNavigateToMealPlanner,
}) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex-1 p-lg md:p-xl max-w-container-max mx-auto w-full">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant mb-6">
        <button
          onClick={onBackToPatients}
          className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1 font-medium"
        >
          Patients
        </button>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-semibold flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">lock</span>
          {patient.name}
        </span>
      </nav>

      {/* Patient Header Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md md:p-lg mb-8 shadow-soft relative overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          {/* Identity Info */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-surface-container-high overflow-hidden bg-surface-container-low flex-shrink-0">
                {patient.avatarUrl ? (
                  <img
                    src={patient.avatarUrl}
                    alt={patient.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-2xl">
                    {patient.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              {/* Status Dot */}
              <div
                className="absolute bottom-1 right-1 w-5 h-5 bg-secondary-fixed-dim border-2 border-surface-container-lowest rounded-full shadow-xs"
                title="Stable Status"
              />
            </div>

            <div>
              <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold flex items-center gap-2">
                {patient.name}
                <span
                  className="material-symbols-outlined text-outline text-[20px] cursor-help"
                  title="Secure PII Data"
                >
                  lock
                </span>
              </h2>
              <div className="font-data-mono text-data-mono text-on-surface-variant mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>
                  ID: <span className="font-semibold text-on-surface">#{patient.id}</span>
                </span>
                <span className="w-1 h-1 rounded-full bg-outline-variant hidden md:block"></span>
                <span>Age: {patient.age}</span>
                <span className="w-1 h-1 rounded-full bg-outline-variant hidden md:block"></span>
                <span>Gender: {patient.gender}</span>
              </div>
            </div>
          </div>

          {/* Medical Flags */}
          <div className="flex flex-col gap-3 w-full md:w-auto bg-surface p-4 rounded-lg border border-outline-variant/50">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-error text-[18px] mt-0.5">
                warning
              </span>
              <div>
                <span className="font-label-md text-label-md text-on-surface-variant block uppercase font-bold text-[10px] tracking-wider">
                  ALLERGIES
                </span>
                <span className="font-body-md text-body-md text-on-surface font-semibold">
                  {patient.allergies.join(", ") || "None Reported"}
                </span>
              </div>
            </div>
            <div className="w-full h-px bg-outline-variant/30"></div>
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">
                medical_information
              </span>
              <div>
                <span className="font-label-md text-label-md text-on-surface-variant block uppercase font-bold text-[10px] tracking-wider">
                  CHRONIC CONDITIONS
                </span>
                <span className="font-body-md text-body-md text-on-surface font-semibold">
                  {patient.chronicConditions.join(", ") || "None"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-outline-variant mb-6 overflow-x-auto">
        <nav className="flex gap-6 min-w-max">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 font-label-md text-label-md flex items-center gap-2 px-1 cursor-pointer transition-colors ${
              activeTab === "overview"
                ? "border-b-2 border-primary text-primary font-bold"
                : "border-b-2 border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={{
                fontVariationSettings: activeTab === "overview" ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              dataset
            </span>
            Overview
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 font-label-md text-label-md flex items-center gap-2 px-1 cursor-pointer transition-colors ${
              activeTab === "history"
                ? "border-b-2 border-primary text-primary font-bold"
                : "border-b-2 border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
            Medical History
          </button>

          <button
            onClick={() => setActiveTab("diet")}
            className={`pb-3 font-label-md text-label-md flex items-center gap-2 px-1 cursor-pointer transition-colors ${
              activeTab === "diet"
                ? "border-b-2 border-primary text-primary font-bold"
                : "border-b-2 border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">list_alt</span>
            Current Diet Plan
          </button>

          <button
            onClick={() => setActiveTab("progress")}
            className={`pb-3 font-label-md text-label-md flex items-center gap-2 px-1 cursor-pointer transition-colors ${
              activeTab === "progress"
                ? "border-b-2 border-primary text-primary font-bold"
                : "border-b-2 border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">trending_up</span>
            Progress Tracking
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Spans 2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Daily Nutrition Target */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md md:p-lg flex flex-col shadow-soft">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 font-bold">
                  <span className="material-symbols-outlined text-primary text-[22px]">
                    local_fire_department
                  </span>
                  Daily Nutrition Target
                </h3>
                <span className="font-label-md text-label-md text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full font-semibold">
                  Today
                </span>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 w-full justify-around mb-4">
                {/* Circular Progress Gauge */}
                <div className="relative w-44 h-44 flex items-center justify-center flex-shrink-0">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-surface-container-high"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.2"
                    />
                    <path
                      className="text-primary"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="77, 100"
                      strokeLinecap="round"
                      strokeWidth="3.2"
                    />
                  </svg>
                  <div className="text-center z-10 flex flex-col items-center">
                    <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
                      {patient.consumedCalories.toLocaleString()}
                    </span>
                    <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                      / {patient.caloricTarget.toLocaleString()} kcal
                    </span>
                  </div>
                </div>

                {/* Macro Progress Bars */}
                <div className="flex-1 w-full max-w-xs flex flex-col gap-4">
                  <div>
                    <div className="flex justify-between font-label-md text-label-md mb-1 font-semibold">
                      <span className="text-on-surface">Protein</span>
                      <span className="text-on-surface-variant">
                        {patient.macros.protein.current}g / {patient.macros.protein.target}g
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary-container h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (patient.macros.protein.current / patient.macros.protein.target) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-label-md text-label-md mb-1 font-semibold">
                      <span className="text-on-surface">Carbs</span>
                      <span className="text-on-surface-variant">
                        {patient.macros.carbs.current}g / {patient.macros.carbs.target}g
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-secondary h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (patient.macros.carbs.current / patient.macros.carbs.target) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-label-md text-label-md mb-1 font-semibold">
                      <span className="text-on-surface">Fats</span>
                      <span className="text-on-surface-variant">
                        {patient.macros.fats.current}g / {patient.macros.fats.target}g
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-tertiary-container h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (patient.macros.fats.current / patient.macros.fats.target) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weight Trend Chart */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md md:p-lg flex flex-col shadow-soft">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 font-bold">
                  <span className="material-symbols-outlined text-primary text-[22px]">
                    monitor_weight
                  </span>
                  Weight Trend (90 Days)
                </h3>
                <button
                  onClick={() => setActiveTab("progress")}
                  className="font-label-md text-label-md text-primary flex items-center gap-1 hover:underline cursor-pointer font-bold"
                >
                  Detailed View
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>

              <div className="w-full h-48 relative border-b border-l border-outline-variant/50 pb-2 pl-2 flex flex-col justify-end">
                {/* Y-Axis Labels */}
                <div className="absolute left-[-24px] bottom-[10%] font-data-mono text-body-sm text-outline-variant">
                  75
                </div>
                <div className="absolute left-[-24px] bottom-[50%] font-data-mono text-body-sm text-outline-variant">
                  80
                </div>
                <div className="absolute left-[-24px] bottom-[90%] font-data-mono text-body-sm text-outline-variant">
                  85
                </div>

                {/* SVG Chart Graphic */}
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#00478d" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#00478d" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <polygon
                    fill="url(#chartFill)"
                    points="0,100 0,60 20,65 40,55 60,70 80,45 100,50 100,100"
                  />
                  <polyline
                    fill="none"
                    points="0,60 20,65 40,55 60,70 80,45 100,50"
                    stroke="#00478d"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  <circle cx="20" cy="65" r="2" fill="#ffffff" stroke="#00478d" strokeWidth="1.5" />
                  <circle cx="40" cy="55" r="2" fill="#ffffff" stroke="#00478d" strokeWidth="1.5" />
                  <circle cx="60" cy="70" r="2" fill="#ffffff" stroke="#00478d" strokeWidth="1.5" />
                  <circle cx="80" cy="45" r="2" fill="#ffffff" stroke="#00478d" strokeWidth="1.5" />
                  <circle cx="100" cy="50" r="2" fill="#ffffff" stroke="#00478d" strokeWidth="1.5" />
                </svg>

                {/* X-Axis Labels */}
                <div className="absolute bottom-[-24px] w-full flex justify-between font-data-mono text-body-sm text-outline-variant px-2">
                  <span>Oct</span>
                  <span>Nov</span>
                  <span>Dec</span>
                  <span>Jan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Active Diet Plan */}
          <div className="lg:col-span-1">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-0 flex flex-col shadow-soft h-full overflow-hidden">
              <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface">
                <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 font-bold">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    calendar_today
                  </span>
                  Active Diet Plan
                </h3>
                <button
                  onClick={onNavigateToMealPlanner}
                  className="p-1 rounded-md text-outline-variant hover:text-primary hover:bg-surface-container-low transition-colors cursor-pointer"
                  title="Plan Options"
                >
                  <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-3 font-bold text-[11px]">
                    TODAY'S SCHEDULE
                  </div>

                  <ul className="flex flex-col border border-outline-variant/30 rounded-lg overflow-hidden divide-y divide-outline-variant/30">
                    {patient.todaySchedule.map((meal) => (
                      <li
                        key={meal.id}
                        className="h-[52px] bg-background flex items-center px-4 relative hover:bg-surface-container-low transition-colors"
                      >
                        {meal.statusBorderColor && (
                          <div
                            className={`w-1.5 absolute left-0 top-0 bottom-0 ${meal.statusBorderColor}`}
                          />
                        )}
                        <div className="w-16 font-data-mono text-body-sm text-on-surface-variant font-semibold">
                          {meal.time}
                        </div>
                        <div className="flex-1 font-body-md text-body-md text-on-surface font-medium truncate pr-2">
                          {meal.name}
                        </div>
                        <div className="font-data-mono text-data-mono text-on-surface font-semibold">
                          {meal.calories}
                          <span className="text-body-sm text-outline-variant font-normal">
                            kcal
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={onNavigateToMealPlanner}
                  className="w-full mt-6 bg-transparent border border-primary text-primary font-label-md text-label-md h-[48px] rounded-lg hover:bg-surface-container-low transition-colors flex justify-center items-center gap-2 cursor-pointer font-bold shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
                  Modify Diet Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Tabs */}
      {activeTab === "history" && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft">
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-md">
            Clinical Medical History
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-md">
            {patient.medicalHistoryNotes ||
              "Patient presents with managed Type 2 Diabetes and Low FODMAP protocol requirements. Regular glycemic index monitoring recommended."}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md pt-md border-t border-outline-variant">
            <div className="p-sm bg-surface rounded-lg border border-outline-variant/60">
              <span className="font-label-md text-label-md text-primary font-bold uppercase block mb-1">
                Recent Lab Results
              </span>
              <ul className="text-body-sm text-on-surface space-y-1 font-data-mono">
                <li>HbA1c: 6.4% (Normal Managed)</li>
                <li>Fasting Blood Glucose: 104 mg/dL</li>
                <li>Total Cholesterol: 185 mg/dL</li>
              </ul>
            </div>
            <div className="p-sm bg-surface rounded-lg border border-outline-variant/60">
              <span className="font-label-md text-label-md text-secondary font-bold uppercase block mb-1">
                Dietary Intolerances Log
              </span>
              <p className="text-body-sm text-on-surface">
                Eliminated garlic, onion, and lactose. High tolerance to gluten-free oats and salmon.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "diet" && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Current Active Care Plan: {patient.dietPlanName || "Low FODMAP & Glycemic Protocol"}
            </h3>
            <button
              onClick={onNavigateToMealPlanner}
              className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors cursor-pointer"
            >
              Open AI Meal Planner
            </button>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mb-md">
            Target Caloric Level: {patient.caloricTarget} kcal | Protein: {patient.macros.protein.target}g | Carbs: {patient.macros.carbs.target}g | Fats: {patient.macros.fats.target}g
          </p>
        </div>
      )}

      {activeTab === "progress" && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft">
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-md">
            Weight & Adherence Progress History
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md text-center">
            {patient.weightHistory.map((wh, i) => (
              <div key={i} className="p-md bg-surface border border-outline-variant/60 rounded-lg">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase font-bold block">
                  {wh.date}
                </span>
                <span className="font-headline-md text-headline-md text-on-surface font-bold">
                  {wh.weight} kg
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
