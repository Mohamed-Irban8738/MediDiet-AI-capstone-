import React, { useState, useEffect } from "react";
import {
  Utensils,
  CheckCircle2,
  Circle,
  Flame,
  Scale,
  MessageSquare,
  Send,
  LogOut,
  Sparkles,
  Calendar,
  Apple,
  Award,
  Clock,
  Plus,
  RefreshCw,
} from "lucide-react";

export const PatientPortalView = ({ session, onLogout }) => {
  const [patientData, setPatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newWeight, setNewWeight] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isSubmittingWeight, setIsSubmittingWeight] = useState(false);
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  const patientId = session.patientId || "PT-8842-X";

  // Fetch patient portal data from backend
  const fetchPortalData = async () => {
    try {
      const res = await fetch(`/api/patient/portal/${patientId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setPatientData(json.data);
      }
    } catch (err) {
      console.error("Error loading patient portal data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, [patientId]);

  // Toggle meal completion on backend
  const handleToggleMeal = async (mealId) => {
    try {
      const res = await fetch("/api/patient/toggle-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, mealId }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setPatientData(json.data);
      }
    } catch (err) {
      console.error("Error toggling meal:", err);
    }
  };

  // Submit weight entry to backend
  const handleLogWeight = async (e) => {
    e.preventDefault();
    if (!newWeight || isNaN(Number(newWeight))) return;

    setIsSubmittingWeight(true);
    try {
      const res = await fetch("/api/patient/log-weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, weight: newWeight }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setPatientData(json.data);
        setNewWeight("");
      }
    } catch (err) {
      console.error("Error logging weight:", err);
    } finally {
      setIsSubmittingWeight(false);
    }
  };

  // Send message to doctor backend
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSendingMsg(true);
    try {
      const res = await fetch("/api/patient/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          senderName: session.name,
          text: newMessage.trim(),
        }),
      });
      const json = await res.json();
      if (json.success && json.messages) {
        setPatientData((prev) => ({ ...prev, messages: json.messages }));
        setNewMessage("");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsSendingMsg(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-on-surface">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-on-surface-variant">Loading Patient Care Portal...</p>
      </div>
    );
  }

  const consumed = patientData?.consumedCalories || 0;
  const target = patientData?.caloricTarget || 2000;
  const calPercent = Math.min(100, Math.round((consumed / target) * 100));

  const macros = patientData?.macros || {
    protein: { current: 0, target: 120 },
    carbs: { current: 0, target: 200 },
    fats: { current: 0, target: 65 },
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-on-surface pb-16">
      {/* Patient Header Navigation Bar */}
      <header className="sticky top-0 z-30 w-full bg-surface/90 border-b border-outline-variant/50 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <img
            src={session.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
            alt={session.name}
            className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-500/30"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-heading font-bold text-base sm:text-lg text-on-surface">
                {session.name}
              </h1>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                {session.patientId}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant flex items-center space-x-1">
              <span>Assigned Dietitian:</span>
              <span className="font-semibold text-primary">{patientData?.assignedDoctor || "Dr. Sarah Jenkins, MD"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchPortalData}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all"
            title="Refresh patient data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-3.5 py-2 bg-surface hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-error border border-outline-variant rounded-xl transition-all shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Patient Content Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Banner Card: Active Medical Diet Plan */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                <Apple className="w-3.5 h-3.5" />
                <span>Active Medical Nutrition Therapy Plan</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-white tracking-tight">
                {patientData?.dietPlanName || "Low FODMAP & Anti-Inflammatory Protocol"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                Custom prescribed by <span className="text-white font-medium">{patientData?.assignedDoctor}</span>. Tailored to reduce GI inflammation and maintain optimal daily glycemic balance.
              </p>
            </div>

            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 self-start md:self-auto">
              <Award className="w-8 h-8 text-amber-400 shrink-0" />
              <div>
                <div className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">Adherence Rank</div>
                <div className="text-base font-bold text-white">94% Compliant</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Grid: Today's Calorie & Macro Target Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Caloric Intake Progress */}
          <div className="md:col-span-5 bg-surface p-6 rounded-3xl border border-outline-variant/60 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-on-surface">Daily Caloric Target</h3>
                  <p className="text-xs text-on-surface-variant">Log meals to fulfill your daily allowance</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200">
                {calPercent}% Logged
              </span>
            </div>

            <div className="my-4 flex items-center justify-around">
              {/* Radial Meter Visual */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-slate-100 dark:text-slate-800 fill-none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeDasharray={326}
                    strokeDashoffset={326 - (326 * calPercent) / 100}
                    strokeLinecap="round"
                    className="text-emerald-500 transition-all duration-700 ease-out fill-none"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-bold font-heading text-on-surface">{consumed}</span>
                  <span className="text-[10px] text-on-surface-variant uppercase font-medium">/ {target} kcal</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-outline-variant/40">
                  <span className="text-on-surface-variant block text-[11px]">Remaining Cal</span>
                  <span className="font-bold text-on-surface text-sm">{Math.max(0, target - consumed)} kcal</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-outline-variant/40">
                  <span className="text-on-surface-variant block text-[11px]">Meal Status</span>
                  <span className="font-bold text-emerald-600 text-sm">On Track</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-on-surface-variant text-center bg-slate-50 dark:bg-slate-900 p-2.5 rounded-2xl border border-outline-variant/40 mt-2">
              💡 Tip: Space meals 3 hours apart to reduce stomach pressure and acid reflux.
            </p>
          </div>

          {/* Macro Targets Detail Card */}
          <div className="md:col-span-7 bg-surface p-6 rounded-3xl border border-outline-variant/60 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-on-surface">Macronutrient Target Status</h3>
                  <p className="text-xs text-on-surface-variant">Tracked against dietitian prescribed ratios</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 my-2">
              {/* Protein */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-on-surface font-semibold flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                    <span>Protein</span>
                  </span>
                  <span className="text-on-surface-variant font-mono">
                    {macros.protein.current}g / {macros.protein.target}g
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (macros.protein.current / macros.protein.target) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Carbs */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-on-surface font-semibold flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span>Carbohydrates</span>
                  </span>
                  <span className="text-on-surface-variant font-mono">
                    {macros.carbs.current}g / {macros.carbs.target}g
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (macros.carbs.current / macros.carbs.target) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Fats */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-on-surface font-semibold flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                    <span>Healthy Fats</span>
                  </span>
                  <span className="text-on-surface-variant font-mono">
                    {macros.fats.current}g / {macros.fats.target}g
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (macros.fats.current / macros.fats.target) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Allergies Notice */}
            <div className="mt-4 pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs">
              <span className="text-on-surface-variant font-medium">Recorded Allergies:</span>
              <div className="flex flex-wrap gap-1">
                {patientData?.allergies?.map((allergy, idx) => (
                  <span key={idx} className="bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-[11px] px-2 py-0.5 rounded-full font-medium border border-rose-200">
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Today's Interactive Meal Schedule */}
        <div className="bg-surface p-6 rounded-3xl border border-outline-variant/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-on-surface flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Today's Prescribed Meal Schedule</span>
              </h3>
              <p className="text-xs text-on-surface-variant">Check off each meal as you consume it to update your daily progress</p>
            </div>
            <span className="text-xs text-on-surface-variant font-medium bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-outline-variant/40">
              5 Meals Prescribed
            </span>
          </div>

          <div className="space-y-3">
            {patientData?.todaySchedule?.map((meal) => (
              <div
                key={meal.id}
                onClick={() => handleToggleMeal(meal.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                  meal.completed
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                    : "bg-surface hover:bg-slate-50 dark:hover:bg-slate-900 border-outline-variant/60"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <button type="button" className="text-emerald-600 dark:text-emerald-400 shrink-0">
                    {meal.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100 dark:fill-emerald-900" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-300 dark:text-slate-700 group-hover:text-emerald-500 transition-colors" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-primary flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{meal.time}</span>
                      </span>
                      {meal.completed && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 px-2 py-0.2 rounded-full font-semibold">
                          Consumed
                        </span>
                      )}
                    </div>
                    <div className={`font-medium text-sm text-on-surface mt-0.5 ${meal.completed ? "line-through text-on-surface-variant" : ""}`}>
                      {meal.name}
                    </div>
                    {meal.macroLabel && (
                      <div className="text-[11px] text-on-surface-variant mt-0.5">
                        {meal.macroLabel}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-heading font-bold text-sm text-on-surface">{meal.calories} kcal</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Split: Weight Tracker & Doctor Consultation Thread */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Weight & Vitals Log */}
          <div className="md:col-span-5 bg-surface p-6 rounded-3xl border border-outline-variant/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-on-surface">Weight & Progress Log</h3>
                  <p className="text-xs text-on-surface-variant">Log weight readings to track trajectory</p>
                </div>
              </div>
            </div>

            {/* Current Weight */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-outline-variant/40 flex items-center justify-between">
              <div>
                <span className="text-xs text-on-surface-variant block">Current Logged Weight</span>
                <span className="text-2xl font-bold font-heading text-on-surface">{patientData?.weight || 68.5} kg</span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200">
                On Target
              </span>
            </div>

            {/* Log Weight Form */}
            <form onSubmit={handleLogWeight} className="flex space-x-2">
              <input
                type="number"
                step="0.1"
                placeholder="New weight (e.g. 68.2)"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-surface border border-outline-variant rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={isSubmittingWeight || !newWeight}
                className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium text-xs rounded-xl transition-all flex items-center space-x-1 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Log Entry</span>
              </button>
            </form>

            {/* Weight History Table */}
            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-semibold text-on-surface-variant block">Recent Readings</span>
              {patientData?.weightHistory?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-outline-variant/30 last:border-none">
                  <span className="text-on-surface-variant">{item.date}</span>
                  <span className="font-semibold text-on-surface">{item.weight} kg</span>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor Communication & Clinical Guidance Thread */}
          <div className="md:col-span-7 bg-surface p-6 rounded-3xl border border-outline-variant/60 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-on-surface">Dietitian Guidance & Messages</h3>
                  <p className="text-xs text-on-surface-variant">Direct line to {patientData?.assignedDoctor}</p>
                </div>
              </div>

              {/* Latest Doctor Notes Box */}
              {patientData?.doctorNotes && (
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs space-y-1">
                  <div className="font-semibold text-amber-900 dark:text-amber-200 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Attending Dietitian Note</span>
                  </div>
                  <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                    "{patientData.doctorNotes}"
                  </p>
                </div>
              )}

              {/* Messages List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 pt-2">
                {patientData?.messages?.map((msg, idx) => {
                  const isMe = msg.sender === session.name;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl text-xs max-w-lg space-y-1 ${
                        isMe
                          ? "ml-auto bg-primary text-white rounded-br-none"
                          : "bg-slate-100 dark:bg-slate-800 text-on-surface rounded-bl-none"
                      }`}
                    >
                      <div className="flex justify-between items-center opacity-80 text-[10px] mb-0.5">
                        <span className="font-bold">{msg.sender}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Send Message Input */}
            <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-outline-variant/40 flex space-x-2">
              <input
                type="text"
                placeholder={`Type a message to ${patientData?.assignedDoctor}...`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-outline-variant rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={isSendingMsg || !newMessage.trim()}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>

        </div>

      </main>
    </div>
  );
};
