import React from "react";

export const SecurityView: React.FC = () => {
  return (
    <div className="flex-1 p-lg md:p-xl max-w-container-max mx-auto w-full">
      <div className="mb-xl">
        <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[28px]">security</span>
          Security & HIPAA Compliance
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
          Protected Health Information (PHI) encryption protocols and access telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-soft">
          <div className="flex items-center gap-2 text-secondary font-bold mb-xs">
            <span className="material-symbols-outlined">lock</span>
            PII Field Encryption
          </div>
          <p className="font-headline-md text-headline-md text-on-surface font-bold">AES-256 GCM</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
            All patient identity records and medical notes are encrypted at rest.
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-soft">
          <div className="flex items-center gap-2 text-primary font-bold mb-xs">
            <span className="material-symbols-outlined">verified_user</span>
            Access Telemetry
          </div>
          <p className="font-headline-md text-headline-md text-on-surface font-bold">100% Compliant</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
            Full audit log of patient record accesses by authorized clinicians.
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-soft">
          <div className="flex items-center gap-2 text-primary-container font-bold mb-xs">
            <span className="material-symbols-outlined">cloud_done</span>
            Server AI Isolation
          </div>
          <p className="font-headline-md text-headline-md text-on-surface font-bold">Zero Exposure</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
            Gemini API keys and processing remain strictly on secure server routes.
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md md:p-lg shadow-soft">
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-md">
          Recent Security Audit Logs
        </h3>
        <div className="divide-y divide-outline-variant/40 font-data-mono text-body-sm">
          <div className="py-sm flex justify-between items-center">
            <span className="text-on-surface font-semibold">
              Dr. Sarah Jenkins accessed record #PT-8842-X (Elena Sterling)
            </span>
            <span className="text-on-surface-variant">Today at 10:24 AM</span>
          </div>
          <div className="py-sm flex justify-between items-center">
            <span className="text-on-surface font-semibold">
              AI Meal Plan Draft generated for PT-8842-X via server route /api/generate-meal-plan
            </span>
            <span className="text-on-surface-variant">Today at 10:20 AM</span>
          </div>
          <div className="py-sm flex justify-between items-center">
            <span className="text-on-surface font-semibold">
              Dr. S. Miller initiated consultation for PT-3301 (Michael R.)
            </span>
            <span className="text-on-surface-variant">Today at 09:15 AM</span>
          </div>
        </div>
      </div>
    </div>
  );
};
