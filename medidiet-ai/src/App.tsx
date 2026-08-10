import React, { useState } from "react";
import { NavView, Patient } from "./types";
import { INITIAL_PATIENTS } from "./data/mockData";
import { Sidebar } from "./components/Sidebar";
import { TopHeader } from "./components/TopHeader";
import { DashboardView } from "./components/DashboardView";
import { PatientsView } from "./components/PatientsView";
import { PatientProfileView } from "./components/PatientProfileView";
import { MealPlannerView } from "./components/MealPlannerView";
import { SecurityView } from "./components/SecurityView";
import { SettingsView } from "./components/SettingsView";
import { NewConsultationModal } from "./components/NewConsultationModal";

export function App() {
  const [currentView, setCurrentView] = useState<NavView>("dashboard");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("PT-8842-X");
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

  // Selected patient object
  const selectedPatient =
    patients.find((p) => p.id === selectedPatientId) || patients[0];

  const handleNavigate = (view: NavView) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setCurrentView("patient-detail");
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddPatient = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setSelectedPatientId(newPatient.id);
    setCurrentView("patient-detail");
  };

  const handleApplyPlanToPatient = (
    patientId: string,
    updatedSchedule: any[],
    planName: string
  ) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            dietPlanName: planName,
            todaySchedule: updatedSchedule,
          };
        }
        return p;
      })
    );
  };

  return (
    <div className="bg-background dark:bg-surface-dim text-on-surface font-body-md min-h-screen flex selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Fixed Desktop Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenConsultation={() => setIsConsultationModalOpen(true)}
      />

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-64 h-full bg-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              currentView={currentView}
              onNavigate={handleNavigate}
              onOpenConsultation={() => {
                setIsMobileMenuOpen(false);
                setIsConsultationModalOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <TopHeader
          currentView={currentView}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenNotifications={() => setCurrentView("security")}
          onOpenHelp={() => setCurrentView("settings")}
        />

        <main className="flex-1 flex flex-col pb-12">
          {currentView === "dashboard" && (
            <DashboardView
              patients={patients}
              onSelectPatient={handleSelectPatient}
              onOpenConsultation={() => setIsConsultationModalOpen(true)}
              onNavigateToMealPlanner={() => setCurrentView("meal-planner")}
            />
          )}

          {currentView === "patients" && (
            <PatientsView
              patients={patients}
              onSelectPatient={handleSelectPatient}
              onAddPatient={handleAddPatient}
            />
          )}

          {currentView === "patient-detail" && (
            <PatientProfileView
              patient={selectedPatient}
              onBackToPatients={() => setCurrentView("patients")}
              onNavigateToMealPlanner={() => setCurrentView("meal-planner")}
            />
          )}

          {currentView === "meal-planner" && (
            <MealPlannerView
              patients={patients}
              selectedPatientId={selectedPatientId}
              onApplyPlanToPatient={handleApplyPlanToPatient}
            />
          )}

          {currentView === "security" && <SecurityView />}

          {currentView === "settings" && <SettingsView />}
        </main>
      </div>

      {/* New Consultation Modal */}
      <NewConsultationModal
        patients={patients}
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        onSelectPatient={handleSelectPatient}
      />
    </div>
  );
}

export default App;
