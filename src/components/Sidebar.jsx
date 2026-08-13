import React from "react";
import { MOCK_CLINICIAN } from "../data/mockData";

export const Sidebar = ({
  currentView,
  onNavigate,
  onOpenConsultation,
}) => {
  return (
    <nav className="bg-surface dark:bg-surface-dim h-screen w-64 fixed left-0 top-0 border-r border-outline-variant dark:border-outline flex flex-col h-full py-lg z-50 hidden md:flex">
      {/* Brand Header */}
      <div className="px-md mb-xl">
        <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">
          MediDiet AI
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
          Clinical Nutrition Portal
        </p>
      </div>

      {/* Primary Action */}
      <div className="px-md mb-lg">
        <button
          onClick={onOpenConsultation}
          className="w-full bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary transition-colors duration-200 py-md px-md rounded-lg font-label-md text-label-md flex items-center justify-center gap-sm cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Consultation
        </button>
      </div>

      {/* Navigation List */}
      <ul className="flex-1 flex flex-col gap-xs px-sm">
        {/* Dashboard */}
        <li>
          <button
            onClick={() => onNavigate("dashboard")}
            className={`w-full flex items-center gap-md px-md py-sm rounded-l-lg transition-colors duration-200 cursor-pointer text-left ${
              currentView === "dashboard"
                ? "text-primary font-bold border-r-4 border-primary bg-secondary-container/20 hover:bg-surface-container-high"
                : "text-on-surface-variant dark:text-on-tertiary-container hover:bg-surface-container-high"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings: currentView === "dashboard" ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              dashboard
            </span>
            <span className="font-body-md text-body-md">Dashboard</span>
          </button>
        </li>

        {/* Patients */}
        <li>
          <button
            onClick={() => onNavigate("patients")}
            className={`w-full flex items-center gap-md px-md py-sm rounded-l-lg transition-colors duration-200 cursor-pointer text-left ${
              currentView === "patients" || currentView === "patient-detail"
                ? "text-primary font-bold border-r-4 border-primary bg-secondary-container/20 hover:bg-surface-container-high"
                : "text-on-surface-variant dark:text-on-tertiary-container hover:bg-surface-container-high"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings: currentView === "patients" || currentView === "patient-detail" ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              group
            </span>
            <span className="font-body-md text-body-md">Patients</span>
          </button>
        </li>

        {/* Meal Planner */}
        <li>
          <button
            onClick={() => onNavigate("meal-planner")}
            className={`w-full flex items-center gap-md px-md py-sm rounded-l-lg transition-colors duration-200 cursor-pointer text-left ${
              currentView === "meal-planner"
                ? "text-primary font-bold border-r-4 border-primary bg-secondary-container/20 hover:bg-surface-container-high"
                : "text-on-surface-variant dark:text-on-tertiary-container hover:bg-surface-container-high"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings: currentView === "meal-planner" ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              restaurant
            </span>
            <span className="font-body-md text-body-md">Meal Planner</span>
          </button>
        </li>

        {/* Security */}
        <li>
          <button
            onClick={() => onNavigate("security")}
            className={`w-full flex items-center gap-md px-md py-sm rounded-l-lg transition-colors duration-200 cursor-pointer text-left ${
              currentView === "security"
                ? "text-primary font-bold border-r-4 border-primary bg-secondary-container/20 hover:bg-surface-container-high"
                : "text-on-surface-variant dark:text-on-tertiary-container hover:bg-surface-container-high"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings: currentView === "security" ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              security
            </span>
            <span className="font-body-md text-body-md">Security</span>
          </button>
        </li>
      </ul>

      {/* Bottom Settings & Clinician Profile */}
      <div className="mt-auto px-sm pt-md border-t border-outline-variant dark:border-outline">
        <button
          onClick={() => onNavigate("settings")}
          className={`w-full flex items-center gap-md px-md py-sm rounded-l-lg transition-colors duration-200 cursor-pointer text-left mb-2 ${
            currentView === "settings"
              ? "text-primary font-bold bg-secondary-container/20"
              : "text-on-surface-variant dark:text-on-tertiary-container hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-body-md text-body-md">Settings</span>
        </button>

        <div className="mt-md px-md flex items-center gap-md bg-surface-container-low/60 p-2 rounded-lg border border-outline-variant/40">
          <img
            src={MOCK_CLINICIAN.avatarUrl}
            alt={MOCK_CLINICIAN.name}
            className="w-10 h-10 rounded-full object-cover border border-outline-variant flex-shrink-0"
          />
          <div className="overflow-hidden">
            <p className="font-body-md text-body-md font-semibold text-on-surface truncate">
              {MOCK_CLINICIAN.name}
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
              {MOCK_CLINICIAN.title}
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
};
