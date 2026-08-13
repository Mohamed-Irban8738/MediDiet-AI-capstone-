import React, { useState, useEffect } from "react";
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
import { LoginView } from "./components/LoginView";
import { PatientPortalView } from "./components/PatientPortalView";

export function App() {
  const [userSession, setUserSession] = useState(() => {
    const saved = localStorage.getItem("medidiet_user_session");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Landing page is the login page by default
    return null;
  });

  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedPatientId, setSelectedPatientId] = useState("PT-8842-X");
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

  // Sync session changes to localStorage
  useEffect(() => {
    if (userSession) {
      localStorage.setItem("medidiet_user_session", JSON.stringify(userSession));
    } else {
      localStorage.removeItem("medidiet_user_session");
    }
  }, [userSession]);

  const handleLoginSuccess = (session) => {
    setUserSession(session);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    setUserSession(null);
    localStorage.removeItem("medidiet_user_session");
  };

  // Selected patient object
  const selectedPatient =
    patients.find((p) => p.id === selectedPatientId) || patients[0];

  const handleNavigate = (view) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectPatient = (patientId) => {
    setSelectedPatientId(patientId);
    setCurrentView("patient-detail");
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddPatient = (newPatient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setSelectedPatientId(newPatient.id);
    setCurrentView("patient-detail");
  };

  const handleApplyPlanToPatient = (patientId, updatedSchedule, planName) => {
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

  // 1. Unauthenticated View -> Show Login Screen
  if (!userSession) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. Patient Logged In View -> Show Dedicated Patient Care Portal
  if (userSession.role === "patient") {
    return <PatientPortalView session={userSession} onLogout={handleLogout} />;
  }

  // 3. Doctor Logged In View -> Show Full Doctor / Clinician Workstation
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
          session={userSession}
          onLogout={handleLogout}
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
