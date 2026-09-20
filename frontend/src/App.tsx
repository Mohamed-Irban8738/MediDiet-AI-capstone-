import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const TOKEN_KEY = "medidiet_access_token";

type BackendState = "checking" | "online" | "offline";

type Page =
  | "overview"
  | "patients"
  | "patient-profile";

type Patient = {
  id: number;
  user_id: number;
  name: string;
  age: number | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  medical_conditions: string | null;
  allergies: string | null;
  dietary_preferences: string | null;
  activity_level: string | null;
};

type Consultation = {
  id: number;
  patient_id: number;
  doctor_id: number;
  doctor_name: string;
  symptoms: string | null;
  diagnosis: string | null;
  notes: string | null;
  consultation_date: string;
};

type DietMeal = {
  id: number;
  diet_plan_id: number;
  name: string;
  meal_type: string;
  day_number: number;
  description: string | null;
  calories: number | string | null;
  protein_g: number | string | null;
  carbohydrates_g: number | string | null;
  fat_g: number | string | null;
  serving_size: string | null;
  scheduled_time: string | null;
};

type MealLog = {
  id: number;
  meal_id: number;
  patient_id: number;
  consumed_at: string | null;
  status: string;
  notes: string | null;
};

type DietPlan = {
  id: number;
  patient_id: number;
  doctor_id: number;
  consultation_id: number;
  name: string;
  goal: string | null;
  daily_calories: number | string | null;
  notes: string | null;
  status: string;
  created_at: string;
  meals: DietMeal[];
};

function formatDate(date: string) {
  return new Date(date).toLocaleString();
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}


/* ============================================================
   LOGIN
============================================================ */

function Login({
  onLogin,
}: {
  onLogin: (token: string, role: string) => void;
}) {
  const [loginType, setLoginType] =
    useState<"doctor" | "patient">("doctor");

  const [showRegister, setShowRegister] =
    useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [registerEmail, setRegisterEmail] =
    useState("");
  const [registerPassword, setRegisterPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [registerFirstName, setRegisterFirstName] =
    useState("");
  const [registerLastName, setRegisterLastName] =
    useState("");
  const [registerSpecialization, setRegisterSpecialization] =
    useState("");
  const [registerLicenseNumber, setRegisterLicenseNumber] =
    useState("");
  const [registerPhone, setRegisterPhone] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [registering, setRegistering] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function switchLoginType(
    type: "doctor" | "patient",
  ) {
    setLoginType(type);
    setShowRegister(false);

    setEmail("");
    setPassword("");

    setRegisterEmail("");
    setRegisterPassword("");
    setConfirmPassword("");
    setRegisterFirstName("");
    setRegisterLastName("");
    setRegisterSpecialization("");
    setRegisterLicenseNumber("");
    setRegisterPhone("");

    setError("");
    setSuccess("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ?? "Login failed",
        );
      }

      if (data.role !== loginType) {
        throw new Error(
          `This account is registered as ${data.role}. Please select ${data.role} login.`,
        );
      }

      onLogin(
        data.access_token,
        data.role,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to login",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDoctorRegister(
    event: FormEvent,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (registerPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setRegistering(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: registerEmail,
            password: registerPassword,
            first_name: registerFirstName,
            last_name:
              registerLastName || null,
            specialization:
              registerSpecialization || null,
            license_number:
              registerLicenseNumber || null,
            phone: registerPhone || null,
          }),
        },
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ??
            "Unable to create doctor account",
        );
      }

      setShowRegister(false);

      setEmail(registerEmail);
      setPassword("");

      setRegisterEmail("");
      setRegisterPassword("");
      setConfirmPassword("");
      setRegisterFirstName("");
      setRegisterLastName("");
      setRegisterSpecialization("");
      setRegisterLicenseNumber("");
      setRegisterPhone("");

      setSuccess(
        "Doctor account created successfully. Please sign in.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create doctor account",
      );
    } finally {
      setRegistering(false);
    }
  }

  const isDoctor = loginType === "doctor";

  return (
    <div className="auth-shell">
      <div className="auth-layout">

        <div className="auth-copy">
          {isDoctor ? (
            <>
              <p className="eyebrow">
                MEDIDIET AI
              </p>

              <h1>
                Clinical nutrition,
                <br />
                powered by AI.
              </h1>

              <p className="auth-intro">
                Sign in to manage patients,
                consultations, assessments and
                personalized diet plans.
              </p>

              <div className="feature-list">
                <div>
                  <ShieldCheck size={17} />
                  Secure clinical workspace
                </div>

                <div>
                  <Users size={17} />
                  Patient and consultation
                  management
                </div>

                <div>
                  <Sparkles size={17} />
                  AI-powered nutrition planning
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="eyebrow">
                MEDIDIET AI
              </p>

              <h1>
                Your nutrition journey,
                <br />
                powered by AI.
              </h1>

              <p className="auth-intro">
                Sign in to view your personalized
                diet plans, daily meals and
                nutrition progress.
              </p>

              <div className="feature-list">
                <div>
                  <ShieldCheck size={17} />
                  Secure patient access
                </div>

                <div>
                  <ClipboardList size={17} />
                  Personalized diet plans
                </div>

                <div>
                  <CheckCircle2 size={17} />
                  Daily meal tracking
                </div>
              </div>
            </>
          )}
        </div>

        <div className="login-card">

          <div className="card-heading">

            <div className="login-type-switch">
              <button
                type="button"
                className={
                  isDoctor
                    ? "login-type-button active"
                    : "login-type-button"
                }
                onClick={() =>
                  switchLoginType("doctor")
                }
              >
                Doctor Login
              </button>

              <button
                type="button"
                className={
                  !isDoctor
                    ? "login-type-button active"
                    : "login-type-button"
                }
                onClick={() =>
                  switchLoginType("patient")
                }
              >
                Patient Login
              </button>
            </div>

            {!showRegister ? (
              <>
                <p className="eyebrow">
                  {isDoctor
                    ? "DOCTOR LOGIN"
                    : "PATIENT LOGIN"}
                </p>

                <h2>Welcome back</h2>

                <p>
                  {isDoctor
                    ? "Sign in to continue to your clinical workspace."
                    : "Sign in to view your personalized nutrition plan."}
                </p>
              </>
            ) : (
              <>
                <p className="eyebrow">
                  DOCTOR REGISTRATION
                </p>

                <h2>Create doctor account</h2>

                <p>
                  Register your MediDiet AI
                  clinical account.
                </p>
              </>
            )}
          </div>

          {!showRegister ? (
            <form onSubmit={handleSubmit}>

              <label>
                Email

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />
              </label>

              <label>
                Password

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                />
              </label>

              {error && (
                <div className="error-box">
                  {error}
                </div>
              )}

              {success && (
                <div className="success-box">
                  {success}
                </div>
              )}

              <button
                className="primary-button"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Signing in..."
                  : "Sign in"}
              </button>

              {isDoctor && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setShowRegister(true);
                    setError("");
                    setSuccess("");
                  }}
                >
                  Register as Doctor
                </button>
              )}

            </form>
          ) : (
            <form onSubmit={handleDoctorRegister}>

              <label>
                First Name

                <input
                  type="text"
                  value={registerFirstName}
                  onChange={(event) =>
                    setRegisterFirstName(
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              <label>
                Last Name{" "}
                <span style={{ fontWeight: 400 }}>
                  (Optional)
                </span>

                <input
                  type="text"
                  value={registerLastName}
                  onChange={(event) =>
                    setRegisterLastName(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                Email

                <input
                  type="email"
                  value={registerEmail}
                  onChange={(event) =>
                    setRegisterEmail(
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              <label>
                Password

                <input
                  type="password"
                  value={registerPassword}
                  onChange={(event) =>
                    setRegisterPassword(
                      event.target.value,
                    )
                  }
                  minLength={8}
                  required
                />
              </label>

              <label>
                Confirm Password

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  minLength={8}
                  required
                />
              </label>

              <label>
                Specialization

                <input
                  type="text"
                  value={registerSpecialization}
                  onChange={(event) =>
                    setRegisterSpecialization(
                      event.target.value,
                    )
                  }
                  placeholder="e.g. Clinical Nutrition"
                />
              </label>

              <label>
                License Number

                <input
                  type="text"
                  value={registerLicenseNumber}
                  onChange={(event) =>
                    setRegisterLicenseNumber(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                Phone

                <input
                  type="tel"
                  value={registerPhone}
                  onChange={(event) =>
                    setRegisterPhone(
                      event.target.value,
                    )
                  }
                />
              </label>

              {error && (
                <div className="error-box">
                  {error}
                </div>
              )}

              <button
                className="primary-button"
                type="submit"
                disabled={registering}
              >
                {registering
                  ? "Creating account..."
                  : "Create Doctor Account"}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setShowRegister(false);
                  setError("");
                  setSuccess("");
                }}
              >
                <ArrowLeft size={16} />
                Back to Login
              </button>

            </form>
          )}

          <div className="connection-status">
            <span className="status-dot online" />
            MediDiet AI backend
          </div>

        </div>
      </div>
    </div>
  );
}


/* ============================================================
   PATIENT PROFILE
============================================================ */

function PatientProfilePage({
  patient,
  token,
  onBack,
}: {
  patient: Patient;
  token: string;
  onBack: () => void;
}) {
  const [consultations, setConsultations] =
    useState<Consultation[]>([]);

  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");

  const [loadingConsultations, setLoadingConsultations] =
    useState(true);

  const [creatingConsultation, setCreatingConsultation] =
    useState(false);

  const [generatingAssessment, setGeneratingAssessment] =
    useState<number | null>(null);

  const [assessment, setAssessment] =
    useState<Record<number, string>>({});

  const [generatingDiet, setGeneratingDiet] =
    useState<number | null>(null);

  const [dietPlans, setDietPlans] =
    useState<Record<number, DietPlan>>({});

  const [selectedDietDay, setSelectedDietDay] =
    useState<Record<number, number>>({});

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  async function loadConsultations() {
    setLoadingConsultations(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/consultations/patient/${patient.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      const data = await response
        .json()
        .catch(() => []);

      if (!response.ok) {
        throw new Error(
          data.detail ??
            "Unable to load consultations",
        );
      }

      setConsultations(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load consultations",
      );
    } finally {
      setLoadingConsultations(false);
    }
  }


  async function loadExistingDietPlans() {
    try {
      const response = await fetch(
        `${API_URL}/api/diets/patient/${patient.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      const data = await response
        .json()
        .catch(() => []);

      if (!response.ok) {
        throw new Error(
          data.detail ??
            "Unable to load diet plans",
        );
      }

      const planMap: Record<number, DietPlan> = {};

      for (const plan of data) {
        if (
          plan.consultation_id !== null &&
          plan.consultation_id !== undefined
        ) {
          planMap[plan.consultation_id] = plan;
        }
      }

      setDietPlans(planMap);

      const selectedDays: Record<number, number> = {};

      for (const plan of data) {
        if (
          plan.consultation_id !== null &&
          plan.consultation_id !== undefined
        ) {
          selectedDays[plan.consultation_id] = 1;
        }
      }

      setSelectedDietDay(selectedDays);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load diet plans",
      );
    }
  }


  useEffect(() => {
    loadConsultations();
    loadExistingDietPlans();
  }, [patient.id, token]);


  async function createConsultation(
    event: FormEvent,
  ) {
    event.preventDefault();

    setCreatingConsultation(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/consultations`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            patient_id: patient.id,
            symptoms: symptoms || null,
            diagnosis: diagnosis || null,
            notes: notes || null,
          }),
        },
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ??
            "Unable to create consultation",
        );
      }

      setSymptoms("");
      setDiagnosis("");
      setNotes("");

      setSuccess(
        "Consultation created successfully.",
      );

      await loadConsultations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create consultation",
      );
    } finally {
      setCreatingConsultation(false);
    }
  }


  async function generateAssessment(
    consultationId: number,
  ) {
    setGeneratingAssessment(consultationId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/consultations/${consultationId}/ai-assessment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ??
            "Unable to generate AI assessment",
        );
      }

      setAssessment((current) => ({
        ...current,
        [consultationId]: data.response,
      }));

      setSuccess(
        `AI assessment generated for consultation #${consultationId}.`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate AI assessment",
      );
    } finally {
      setGeneratingAssessment(null);
    }
  }


  async function generateDietPlan(
    consultationId: number,
  ) {
    setGeneratingDiet(consultationId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/diets/consultations/${consultationId}/generate-ai`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (response.ok) {
        setDietPlans((current) => ({
          ...current,
          [consultationId]: data,
        }));

        setSelectedDietDay((current) => ({
          ...current,
          [consultationId]: 1,
        }));

        setSuccess(
          `7-day AI diet plan generated for consultation #${consultationId}.`,
        );

        return;
      }

      if (response.status === 409) {
        const plansResponse = await fetch(
          `${API_URL}/api/diets/patient/${patient.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );

        const plansData = await plansResponse
          .json()
          .catch(() => []);

        if (!plansResponse.ok) {
          throw new Error(
            plansData.detail ??
              "Unable to load existing diet plan",
          );
        }

        const existingPlan = plansData.find(
          (plan: DietPlan) =>
            plan.consultation_id ===
              consultationId &&
            plan.status === "draft",
        );

        if (!existingPlan) {
          throw new Error(
            "A draft diet plan exists, but it could not be loaded.",
          );
        }

        setDietPlans((current) => ({
          ...current,
          [consultationId]: existingPlan,
        }));

        setSelectedDietDay((current) => ({
          ...current,
          [consultationId]: 1,
        }));

        setSuccess(
          `Existing 7-day AI diet plan loaded for consultation #${consultationId}.`,
        );

        return;
      }

      throw new Error(
        data.detail ??
          "Unable to generate AI diet plan",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate AI diet plan",
      );
    } finally {
      setGeneratingDiet(null);
    }
  }


  return (
    <section className="page-section">

      <button
        className="back-button"
        onClick={onBack}
      >
        <ArrowLeft size={17} />
        Back to patients
      </button>

      <div className="profile-header">
        <div className="patient-avatar large">
          {getInitials(patient.name)}
        </div>

        <div>
          <p className="eyebrow">
            PATIENT PROFILE
          </p>

          <h2>{patient.name}</h2>

          <p>Patient #{patient.id}</p>
        </div>
      </div>

      <div className="profile-grid">

        <div className="profile-item">
          <span>Age</span>
          <strong>
            {patient.age ?? "Not provided"}{" "}
            {patient.age !== null
              ? "years"
              : ""}
          </strong>
        </div>

        <div className="profile-item">
          <span>Gender</span>
          <strong>
            {patient.gender ?? "Not provided"}
          </strong>
        </div>

        <div className="profile-item">
          <span>Height</span>
          <strong>
            {patient.height ?? "Not provided"}
            {patient.height !== null
              ? " cm"
              : ""}
          </strong>
        </div>

        <div className="profile-item">
          <span>Weight</span>
          <strong>
            {patient.weight ?? "Not provided"}
            {patient.weight !== null
              ? " kg"
              : ""}
          </strong>
        </div>

        <div className="profile-item">
          <span>Dietary preference</span>
          <strong>
            {patient.dietary_preferences ??
              "Not provided"}
          </strong>
        </div>

        <div className="profile-item">
          <span>Activity level</span>
          <strong>
            {patient.activity_level ??
              "Not provided"}
          </strong>
        </div>

        <div className="profile-item profile-wide">
          <span>Medical conditions</span>
          <strong>
            {patient.medical_conditions ??
              "None"}
          </strong>
        </div>

        <div className="profile-item profile-wide">
          <span>Allergies</span>
          <strong>
            {patient.allergies ?? "None"}
          </strong>
        </div>

      </div>

      <section className="consultation-section">

        <div className="section-heading">
          <div>
            <p className="eyebrow">
              CLINICAL WORKFLOW
            </p>

            <h2>Consultations</h2>

            <p>
              Create and review consultations for
              this patient.
            </p>
          </div>
        </div>

        <form
          className="consultation-form"
          onSubmit={createConsultation}
        >

          <label>
            Symptoms

            <textarea
              value={symptoms}
              onChange={(event) =>
                setSymptoms(event.target.value)
              }
              placeholder="Enter patient symptoms..."
            />
          </label>

          <label>
            Diagnosis

            <textarea
              value={diagnosis}
              onChange={(event) =>
                setDiagnosis(event.target.value)
              }
              placeholder="Enter diagnosis..."
            />
          </label>

          <label>
            Doctor notes

            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              placeholder="Enter clinical notes..."
            />
          </label>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          {success && (
            <div className="success-box">
              {success}
            </div>
          )}

          <button
            className="primary-button"
            type="submit"
            disabled={creatingConsultation}
          >
            <ClipboardList size={17} />

            {creatingConsultation
              ? "Creating..."
              : "Create consultation"}
          </button>

        </form>

        <div className="consultation-history">

          <div className="section-heading">
            <div>
              <h2>
                Consultation history
              </h2>

              <p>
                Previous consultations for this
                patient.
              </p>
            </div>
          </div>

          {loadingConsultations ? (
            <div className="empty-state">
              Loading consultations...
            </div>
          ) : consultations.length === 0 ? (
            <div className="empty-state">
              No consultations found.
            </div>
          ) : (
            <div className="consultation-list">

              {consultations.map(
                (consultation) => {

                  const dietPlan =
                    dietPlans[
                      consultation.id
                    ];

                  const selectedDay =
                    selectedDietDay[
                      consultation.id
                    ] ?? 1;

                  const dayMeals =
                    dietPlan?.meals.filter(
                      (meal) =>
                        meal.day_number ===
                        selectedDay,
                    ) ?? [];

                  return (
                    <article
                      className="consultation-card"
                      key={consultation.id}
                    >

                      <div className="consultation-card-header">

                        <div>
                          <h3>
                            Consultation #{consultation.id}
                          </h3>

                          <p>
                            by {consultation.doctor_name}
                          </p>

                          <p>
                            {formatDate(
                              consultation.consultation_date,
                            )}
                          </p>
                        </div>

                      </div>

                      <div className="consultation-content">

                        <div>
                          <span>
                            Symptoms
                          </span>

                          <strong>
                            {consultation.symptoms ??
                              "Not provided"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Diagnosis
                          </span>

                          <strong>
                            {consultation.diagnosis ??
                              "Not provided"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Doctor notes
                          </span>

                          <strong>
                            {consultation.notes ??
                              "Not provided"}
                          </strong>
                        </div>

                      </div>

                      <div className="consultation-ai-action">

                        <button
                          className="primary-button compact"
                          onClick={() =>
                            generateAssessment(
                              consultation.id,
                            )
                          }
                          disabled={
                            generatingAssessment ===
                            consultation.id
                          }
                        >
                          <Sparkles size={16} />

                          {generatingAssessment ===
                          consultation.id
                            ? "Generating..."
                            : "Generate AI Assessment"}
                        </button>

                        {assessment[
                          consultation.id
                        ] && (
                          <div className="ai-assessment-box">

                            <p className="eyebrow">
                              AI NUTRITION ASSESSMENT
                            </p>

                            <div className="ai-assessment-text">
                              {
                                assessment[
                                  consultation.id
                                ]
                              }
                            </div>

                          </div>
                        )}

                      </div>

                      <div className="diet-ai-action">

                        <div className="diet-action-header">

                          <div>
                            <p className="eyebrow">
                              AI DIET PLANNING
                            </p>

                            <h3>
                              7-Day Diet Plan
                            </h3>

                            <p>
                              Generate a personalized
                              7-day meal plan using the
                              patient and consultation
                              information.
                            </p>
                          </div>

                        </div>

                        {!dietPlan && (
                          <button
                            className="primary-button compact"
                            onClick={() =>
                              generateDietPlan(
                                consultation.id,
                              )
                            }
                            disabled={
                              generatingDiet ===
                              consultation.id
                            }
                          >
                            <Sparkles size={16} />

                            {generatingDiet ===
                            consultation.id
                              ? "Generating 7-Day Plan..."
                              : "Generate AI Diet Plan"}
                          </button>
                        )}

                        {dietPlan && (
                          <div className="diet-plan-box">

                            <div className="diet-plan-header">

                              <div>
                                <p className="eyebrow">
                                  GENERATED DIET PLAN
                                </p>

                                <h3>
                                  {dietPlan.name ||
                                    `${patient.name}'s 7-Day Diet Plan`}
                                </h3>

                                {dietPlan.goal && (
                                  <p>
                                    Goal:{" "}
                                    {dietPlan.goal}
                                  </p>
                                )}
                              </div>

                              {dietPlan.daily_calories !==
                                null &&
                                dietPlan.daily_calories !==
                                  undefined && (
                                  <div className="calorie-badge">
                                    {
                                      dietPlan.daily_calories
                                    }{" "}
                                    kcal/day
                                  </div>
                                )}

                            </div>

                            <div className="diet-days">

                              {Array.from(
                                { length: 7 },
                                (_, index) =>
                                  index + 1,
                              ).map(
                                (day) => (
                                  <button
                                    key={day}
                                    type="button"
                                    className={
                                      selectedDay ===
                                      day
                                        ? "diet-day-button active"
                                        : "diet-day-button"
                                    }
                                    onClick={() =>
                                      setSelectedDietDay(
                                        (current) => ({
                                          ...current,
                                          [consultation.id]:
                                            day,
                                        }),
                                      )
                                    }
                                  >
                                    Day {day}
                                  </button>
                                ),
                              )}

                            </div>

                            <div className="diet-day-content">

                              <div className="diet-day-title">
                                <h3>
                                  Day{" "}
                                  {selectedDay}
                                </h3>

                                <span>
                                  {
                                    dayMeals.length
                                  }{" "}
                                  meals
                                </span>
                              </div>

                              {dayMeals.length ===
                              0 ? (
                                <div className="empty-state">
                                  No meals available
                                  for this day.
                                </div>
                              ) : (
                                <div className="meal-list">

                                  {dayMeals.map(
                                    (meal) => (
                                      <div
                                        className="meal-card"
                                        key={
                                          meal.id
                                        }
                                      >

                                        <div className="meal-card-top">

                                          <div>
                                            <p className="meal-type">
                                              {
                                                meal.meal_type
                                              }
                                            </p>

                                            <h4>
                                              {
                                                meal.name
                                              }
                                            </h4>
                                          </div>

                                          {meal.scheduled_time && (
                                            <span className="meal-time">
                                              {
                                                meal.scheduled_time
                                              }
                                            </span>
                                          )}

                                        </div>

                                        {meal.description && (
                                          <p className="meal-description">
                                            {
                                              meal.description
                                            }
                                          </p>
                                        )}

                                        {meal.serving_size && (
                                          <p className="meal-serving">
                                            <strong>
                                              Serving:
                                            </strong>{" "}
                                            {
                                              meal.serving_size
                                            }
                                          </p>
                                        )}

                                        <div className="meal-nutrition">

                                          {meal.calories !==
                                            null &&
                                            meal.calories !==
                                              undefined && (
                                              <span>
                                                <strong>
                                                  {
                                                    meal.calories
                                                  }
                                                </strong>{" "}
                                                kcal
                                              </span>
                                            )}

                                          {meal.protein_g !==
                                            null &&
                                            meal.protein_g !==
                                              undefined && (
                                              <span>
                                                <strong>
                                                  {
                                                    meal.protein_g
                                                  }
                                                  g
                                                </strong>{" "}
                                                protein
                                              </span>
                                            )}

                                          {meal.carbohydrates_g !==
                                            null &&
                                            meal.carbohydrates_g !==
                                              undefined && (
                                              <span>
                                                <strong>
                                                  {
                                                    meal.carbohydrates_g
                                                  }
                                                  g
                                                </strong>{" "}
                                                carbs
                                              </span>
                                            )}

                                          {meal.fat_g !==
                                            null &&
                                            meal.fat_g !==
                                              undefined && (
                                              <span>
                                                <strong>
                                                  {
                                                    meal.fat_g
                                                  }
                                                  g
                                                </strong>{" "}
                                                fat
                                              </span>
                                            )}

                                        </div>

                                        <div className="meal-status-info">
                                          Patient meal tracking
                                        </div>

                                      </div>
                                    ),
                                  )}

                                </div>
                              )}

                            </div>

                            {dietPlan.notes && (
                              <div className="diet-notes">

                                <span>
                                  Plan notes
                                </span>

                                <p>
                                  {dietPlan.notes}
                                </p>

                              </div>
                            )}

                          </div>
                        )}

                      </div>

                    </article>
                  );
                },
              )}

            </div>
          )}

        </div>
      </section>
    </section>
  );
}


/* ============================================================
   PATIENTS
============================================================ */

function PatientsPage({
  token,
  onOpenPatient,
}: {
  token: string;
  onOpenPatient: (patient: Patient) => void;
}) {
  const [patients, setPatients] =
    useState<Patient[]>([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    medical_conditions: "",
    allergies: "",
    dietary_preferences: "",
    activity_level: "",
  });


  async function loadPatients() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/patient/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      const data = await response
        .json()
        .catch(() => []);

      if (!response.ok) {
        throw new Error(
          data.detail ??
            "Unable to load patients",
        );
      }

      setPatients(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load patients",
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadPatients();
  }, [token]);


  function updateField(
    field: keyof typeof form,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }


  function resetForm() {
    setForm({
      email: "",
      password: "",
      name: "",
      age: "",
      gender: "",
      height: "",
      weight: "",
      medical_conditions: "",
      allergies: "",
      dietary_preferences: "",
      activity_level: "",
    });
  }


  async function createPatient(
    event: FormEvent,
  ) {
    event.preventDefault();

    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/patient/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            name: form.name,

            age: form.age
              ? Number(form.age)
              : null,

            gender:
              form.gender || null,

            height: form.height
              ? Number(form.height)
              : null,

            weight: form.weight
              ? Number(form.weight)
              : null,

            medical_conditions:
              form.medical_conditions ||
              null,

            allergies:
              form.allergies || null,

            dietary_preferences:
              form.dietary_preferences ||
              null,

            activity_level:
              form.activity_level ||
              null,
          }),
        },
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ??
            "Unable to create patient account",
        );
      }

      setSuccess(
        `Patient account created successfully for ${data.name}.`,
      );

      resetForm();

      await loadPatients();

      setShowCreateForm(false);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create patient account",
      );
    } finally {
      setCreating(false);
    }
  }


  const filteredPatients =
    patients.filter(
      (patient) =>
        patient.name
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase(),
          ) ||
        String(patient.id).includes(
          searchTerm,
        ),
    );


  return (
    <section className="page-section">

      <div className="section-heading">

        <div>
          <p className="eyebrow">
            PATIENTS
          </p>

          <h2>
            Patient management
          </h2>

          <p>
            Create and manage patient accounts.
          </p>
        </div>

        <div className="section-heading-actions">

          <div className="search-box">

            <Search size={18} />

            <input
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value,
                )
              }
              placeholder="Search patients..."
            />

          </div>

          <button
            className="primary-button"
            type="button"
            onClick={() => {
              setShowCreateForm(
                (current) => !current,
              );

              setError("");
              setSuccess("");
            }}
          >
            <Users size={17} />

            {showCreateForm
              ? "Close"
              : "Create Patient"}
          </button>

        </div>

      </div>


      {error && (
        <div className="error-box">
          {error}
        </div>
      )}


      {success && (
        <div className="success-box">
          {success}
        </div>
      )}


      {showCreateForm && (
        <div className="create-patient-card">

          <div className="section-heading">

            <div>
              <p className="eyebrow">
                NEW PATIENT
              </p>

              <h2>
                Create patient account
              </h2>

              <p>
                Create login credentials and
                patient information.
              </p>
            </div>

          </div>


          <form
            className="patient-create-form"
            onSubmit={createPatient}
          >

            <div className="form-section-title">
              Account information
            </div>


            <div className="form-grid">

              <label>
                Email

                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField(
                      "email",
                      event.target.value,
                    )
                  }
                  placeholder="patient@example.com"
                  required
                />
              </label>


              <label>
                Password

                <input
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    updateField(
                      "password",
                      event.target.value,
                    )
                  }
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required
                />
              </label>

            </div>


            <div className="form-section-title">
              Patient information
            </div>


            <div className="form-grid">

              <label>
                Full Name

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    updateField(
                      "name",
                      event.target.value,
                    )
                  }
                  placeholder="Patient name"
                  required
                />
              </label>


              <label>
                Age

                <input
                  type="number"
                  min="0"
                  max="150"
                  value={form.age}
                  onChange={(event) =>
                    updateField(
                      "age",
                      event.target.value,
                    )
                  }
                  placeholder="Age"
                />
              </label>


              <label>
                Gender

                <select
                  value={form.gender}
                  onChange={(event) =>
                    updateField(
                      "gender",
                      event.target.value,
                    )
                  }
                >
                  <option value="">
                    Select gender
                  </option>

                  <option value="male">
                    Male
                  </option>

                  <option value="female">
                    Female
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>
              </label>


              <label>
                Height (cm)

                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={form.height}
                  onChange={(event) =>
                    updateField(
                      "height",
                      event.target.value,
                    )
                  }
                  placeholder="e.g. 175"
                />
              </label>


              <label>
                Weight (kg)

                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={form.weight}
                  onChange={(event) =>
                    updateField(
                      "weight",
                      event.target.value,
                    )
                  }
                  placeholder="e.g. 70"
                />
              </label>


              <label>
                Activity Level

                <select
                  value={form.activity_level}
                  onChange={(event) =>
                    updateField(
                      "activity_level",
                      event.target.value,
                    )
                  }
                >
                  <option value="">
                    Select activity level
                  </option>

                  <option value="Sedentary">
                    Sedentary
                  </option>

                  <option value="Light">
                    Light
                  </option>

                  <option value="Moderate">
                    Moderate
                  </option>

                  <option value="Active">
                    Active
                  </option>

                  <option value="Very Active">
                    Very Active
                  </option>
                </select>
              </label>

            </div>


            <div className="form-grid">

              <label>
                Dietary Preferences

                <input
                  type="text"
                  value={
                    form.dietary_preferences
                  }
                  onChange={(event) =>
                    updateField(
                      "dietary_preferences",
                      event.target.value,
                    )
                  }
                  placeholder="e.g. Vegetarian"
                />
              </label>


              <label>
                Allergies

                <input
                  type="text"
                  value={form.allergies}
                  onChange={(event) =>
                    updateField(
                      "allergies",
                      event.target.value,
                    )
                  }
                  placeholder="e.g. Peanuts"
                />
              </label>

            </div>


            <label>
              Medical Conditions

              <textarea
                value={
                  form.medical_conditions
                }
                onChange={(event) =>
                  updateField(
                    "medical_conditions",
                    event.target.value,
                  )
                }
                placeholder="Enter medical conditions..."
              />
            </label>


            <div className="form-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  resetForm();
                  setShowCreateForm(false);
                  setError("");
                }}
                disabled={creating}
              >
                Cancel
              </button>


              <button
                type="submit"
                className="primary-button"
                disabled={creating}
              >
                <Users size={17} />

                {creating
                  ? "Creating patient..."
                  : "Create Patient Account"}
              </button>

            </div>

          </form>

        </div>
      )}


      <div className="section-heading patient-list-heading">

        <div>
          <p className="eyebrow">
            REGISTERED PATIENTS
          </p>

          <h2>
            Patients
          </h2>
        </div>

        <span>
          {filteredPatients.length} patient
          {filteredPatients.length !== 1
            ? "s"
            : ""}
        </span>

      </div>


      {loading ? (
        <div className="empty-state">
          Loading patients...
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="empty-state">
          No patients found.
        </div>
      ) : (
        <div className="patient-list">

          {filteredPatients.map(
            (patient) => (
              <div
                className="patient-card"
                key={patient.id}
              >

                <div className="patient-card-left">

                  <div className="patient-avatar">
                    {getInitials(
                      patient.name,
                    )}
                  </div>

                  <div>
                    <h3>
                      {patient.name}
                    </h3>

                    <p>
                      Patient #{patient.id}
                    </p>
                  </div>

                </div>


                <div className="patient-card-details">

                  <span>
                    {patient.age ?? "-"} years
                  </span>

                  <span>
                    {patient.gender ?? "-"}
                  </span>

                  <span>
                    {patient.dietary_preferences ??
                      "No preference"}
                  </span>

                </div>


                <button
                  className="secondary-button"
                  onClick={() =>
                    onOpenPatient(patient)
                  }
                >
                  Open profile
                  <ArrowRight size={16} />
                </button>

              </div>
            ),
          )}

        </div>
      )}

    </section>
  );
}


/* ============================================================
   PATIENT DASHBOARD
============================================================ */

function PatientDashboard({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  const [patient, setPatient] =
    useState<Patient | null>(null);

  const [dietPlans, setDietPlans] =
    useState<DietPlan[]>([]);

  const [selectedPlan, setSelectedPlan] =
    useState<DietPlan | null>(null);

  const [selectedDay, setSelectedDay] =
    useState(1);

  const [mealLogs, setMealLogs] =
    useState<Record<number, MealLog>>({});

  const [loading, setLoading] =
    useState(true);

  const [loggingMeal, setLoggingMeal] =
    useState<number | null>(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  async function loadPatientDashboard() {
    setLoading(true);
    setError("");

    try {
      const patientResponse =
        await fetch(
          `${API_URL}/api/patient/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );

      const patientData =
        await patientResponse
          .json()
          .catch(() => ({}));

      if (!patientResponse.ok) {
        throw new Error(
          patientData.detail ??
            "Unable to load patient profile",
        );
      }

      setPatient(patientData);

      const plansResponse =
        await fetch(
          `${API_URL}/api/diets/patient/${patientData.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );

      const plansData =
        await plansResponse
          .json()
          .catch(() => []);

      if (!plansResponse.ok) {
        throw new Error(
          plansData.detail ??
            "Unable to load diet plans",
        );
      }

      setDietPlans(plansData);

      if (plansData.length > 0) {
        setSelectedPlan(plansData[0]);
      } else {
        setSelectedPlan(null);
      }

      /*
       * Load previously logged meals.
       *
       * This makes meal status persistent across
       * logout/login.
       */
      const logsResponse = await fetch(
        `${API_URL}/api/diets/patient/${patientData.id}/meal-logs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      const logsData = await logsResponse
        .json()
        .catch(() => []);

      if (!logsResponse.ok) {
        throw new Error(
          logsData.detail ??
            "Unable to load meal logs",
        );
      }

      const logsMap: Record<number, MealLog> = {};

      for (const log of logsData) {
        logsMap[log.meal_id] = log;
      }

      setMealLogs(logsMap);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load patient dashboard",
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadPatientDashboard();
  }, [token]);


  async function logMeal(mealId: number) {
    setLoggingMeal(mealId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/diets/meals/${mealId}/log`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            consumed_at:
              new Date().toISOString(),
            status: "consumed",
            notes: null,
          }),
        },
      );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ??
            "Unable to log meal",
        );
      }

      setMealLogs((current) => ({
        ...current,
        [mealId]: data,
      }));

      setSuccess(
        "Meal marked as eaten.",
      );

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to log meal",
      );
    } finally {
      setLoggingMeal(null);
    }
  }


  if (loading) {
    return (
      <div className="patient-dashboard-shell">
        <div className="patient-loading">
          Loading your nutrition dashboard...
        </div>
      </div>
    );
  }


  if (!patient) {
    return (
      <div className="patient-dashboard-shell">
        <div className="patient-error-card">

          <h2>
            Patient profile not found
          </h2>

          <p>
            Your patient profile has not been
            created yet.
          </p>

          <button
            className="primary-button"
            onClick={onLogout}
          >
            <LogOut size={17} />
            Sign out
          </button>

        </div>
      </div>
    );
  }


  const dayMeals =
    selectedPlan?.meals.filter(
      (meal) =>
        meal.day_number === selectedDay,
    ) ?? [];

  const loggedCount =
    selectedPlan?.meals.filter(
      (meal) =>
        mealLogs[meal.id],
    ).length ?? 0;

  const totalMeals =
    selectedPlan?.meals.length ?? 0;

  const dayLoggedCount =
    dayMeals.filter(
      (meal) =>
        mealLogs[meal.id],
    ).length;


  return (
    <div className="patient-dashboard-shell">

      <aside className="patient-sidebar">

        <div className="patient-sidebar-brand">

          <div className="brand-mark">
            <ShieldCheck size={21} />
          </div>

          <div>
            <strong>MediDiet AI</strong>
            <span>Patient workspace</span>
          </div>

        </div>

        <div className="patient-sidebar-info">

          <div className="patient-avatar large">
            {getInitials(patient.name)}
          </div>

          <strong>{patient.name}</strong>

          <span>
            Patient #{patient.id}
          </span>

        </div>

        <button
          className="logout-button"
          onClick={onLogout}
        >
          <LogOut size={18} />
          Sign out
        </button>

      </aside>


      <main className="patient-dashboard-main">

        <header className="patient-topbar">

          <div>

            <p className="eyebrow">
              PATIENT WORKSPACE
            </p>

            <h1>
              Welcome, {patient.name}
            </h1>

            <p>
              Your personalized nutrition
              journey.
            </p>

          </div>

          <div className="patient-top-avatar">
            {getInitials(patient.name)}
          </div>

        </header>


        {error && (
          <div className="error-box patient-message">
            {error}
          </div>
        )}


        {success && (
          <div className="success-box patient-message">
            {success}
          </div>
        )}


        <section className="patient-welcome-card">

          <div>

            <p className="eyebrow">
              MEDIDIET AI
            </p>

            <h2>
              Your personalized nutrition
              plan.
            </h2>

            <p>
              Follow your assigned meal plan,
              track your meals and monitor your
              daily progress.
            </p>

          </div>

          <div className="patient-welcome-icon">
            <Sparkles size={38} />
          </div>

        </section>


        <section className="patient-stats-grid">

          <div className="patient-stat-card">

            <div>
              <ClipboardList size={20} />
            </div>

            <strong>
              {dietPlans.length}
            </strong>

            <span>
              Diet plan
              {dietPlans.length !== 1
                ? "s"
                : ""}
            </span>

          </div>


          <div className="patient-stat-card">

            <div>
              <CheckCircle2 size={20} />
            </div>

            <strong>
              {dayLoggedCount}/{dayMeals.length}
            </strong>

            <span>
              Today's meals
            </span>

          </div>


          <div className="patient-stat-card">

            <div>
              <Users size={20} />
            </div>

            <strong>
              {totalMeals > 0
                ? `${loggedCount}/${totalMeals}`
                : "0"}
            </strong>

            <span>
              Plan progress
            </span>

          </div>

        </section>


        {dietPlans.length === 0 ? (
          <section className="patient-empty-card">

            <ClipboardList size={30} />

            <h2>
              No diet plan assigned yet
            </h2>

            <p>
              Your doctor has not assigned a
              diet plan to your account yet.
            </p>

          </section>
        ) : (
          <>

            <section className="patient-plan-selector">

              <div>

                <p className="eyebrow">
                  YOUR DIET PLANS
                </p>

                <h2>
                  Assigned nutrition plan
                </h2>

              </div>

              {dietPlans.length > 1 && (
                <select
                  value={
                    selectedPlan?.id ?? ""
                  }
                  onChange={(event) => {

                    const plan =
                      dietPlans.find(
                        (item) =>
                          item.id ===
                          Number(
                            event.target.value,
                          ),
                      );

                    if (plan) {
                      setSelectedPlan(plan);
                      setSelectedDay(1);
                    }

                  }}
                >

                  {dietPlans.map((plan) => (
                    <option
                      key={plan.id}
                      value={plan.id}
                    >
                      {plan.name}
                    </option>
                  ))}

                </select>
              )}

            </section>


            {selectedPlan && (
              <section className="patient-diet-card">

                <div className="patient-diet-header">

                  <div>

                    <p className="eyebrow">
                      ACTIVE DIET PLAN
                    </p>

                    <h2>
                      {selectedPlan.name ||
                        `${patient.name}'s Diet Plan`}
                    </h2>

                    {selectedPlan.goal && (
                      <p>
                        Goal:{" "}
                        {selectedPlan.goal}
                      </p>
                    )}

                  </div>

                  {selectedPlan.daily_calories !==
                    null &&
                    selectedPlan.daily_calories !==
                      undefined && (
                      <div className="calorie-badge">
                        {
                          selectedPlan.daily_calories
                        }{" "}
                        kcal/day
                      </div>
                    )}

                </div>


                <div className="patient-days">

                  {Array.from(
                    { length: 7 },
                    (_, index) =>
                      index + 1,
                  ).map((day) => (

                    <button
                      key={day}
                      type="button"
                      className={
                        selectedDay === day
                          ? "patient-day-button active"
                          : "patient-day-button"
                      }
                      onClick={() =>
                        setSelectedDay(day)
                      }
                    >
                      Day {day}
                    </button>

                  ))}

                </div>


                <div className="patient-day-heading">

                  <div>

                    <p className="eyebrow">
                      DAILY MEALS
                    </p>

                    <h3>
                      Day {selectedDay}
                    </h3>

                  </div>

                  <span>
                    {dayLoggedCount}/
                    {dayMeals.length} eaten
                  </span>

                </div>


                {dayMeals.length === 0 ? (
                  <div className="empty-state">
                    No meals available for this
                    day.
                  </div>
                ) : (
                  <div className="patient-meal-list">

                    {dayMeals.map((meal) => (

                      <article
                        className="patient-meal-card"
                        key={meal.id}
                      >

                        <div className="patient-meal-top">

                          <div>

                            <p className="meal-type">
                              {meal.meal_type}
                            </p>

                            <h3>
                              {meal.name}
                            </h3>

                          </div>

                          {meal.scheduled_time && (
                            <span className="meal-time">
                              {
                                meal.scheduled_time
                              }
                            </span>
                          )}

                        </div>


                        {meal.description && (
                          <p className="meal-description">
                            {meal.description}
                          </p>
                        )}


                        {meal.serving_size && (
                          <p className="meal-serving">

                            <strong>
                              Serving:
                            </strong>{" "}

                            {
                              meal.serving_size
                            }

                          </p>
                        )}


                        <div className="meal-nutrition">

                          {meal.calories !==
                            null &&
                            meal.calories !==
                              undefined && (
                              <span>
                                <strong>
                                  {
                                    meal.calories
                                  }
                                </strong>{" "}
                                kcal
                              </span>
                            )}

                          {meal.protein_g !==
                            null &&
                            meal.protein_g !==
                              undefined && (
                              <span>
                                <strong>
                                  {
                                    meal.protein_g
                                  }
                                  g
                                </strong>{" "}
                                protein
                              </span>
                            )}

                          {meal.carbohydrates_g !==
                            null &&
                            meal.carbohydrates_g !==
                              undefined && (
                              <span>
                                <strong>
                                  {
                                    meal.carbohydrates_g
                                  }
                                  g
                                </strong>{" "}
                                carbs
                              </span>
                            )}

                          {meal.fat_g !==
                            null &&
                            meal.fat_g !==
                              undefined && (
                              <span>
                                <strong>
                                  {
                                    meal.fat_g
                                  }
                                  g
                                </strong>{" "}
                                fat
                              </span>
                            )}

                        </div>


                        {mealLogs[meal.id] ? (
                          <div className="meal-logged">

                            <CheckCircle2
                              size={17}
                            />

                            Meal logged

                          </div>
                        ) : (
                          <button
                            type="button"
                            className="secondary-button compact"
                            onClick={() =>
                              logMeal(
                                meal.id,
                              )
                            }
                            disabled={
                              loggingMeal ===
                              meal.id
                            }
                          >

                            <CheckCircle2
                              size={17}
                            />

                            {loggingMeal ===
                            meal.id
                              ? "Logging..."
                              : "Mark as eaten"}

                          </button>
                        )}

                      </article>

                    ))}

                  </div>
                )}


                {selectedPlan.notes && (
                  <div className="diet-notes">

                    <span>
                      Plan notes
                    </span>

                    <p>
                      {selectedPlan.notes}
                    </p>

                  </div>
                )}

              </section>
            )}

          </>
        )}

      </main>
    </div>
  );
}


/* ============================================================
   DOCTOR DASHBOARD
============================================================ */

function Dashboard({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  const [page, setPage] =
    useState<Page>("overview");

  const [selectedPatient, setSelectedPatient] =
    useState<Patient | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  function openPatients() {
    setPage("patients");
    setMobileMenuOpen(false);
  }

  function openPatient(patient: Patient) {
    setSelectedPatient(patient);
    setPage("patient-profile");
  }

  return (
    <div className="dashboard-shell">

      <aside
        className={
          mobileMenuOpen
            ? "sidebar open"
            : "sidebar"
        }
      >

        <div className="sidebar-brand">

          <div className="brand-mark">
            <ShieldCheck size={21} />
          </div>

          <div>
            <strong>
              MediDiet AI
            </strong>

            <span>
              Clinical workspace
            </span>
          </div>

          <button
            className="mobile-close"
            onClick={() =>
              setMobileMenuOpen(false)
            }
          >
            <X size={20} />
          </button>

        </div>


        <nav className="sidebar-nav">

          <button
            className={
              page === "overview"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => {
              setPage("overview");
              setMobileMenuOpen(false);
            }}
          >
            <ClipboardList size={18} />
            Overview
          </button>


          <button
            className={
              page === "patients" ||
              page === "patient-profile"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={openPatients}
          >
            <Users size={18} />
            Patients
          </button>

        </nav>


        <button
          className="logout-button"
          onClick={onLogout}
        >
          <LogOut size={18} />
          Sign out
        </button>

      </aside>


      {mobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        />
      )}


      <main className="dashboard-main">

        <header className="topbar">

          <button
            className="mobile-menu"
            onClick={() =>
              setMobileMenuOpen(true)
            }
          >
            <Menu size={21} />
          </button>

          <div>

            <p className="eyebrow">
              DOCTOR WORKSPACE
            </p>

            <h1>
              {page === "overview"
                ? "Overview"
                : page === "patients"
                  ? "Patients"
                  : "Patient profile"}
            </h1>

          </div>

        </header>


        {page === "overview" && (
          <section className="page-section">

            <div className="hero-card">

              <div>

                <p className="eyebrow">
                  MEDIDIET AI
                </p>

                <h2>
                  Clinical nutrition,
                  powered by AI.
                </h2>

                <p>
                  Manage patients, record
                  consultations, generate AI
                  assessments and create
                  personalized 7-day diet plans.
                </p>

                <button
                  className="primary-button"
                  onClick={openPatients}
                >
                  <Users size={17} />
                  View patients
                </button>

              </div>

              <div className="hero-icon">
                <Sparkles size={46} />
              </div>

            </div>


            <div className="overview-grid">

              <div className="overview-card">

                <Users size={22} />

                <strong>
                  Patients
                </strong>

                <p>
                  Review patient profiles and
                  nutrition information.
                </p>

              </div>


              <div className="overview-card">

                <ClipboardList size={22} />

                <strong>
                  Consultations
                </strong>

                <p>
                  Record symptoms, diagnoses and
                  clinical notes.
                </p>

              </div>


              <div className="overview-card">

                <Sparkles size={22} />

                <strong>
                  AI Planning
                </strong>

                <p>
                  Generate assessments and
                  personalized 7-day diet plans.
                </p>

              </div>

            </div>

          </section>
        )}


        {page === "patients" && (
          <PatientsPage
            token={token}
            onOpenPatient={openPatient}
          />
        )}


        {page === "patient-profile" &&
          selectedPatient && (
            <PatientProfilePage
              patient={selectedPatient}
              token={token}
              onBack={openPatients}
            />
          )}

      </main>
    </div>
  );
}


/* ============================================================
   APP
============================================================ */

function App() {
  const [token, setToken] =
    useState<string | null>(
      () =>
        localStorage.getItem(
          TOKEN_KEY,
        ),
    );

  const [role, setRole] =
    useState<string | null>(
      () =>
        localStorage.getItem(
          "medidiet_user_role",
        ),
    );

  const [backendState, setBackendState] =
    useState<BackendState>("checking");


  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then((response) => {

        if (!response.ok) {
          throw new Error();
        }

        setBackendState("online");
      })
      .catch(() => {
        setBackendState("offline");
      });
  }, []);


  function handleLogin(
    accessToken: string,
    userRole: string,
  ) {
    localStorage.setItem(
      TOKEN_KEY,
      accessToken,
    );

    localStorage.setItem(
      "medidiet_user_role",
      userRole,
    );

    setToken(accessToken);
    setRole(userRole);
  }


  function handleLogout() {
    localStorage.removeItem(
      TOKEN_KEY,
    );

    localStorage.removeItem(
      "medidiet_user_role",
    );

    setToken(null);
    setRole(null);
  }


  if (!token) {
    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }


  if (role === "doctor") {
    return (
      <>
        {backendState === "offline" && (
          <div className="backend-warning">
            Backend is currently unavailable.
          </div>
        )}

        <Dashboard
          token={token}
          onLogout={handleLogout}
        />
      </>
    );
  }


  if (role === "patient") {
    return (
      <PatientDashboard
        token={token}
        onLogout={handleLogout}
      />
    );
  }


  handleLogout();

  return null;
}

export default App;