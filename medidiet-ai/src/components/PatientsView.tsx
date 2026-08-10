import React, { useState } from "react";
import { Patient, PlanStatus, RiskLevel } from "../types";

interface PatientsViewProps {
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onAddPatient: (newPatient: Patient) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  onSelectPatient,
  onAddPatient,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All Statuses");
  const [riskFilter, setRiskFilter] = useState<string>("All Risk Levels");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Patient Form State
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState(40);
  const [newGender, setNewGender] = useState("Female");
  const [newStatus, setNewStatus] = useState<PlanStatus>("In-Treatment");
  const [newRisk, setNewRisk] = useState<RiskLevel>("Low");
  const [newAllergies, setNewAllergies] = useState("None");
  const [newConditions, setNewConditions] = useState("Type 2 Diabetes");

  // Filter patients
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.chronicConditions.some((c) =>
        c.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "All Statuses" || patient.status === statusFilter;

    const matchesRisk =
      riskFilter === "All Risk Levels" || patient.riskLevel === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created: Patient = {
      id: `PT-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newName,
      age: newAge,
      gender: newGender,
      avatarUrl: "",
      status: newStatus,
      riskLevel: newRisk,
      lastVisit: "Today",
      allergies: newAllergies.split(",").map((a) => a.trim()).filter(Boolean),
      chronicConditions: newConditions.split(",").map((c) => c.trim()).filter(Boolean),
      weight: 70.0,
      weightHistory: [
        { date: "Nov", weight: 71.0 },
        { date: "Dec", weight: 70.5 },
        { date: "Jan", weight: 70.0 },
      ],
      caloricTarget: 2000,
      consumedCalories: 1500,
      macros: {
        protein: { current: 80, target: 110 },
        carbs: { current: 140, target: 190 },
        fats: { current: 40, target: 55 },
      },
      todaySchedule: [
        { id: "m1", time: "08:30", name: "Nutritional Oatmeal Bowl", calories: 350 },
        { id: "m2", time: "13:00", name: "Lean Chicken & Quinoa Salad", calories: 480 },
        { id: "m3", time: "19:00", name: "Steamed White Fish & Veggies", calories: 420 },
      ],
      medicalHistoryNotes: "Initial clinical consultation registered. Diet plan pending AI drafting.",
    };

    onAddPatient(created);
    setIsAddModalOpen(false);
    setNewName("");
  };

  // Helper badge color renderers
  const renderStatusBadge = (status: PlanStatus) => {
    switch (status) {
      case "In-Treatment":
        return (
          <span className="inline-flex items-center gap-xs px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-md text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-primary"></span> In-Treatment
          </span>
        );
      case "Stable":
        return (
          <span className="inline-flex items-center gap-xs px-2.5 py-1 rounded-full bg-surface-container-high text-secondary font-label-md text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-secondary"></span> Stable
          </span>
        );
      case "Discharged":
        return (
          <span className="inline-flex items-center gap-xs px-2.5 py-1 rounded-full bg-surface-container-high text-tertiary font-label-md text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-tertiary"></span> Discharged
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-xs px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-outline"></span> {status}
          </span>
        );
    }
  };

  const renderRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case "High":
        return (
          <span className="inline-flex px-2.5 py-1 rounded-full bg-error-container text-on-error-container border border-[#ffb4ab] font-label-md text-[11px] font-bold">
            High
          </span>
        );
      case "Low":
        return (
          <span className="inline-flex px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container border border-[#a4d393] font-label-md text-[11px] font-bold">
            Low
          </span>
        );
      case "Moderate":
        return (
          <span className="inline-flex px-2.5 py-1 rounded-full bg-surface-variant text-on-surface-variant border border-outline-variant font-label-md text-[11px] font-bold">
            Moderate
          </span>
        );
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex-1 p-lg md:p-xl max-w-container-max mx-auto w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold">
            Patient Directory
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Manage clinical records and nutritional care plans.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-on-primary h-[48px] px-lg rounded-lg font-label-md text-label-md flex items-center gap-sm hover:opacity-90 transition-opacity whitespace-nowrap shadow-soft cursor-pointer font-semibold"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Add New Patient
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-surface/80 backdrop-blur-md border border-outline-variant p-md rounded-xl mb-lg shadow-soft flex flex-col lg:flex-row gap-md items-center">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, or condition..."
            className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg pl-12 pr-md py-md font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface transition-all placeholder:text-outline-variant"
          />
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-sm w-full lg:w-auto">
          <div className="relative w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-lg pl-md pr-xl py-md font-body-sm text-body-sm text-on-surface appearance-none focus:ring-1 focus:ring-primary cursor-pointer pr-8"
            >
              <option>All Statuses</option>
              <option>In-Treatment</option>
              <option>Stable</option>
              <option>Discharged</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
              arrow_drop_down
            </span>
          </div>

          <div className="relative w-full md:w-auto">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-lg pl-md pr-xl py-md font-body-sm text-body-sm text-on-surface appearance-none focus:ring-1 focus:ring-primary cursor-pointer pr-8"
            >
              <option>All Risk Levels</option>
              <option>High</option>
              <option>Moderate</option>
              <option>Low</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
              arrow_drop_down
            </span>
          </div>

          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("All Statuses");
              setRiskFilter("All Risk Levels");
            }}
            className="w-full md:w-auto border border-outline-variant bg-surface text-on-surface px-md py-md rounded-lg font-label-md text-label-md flex items-center justify-center gap-xs hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">filter_list</span>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Patients Data Table */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low border-b border-outline-variant sticky top-0">
              <tr>
                <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  Patient Info
                </th>
                <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">
                  Last Visit
                </th>
                <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  Plan Status
                </th>
                <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-data-mono text-data-mono text-on-surface">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-md py-xl text-center text-on-surface-variant font-body-md">
                    No patients match the current search or filters.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient, index) => (
                  <tr
                    key={patient.id}
                    onClick={() => onSelectPatient(patient.id)}
                    className={`hover:bg-surface-container-lowest transition-colors h-[56px] cursor-pointer ${
                      index % 2 === 1 ? "bg-[#f8fafc]" : ""
                    }`}
                  >
                    {/* Patient Info */}
                    <td className="px-md py-sm">
                      <div className="flex items-center gap-sm">
                        {patient.avatarUrl ? (
                          <img
                            src={patient.avatarUrl}
                            alt={patient.name}
                            className="w-9 h-9 rounded-full object-cover border border-outline-variant flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-[12px] flex-shrink-0">
                            {getInitials(patient.name)}
                          </div>
                        )}
                        <div>
                          <p className="font-body-md text-body-md font-semibold text-on-surface flex items-center gap-xs">
                            {patient.name}
                            <span
                              className="material-symbols-outlined text-[14px] text-outline cursor-help"
                              title="Secure PII Data"
                            >
                              lock
                            </span>
                          </p>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            ID: {patient.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Last Visit */}
                    <td className="px-md py-sm text-right text-on-surface-variant font-body-sm">
                      {patient.lastVisit}
                    </td>

                    {/* Plan Status */}
                    <td className="px-md py-sm">{renderStatusBadge(patient.status)}</td>

                    {/* Risk Level */}
                    <td className="px-md py-sm">{renderRiskBadge(patient.riskLevel)}</td>

                    {/* Actions */}
                    <td className="px-md py-sm text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectPatient(patient.id)}
                        className="text-primary hover:text-primary-container p-xs rounded hover:bg-surface-container transition-colors cursor-pointer"
                        title="View Patient Record"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          chevron_right
                        </span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="bg-surface-container-low px-md py-sm border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-sm">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Showing 1 to {filteredPatients.length} of {patients.length} patients
          </p>
          <div className="flex items-center gap-xs">
            <button
              disabled
              className="p-xs text-outline hover:text-on-surface disabled:opacity-50 transition-colors"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded bg-primary text-on-primary font-data-mono text-[12px] flex items-center justify-center font-bold">
              1
            </button>
            <button className="w-8 h-8 rounded text-on-surface-variant hover:bg-surface-container font-data-mono text-[12px] flex items-center justify-center transition-colors">
              2
            </button>
            <button className="w-8 h-8 rounded text-on-surface-variant hover:bg-surface-container font-data-mono text-[12px] flex items-center justify-center transition-colors">
              3
            </button>
            <span className="text-on-surface-variant px-1">...</span>
            <button className="p-xs text-on-surface hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add New Patient Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-md">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl max-w-lg w-full p-lg shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-md border-b border-outline-variant pb-sm">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Add New Clinical Patient
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-on-surface-variant hover:text-error p-xs rounded-lg transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="flex flex-col gap-md">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Maria Gonzalez"
                  className="w-full bg-surface border border-outline-variant rounded-lg p-sm text-body-md text-on-surface focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(Number(e.target.value))}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-sm text-body-md text-on-surface focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
                    Gender
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-sm text-body-md text-on-surface focus:ring-2 focus:ring-primary"
                  >
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other / Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
                    Plan Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as PlanStatus)}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-sm text-body-md text-on-surface focus:ring-2 focus:ring-primary"
                  >
                    <option value="In-Treatment">In-Treatment</option>
                    <option value="Stable">Stable</option>
                    <option value="Discharged">Discharged</option>
                  </select>
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
                    Risk Level
                  </label>
                  <select
                    value={newRisk}
                    onChange={(e) => setNewRisk(e.target.value as RiskLevel)}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-sm text-body-md text-on-surface focus:ring-2 focus:ring-primary"
                  >
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
                  Allergies (comma separated)
                </label>
                <input
                  type="text"
                  value={newAllergies}
                  onChange={(e) => setNewAllergies(e.target.value)}
                  placeholder="Shellfish, Penicillin, Nuts"
                  className="w-full bg-surface border border-outline-variant rounded-lg p-sm text-body-md text-on-surface focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
                  Chronic Conditions
                </label>
                <input
                  type="text"
                  value={newConditions}
                  onChange={(e) => setNewConditions(e.target.value)}
                  placeholder="Type 2 Diabetes, Celiac Disease"
                  className="w-full bg-surface border border-outline-variant rounded-lg p-sm text-body-md text-on-surface focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-sm mt-md pt-sm border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-md py-sm bg-surface border border-outline-variant rounded-lg text-body-md text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-md py-sm bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors cursor-pointer font-bold"
                >
                  Save Patient Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
