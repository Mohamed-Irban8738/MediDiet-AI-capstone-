import React, { useState } from "react";
import { UserRole, UserSession } from "../types";
import {
  Stethoscope,
  HeartPulse,
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  UserCheck,
  CheckCircle2,
  Building2,
  Sparkles,
} from "lucide-react";

interface LoginViewProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [activeRole, setActiveRole] = useState<UserRole>("doctor");
  const [email, setEmail] = useState("doctor@medidiet.ai");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRoleSwitch = (role: UserRole) => {
    setActiveRole(role);
    setErrorMsg(null);
    if (role === "doctor") {
      setEmail("doctor@medidiet.ai");
      setPassword("password123");
    } else {
      setEmail("elena.sterling@example.com");
      setPassword("patient123");
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string, role: UserRole) => {
    setActiveRole(role);
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          role: activeRole,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Authentication failed.");
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMsg(err.message || "Unable to connect to authentication server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col justify-between selection:bg-primary/20 selection:text-primary">
      {/* Top Portal Banner Bar */}
      <header className="w-full bg-surface/90 border-b border-outline-variant/40 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-container text-white flex items-center justify-center shadow-md shadow-primary/20">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-heading font-bold text-lg text-on-surface tracking-tight">
                MediDiet AI
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                Medical Network
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-medium">
              Clinical Nutrition & Patient Care Portal
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-4 text-xs text-on-surface-variant">
          <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-Bit Encrypted Portal</span>
          </div>
        </div>
      </header>

      {/* Main Login Canvas Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl bg-surface rounded-3xl border border-outline-variant/60 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* Left Decorative Information Panel */}
          <div className="md:col-span-5 bg-gradient-to-br from-primary-container/80 via-primary-container/30 to-surface p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-outline-variant/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center space-x-2 text-primary bg-primary/10 px-3 py-1 rounded-full text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Full-Stack Authentication</span>
              </div>

              <h1 className="text-2xl font-heading font-bold text-on-surface leading-tight">
                {activeRole === "doctor"
                  ? "Clinical Care Provider Portal"
                  : "Patient Personal Health Portal"}
              </h1>

              <p className="text-sm text-on-surface-variant leading-relaxed">
                {activeRole === "doctor"
                  ? "Access patient directory, generate AI-augmented diet plans, review consultations, and manage dietary progress."
                  : "Track daily meals, monitor target calories, view your personalized dietitian plan, and communicate directly with your care team."}
              </p>

              {/* Dynamic Feature Highlights */}
              <div className="space-y-3 pt-2">
                {activeRole === "doctor" ? (
                  <>
                    <div className="flex items-start space-x-3 text-xs text-on-surface">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>ICD-10 & Medical Nutrition Therapy support</span>
                    </div>
                    <div className="flex items-start space-x-3 text-xs text-on-surface">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>AI-driven allergen & contraindication safety checks</span>
                    </div>
                    <div className="flex items-start space-x-3 text-xs text-on-surface">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>Real-time patient weight & macro logging synchronization</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start space-x-3 text-xs text-on-surface">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Interactive daily meal schedule & recipe guides</span>
                    </div>
                    <div className="flex items-start space-x-3 text-xs text-on-surface">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>1-click meal completion & weight trend tracking</span>
                    </div>
                    <div className="flex items-start space-x-3 text-xs text-on-surface">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Direct secure messaging with your assigned dietitian</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Demo Pre-fill Accounts */}
            <div className="mt-8 pt-6 border-t border-outline-variant/40 relative z-10">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant block mb-3">
                Quick Demo Access (1-Click Fill)
              </span>
              <div className="space-y-2">
                {activeRole === "doctor" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleQuickFill("doctor@medidiet.ai", "password123", "doctor")}
                      className="w-full text-left p-2.5 rounded-xl bg-surface/80 hover:bg-surface border border-outline-variant/50 hover:border-primary/40 transition-all text-xs flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-semibold text-on-surface flex items-center space-x-1.5">
                          <span>Dr. Sarah Jenkins</span>
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-normal">MD</span>
                        </div>
                        <div className="text-[11px] text-on-surface-variant">doctor@medidiet.ai</div>
                      </div>
                      <UserCheck className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickFill("dr.miller@medidiet.ai", "password123", "doctor")}
                      className="w-full text-left p-2.5 rounded-xl bg-surface/80 hover:bg-surface border border-outline-variant/50 hover:border-primary/40 transition-all text-xs flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-semibold text-on-surface flex items-center space-x-1.5">
                          <span>Dr. S. Miller</span>
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-normal">PhD</span>
                        </div>
                        <div className="text-[11px] text-on-surface-variant">dr.miller@medidiet.ai</div>
                      </div>
                      <UserCheck className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleQuickFill("elena.sterling@example.com", "patient123", "patient")}
                      className="w-full text-left p-2.5 rounded-xl bg-surface/80 hover:bg-surface border border-outline-variant/50 hover:border-emerald-500/40 transition-all text-xs flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-semibold text-on-surface">Elena Sterling</div>
                        <div className="text-[11px] text-on-surface-variant">Low FODMAP Protocol</div>
                      </div>
                      <UserCheck className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickFill("marcus.vance@example.com", "patient123", "patient")}
                      className="w-full text-left p-2.5 rounded-xl bg-surface/80 hover:bg-surface border border-outline-variant/50 hover:border-emerald-500/40 transition-all text-xs flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-semibold text-on-surface">Marcus Vance</div>
                        <div className="text-[11px] text-on-surface-variant">Glycemic Control Plan</div>
                      </div>
                      <UserCheck className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
            <div>
              {/* Role Switcher Tabs */}
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl mb-8 border border-outline-variant/40">
                <button
                  type="button"
                  onClick={() => handleRoleSwitch("doctor")}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-2 ${
                    activeRole === "doctor"
                      ? "bg-surface text-primary shadow-sm border border-outline-variant/50"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Doctor / Clinician</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSwitch("patient")}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-2 ${
                    activeRole === "patient"
                      ? "bg-surface text-emerald-600 dark:text-emerald-400 shadow-sm border border-outline-variant/50"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <HeartPulse className="w-4 h-4" />
                  <span>Patient Login</span>
                </button>
              </div>

              {/* Header Title */}
              <div className="mb-6">
                <h2 className="text-xl font-heading font-bold text-on-surface flex items-center space-x-2">
                  <span>Sign in as {activeRole === "doctor" ? "Doctor" : "Patient"}</span>
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  Enter your credentials to access your secure {activeRole === "doctor" ? "clinical workstation" : "health dashboard"}.
                </p>
              </div>

              {/* Error Message Alert */}
              {errorMsg && (
                <div className="mb-6 p-4 rounded-2xl bg-error-container/40 text-on-error-container border border-error-container text-xs flex items-start space-x-3 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Authentication Error</span>
                    <span>{errorMsg}</span>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                    {activeRole === "doctor" ? "Clinical Email Address" : "Patient Email Address"}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-on-surface-variant" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={activeRole === "doctor" ? "doctor@medidiet.ai" : "patient@example.com"}
                      className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-on-surface-variant">
                      Account Password
                    </label>
                    <span className="text-[11px] text-primary hover:underline cursor-pointer">
                      Forgot password?
                    </span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-on-surface-variant" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-3 bg-surface border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-xs text-on-surface-variant hover:text-on-surface font-medium"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3.5 px-6 rounded-xl font-medium text-sm text-white flex items-center justify-center space-x-2 transition-all shadow-md ${
                      activeRole === "doctor"
                        ? "bg-primary hover:bg-primary/90 shadow-primary/20"
                        : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In to {activeRole === "doctor" ? "Doctor Portal" : "Patient Portal"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Footer Trust Badges */}
            <div className="mt-8 pt-4 border-t border-outline-variant/30 flex items-center justify-between text-[11px] text-on-surface-variant">
              <div className="flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protected Medical Data Protocol</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>MediDiet Clinical v3.2</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-on-surface-variant border-t border-outline-variant/30 bg-surface/50">
        MediDiet AI &copy; 2026 Medical Nutrition Decision Support Engine. All clinical permissions governed by assigned attending physician.
      </footer>
    </div>
  );
};
