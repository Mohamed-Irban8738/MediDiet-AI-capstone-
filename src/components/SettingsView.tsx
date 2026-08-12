import React, { useState } from "react";
import { MOCK_CLINICIAN } from "../data/mockData";

export const SettingsView: React.FC = () => {
  const [clinicianName, setClinicianName] = useState(MOCK_CLINICIAN.name);
  const [clinicName, setClinicName] = useState("MediDiet Clinical Associates");
  const [autoApproveAi, setAutoApproveAi] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 p-lg md:p-xl max-w-container-max mx-auto w-full">
      <div className="mb-xl">
        <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[28px]">settings</span>
          Portal Settings & Preferences
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
          Manage practitioner details, clinic settings, and AI generation parameters.
        </p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md md:p-lg shadow-soft max-w-2xl">
        {saved && (
          <div className="mb-md p-sm bg-secondary-container text-on-secondary-container rounded-lg font-body-sm font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-md">
          <div>
            <label className="font-label-md text-label-md text-on-surface-variant block mb-1 font-bold">
              Practitioner Name
            </label>
            <input
              type="text"
              value={clinicianName}
              onChange={(e) => setClinicianName(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-lg p-sm text-body-md text-on-surface font-semibold"
            />
          </div>

          <div>
            <label className="font-label-md text-label-md text-on-surface-variant block mb-1 font-bold">
              Clinic Entity / Portal Title
            </label>
            <input
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-lg p-sm text-body-md text-on-surface"
            />
          </div>

          <div className="flex items-center justify-between p-sm bg-surface rounded-lg border border-outline-variant/60">
            <div>
              <p className="font-body-md text-body-md font-bold text-on-surface">
                Auto-Flag High Risk Biomarkers
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Highlight abnormal HbA1c (&gt;7.0%) or blood pressure (&gt;130/80) in red.
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 text-primary rounded border-outline focus:ring-primary cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-sm bg-surface rounded-lg border border-outline-variant/60">
            <div>
              <p className="font-body-md text-body-md font-bold text-on-surface">
                Require Manual Approval for AI Care Plans
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Enforce registered dietitian review before meal plans sync to patient profile.
              </p>
            </div>
            <input
              type="checkbox"
              checked={!autoApproveAi}
              onChange={(e) => setAutoApproveAi(!e.target.checked)}
              className="w-5 h-5 text-primary rounded border-outline focus:ring-primary cursor-pointer"
            />
          </div>

          <button
            type="submit"
            className="mt-md bg-primary text-on-primary font-label-md text-label-md h-[48px] rounded-lg hover:bg-primary-container transition-colors font-bold cursor-pointer shadow-soft"
          >
            Save Preferences
          </button>
        </form>
      </div>
    </div>
  );
};
