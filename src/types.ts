export type NavView = "dashboard" | "patients" | "patient-detail" | "meal-planner" | "security" | "settings";

export type UserRole = "doctor" | "patient";

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  patientId?: string;
  title?: string;
  avatarUrl?: string;
  speciality?: string;
}

export type PlanStatus = "In-Treatment" | "Stable" | "Discharged" | "Pending Review";
export type RiskLevel = "High" | "Moderate" | "Low";

export interface Patient {
  id: string; // e.g. "PT-8842-X"
  name: string;
  age: number;
  gender: string;
  avatarUrl: string;
  status: PlanStatus;
  riskLevel: RiskLevel;
  lastVisit: string;
  allergies: string[];
  chronicConditions: string[];
  weight: number; // kg
  weightHistory: { date: string; weight: number }[];
  caloricTarget: number;
  consumedCalories: number;
  macros: {
    protein: { current: number; target: number };
    carbs: { current: number; target: number };
    fats: { current: number; target: number };
  };
  todaySchedule: MealItem[];
  medicalHistoryNotes?: string;
  dietPlanName?: string;
}

export interface MealItem {
  id: string;
  time: string;
  name: string;
  calories: number;
  macroLabel?: string;
  statusBorderColor?: string; // e.g., 'bg-secondary-fixed-dim'
}

export interface Appointment {
  id: string;
  time: string;
  patientName: string;
  patientId: string;
  condition: string;
  type: string;
  status: "Start" | "Prep" | "Completed";
  statusDotColor: string;
}

export interface ActionTask {
  id: string;
  title: string;
  patientName: string;
  dueDate: string;
  urgent: boolean;
  type: "bloodwork" | "mealplan" | "vitals";
  subtext?: string;
}

export interface ConsultationFormState {
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  weight: number;
  height: number;
  bp: string;
  hba1c: number;
  glucose: number;
  primaryGoal: string;
  clinicalNotes: string;
}

export interface AIMealPlanResult {
  title: string;
  dietType: string;
  targetCalories: number;
  clinicalSummary: string;
  clinicalRationale?: string;
  schedule: {
    time: string;
    mealName: string;
    calories: number;
    protein?: string;
    carbs?: string;
    fats?: string;
    category?: string;
    description?: string;
  }[];
  micronutrientHighlights?: string[];
  warningsOrContraindications?: string[];
}
