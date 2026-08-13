import React, { useState } from "react";

export const DashboardView = ({
  patients,
  onSelectPatient,
  onOpenConsultation,
  onNavigateToMealPlanner,
}) => {
  const [trendRange, setTrendRange] = useState("Last 30 Days");

  // SVG Chart path data depending on selected range
  const chartPath30 = {
    area: "M0,120 L50,90 L100,105 L150,60 L200,80 L250,40 L300,50 L350,20 L400,30 L400,150 L0,150 Z",
    line: "M0,120 L50,90 L100,105 L150,60 L200,80 L250,40 L300,50 L350,20 L400,30",
    points: [
      { cx: 150, cy: 60, val: "82%" },
      { cx: 250, cy: 40, val: "86%" },
      { cx: 350, cy: 20, val: "89%" },
    ],
  };

  const chartPath90 = {
    area: "M0,140 L50,110 L100,80 L150,90 L200,60 L250,50 L300,45 L350,30 L400,25 L400,150 L0,150 Z",
    line: "M0,140 L50,110 L100,80 L150,90 L200,60 L250,50 L300,45 L350,30 L400,25",
    points: [
      { cx: 100, cy: 80, val: "78%" },
      { cx: 200, cy: 60, val: "83%" },
      { cx: 350, cy: 30, val: "88%" },
    ],
  };

  const activeChart = trendRange === "Last 30 Days" ? chartPath30 : chartPath90;

  return (
    <div className="flex-1 p-lg md:p-xl max-w-container-max mx-auto w-full">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            Clinical Overview
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Tuesday, October 24th, 2023
          </p>
        </div>

        <div className="hidden md:flex gap-md">
          <button
            onClick={onOpenConsultation}
            className="bg-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-lg flex items-center gap-xs hover:bg-primary-container transition-colors cursor-pointer shadow-soft"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Consultation
          </button>
        </div>
      </div>

      {/* KPIs Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
        {/* KPI 1 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-soft flex flex-col gap-sm hover:border-primary/40 transition-all">
          <div className="flex justify-between items-start">
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Active Patients
            </p>
            <span className="material-symbols-outlined text-primary-container bg-surface-container p-xs rounded-md">
              group
            </span>
          </div>
          <div className="flex items-baseline gap-sm mt-auto">
            <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
              142
            </span>
            <span className="font-body-sm text-body-sm flex items-center text-[#3f6833] font-medium">
              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>{" "}
              12%
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-soft flex flex-col gap-sm hover:border-primary/40 transition-all">
          <div className="flex justify-between items-start">
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Pending Plans
            </p>
            <span className="material-symbols-outlined text-primary-container bg-surface-container p-xs rounded-md">
              assignment_late
            </span>
          </div>
          <div className="flex items-baseline gap-sm mt-auto">
            <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
              18
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Requires review
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-soft flex flex-col gap-sm hover:border-primary/40 transition-all">
          <div className="flex justify-between items-start">
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Adherence Rate
            </p>
            <span className="material-symbols-outlined text-primary-container bg-surface-container p-xs rounded-md">
              monitoring
            </span>
          </div>
          <div className="flex items-baseline gap-sm mt-auto">
            <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
              84%
            </span>
            <span className="font-body-sm text-body-sm text-[#3f6833] flex items-center font-medium">
              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>{" "}
              2.4%
            </span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-soft flex flex-col gap-sm hover:border-primary/40 transition-all">
          <div className="flex justify-between items-start">
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Appts Today
            </p>
            <span className="material-symbols-outlined text-primary-container bg-surface-container p-xs rounded-md">
              event
            </span>
          </div>
          <div className="flex items-baseline gap-sm mt-auto">
            <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
              6
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Next at 10:30 AM
            </span>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-lg">
          {/* Today's Schedule Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-soft">
            <div className="flex justify-between items-center mb-md pb-sm border-b border-outline-variant">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Today's Schedule
              </h3>
              <button
                onClick={() => onSelectPatient("PT-3301")}
                className="font-label-md text-label-md text-primary hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="flex flex-col gap-sm">
              {/* Appt 1 */}
              <div className="flex items-center justify-between p-sm hover:bg-surface-container-low rounded-lg transition-colors border border-transparent hover:border-outline-variant">
                <div className="flex items-center gap-md">
                  <div className="w-12 text-right">
                    <p className="font-data-mono text-data-mono text-on-surface font-semibold">
                      10:30
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      AM
                    </p>
                  </div>
                  <div className="h-10 w-1 bg-outline-variant rounded-full"></div>
                  <div>
                    <p className="font-body-md text-body-md font-semibold text-on-surface flex items-center gap-xs">
                      Michael R.
                      <span
                        className="material-symbols-outlined text-[14px] text-outline cursor-help"
                        title="Secure PII Data"
                      >
                        lock
                      </span>
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Type 2 Diabetes • Follow-up
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-md">
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-[#a4d393]"
                    title="Stable Status"
                  ></span>
                  <button
                    onClick={onOpenConsultation}
                    className="bg-surface border border-primary text-primary px-sm py-xs rounded font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-colors cursor-pointer"
                  >
                    Start
                  </button>
                </div>
              </div>

              {/* Appt 2 */}
              <div className="flex items-center justify-between p-sm hover:bg-surface-container-low rounded-lg transition-colors border border-transparent hover:border-outline-variant">
                <div className="flex items-center gap-md">
                  <div className="w-12 text-right">
                    <p className="font-data-mono text-data-mono text-on-surface font-semibold">
                      11:45
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      AM
                    </p>
                  </div>
                  <div className="h-10 w-1 bg-outline-variant rounded-full"></div>
                  <div>
                    <p className="font-body-md text-body-md font-semibold text-on-surface flex items-center gap-xs">
                      Sarah L.
                      <span
                        className="material-symbols-outlined text-[14px] text-outline cursor-help"
                        title="Secure PII Data"
                      >
                        lock
                      </span>
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Celiac Disease • Initial Consult
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-md">
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-[#005eb8]"
                    title="In-Treatment Status"
                  ></span>
                  <button
                    onClick={() => onSelectPatient("PT-7729")}
                    className="bg-surface border border-outline-variant text-on-surface-variant px-sm py-xs rounded font-label-md text-label-md hover:bg-surface-variant transition-colors cursor-pointer"
                  >
                    Prep
                  </button>
                </div>
              </div>

              {/* Appt 3 */}
              <div className="flex items-center justify-between p-sm hover:bg-surface-container-low rounded-lg transition-colors border border-transparent hover:border-outline-variant opacity-75">
                <div className="flex items-center gap-md">
                  <div className="w-12 text-right">
                    <p className="font-data-mono text-data-mono text-on-surface-variant">
                      09:00
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      AM
                    </p>
                  </div>
                  <div className="h-10 w-1 bg-surface-variant rounded-full"></div>
                  <div>
                    <p className="font-body-md text-body-md font-semibold text-on-surface flex items-center gap-xs line-through">
                      David W.
                      <span
                        className="material-symbols-outlined text-[14px] text-outline cursor-help"
                        title="Secure PII Data"
                      >
                        lock
                      </span>
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Hypertension • Completed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-[#3f6833]">
                    check_circle
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Trends Chart Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-soft">
            <div className="flex justify-between items-center mb-md">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Clinic Adherence Trends
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Aggregated compliance rate across active diet plans
                </p>
              </div>
              <select
                value={trendRange}
                onChange={(e) => setTrendRange(e.target.value)}
                className="bg-surface border border-outline-variant rounded text-body-sm p-xs focus:ring-primary focus:border-primary cursor-pointer"
              >
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
              </select>
            </div>

            {/* SVG Chart Representation */}
            <div className="w-full h-48 mt-md relative">
              <svg className="w-full h-full preserve-aspect-ratio-none" viewBox="0 0 400 150">
                {/* Grid Lines */}
                <line className="chart-grid" x1="0" x2="400" y1="25" y2="25" />
                <line className="chart-grid" x1="0" x2="400" y1="75" y2="75" />
                <line className="chart-grid" x1="0" x2="400" y1="125" y2="125" />

                {/* Area & Line */}
                <path className="chart-area" d={activeChart.area} />
                <path className="chart-line" d={activeChart.line} />

                {/* Data Points */}
                {activeChart.points.map((pt, idx) => (
                  <g key={idx}>
                    <circle cx={pt.cx} cy={pt.cy} r="5" fill="#005eb8" />
                    <circle cx={pt.cx} cy={pt.cy} r="2.5" fill="#ffffff" />
                  </g>
                ))}
              </svg>

              <div className="absolute bottom-0 left-0 w-full flex justify-between text-body-sm text-on-surface-variant px-xs transform translate-y-full pt-xs font-data-mono">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-lg">
          {/* Action Required Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-soft flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-md pb-sm border-b border-outline-variant">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Action Required
                </h3>
                <span className="bg-error-container text-on-error-container px-sm py-xs rounded-full font-label-md text-[10px] font-bold">
                  3 Urgent
                </span>
              </div>

              <div className="flex flex-col gap-md">
                {/* Task 1 */}
                <div className="bg-surface-container border-l-4 border-error rounded-r-lg p-sm shadow-xs hover:border-error/80 transition-all">
                  <div className="flex justify-between items-start mb-xs">
                    <p className="font-body-md text-body-md font-semibold text-on-surface">
                      Review Blood Work
                    </p>
                    <span className="font-body-sm text-body-sm text-error font-medium">
                      Overdue
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[14px]">person</span>
                    James T.
                    <span
                      className="material-symbols-outlined text-[14px] text-outline ml-auto"
                      title="Secure PII"
                    >
                      lock
                    </span>
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant/80 mt-1">
                    HbA1c: 8.2% (Target &lt; 7.0%). Review carbohydrate ratio.
                  </p>
                </div>

                {/* Task 2 */}
                <div className="bg-surface border border-outline-variant rounded-lg p-sm hover:border-primary/50 transition-all">
                  <div className="flex justify-between items-start mb-xs">
                    <p className="font-body-md text-body-md font-semibold text-on-surface">
                      Approve Meal Plan AI Draft
                    </p>
                    <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                      Today
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[14px]">restaurant</span>
                    Elena V. (Low FODMAP)
                  </p>
                  <div className="mt-sm flex gap-sm">
                    <button
                      onClick={onNavigateToMealPlanner}
                      className="text-primary font-label-md text-[11px] hover:underline font-bold cursor-pointer flex items-center gap-1"
                    >
                      Review Now
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>

                {/* Task 3 */}
                <div className="bg-surface border border-outline-variant rounded-lg p-sm hover:border-outline transition-all">
                  <div className="flex justify-between items-start mb-xs">
                    <p className="font-body-md text-body-md font-semibold text-on-surface">
                      Update Vitals Log
                    </p>
                    <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                      Tomorrow
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[14px]">
                      monitor_heart
                    </span>
                    Robert K.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPatient("PT-8842-X")}
              className="w-full mt-md py-sm bg-surface border border-outline-variant text-on-surface-variant rounded-lg font-label-md hover:bg-surface-variant transition-colors cursor-pointer text-center font-semibold"
            >
              View All Tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
