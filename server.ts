import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini SDK on server-side only
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined. Server AI features will fallback gracefully.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Mock Database for Auth & Patient Sessions
const MOCK_USERS = [
  {
    id: "doc-1",
    email: "doctor@medidiet.ai",
    password: "password123",
    name: "Dr. Sarah Jenkins",
    title: "MD, Lead Clinical Nutritionist",
    role: "doctor",
    speciality: "Gastroenterology & Medical Nutrition",
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "doc-2",
    email: "dr.miller@medidiet.ai",
    password: "password123",
    name: "Dr. S. Miller",
    title: "PhD, Senior Registered Dietitian",
    role: "doctor",
    speciality: "Metabolic Health & Type 2 Diabetes",
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "pat-1",
    email: "elena.sterling@example.com",
    password: "patient123",
    name: "Elena Sterling",
    role: "patient",
    patientId: "PT-8842-X",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "pat-2",
    email: "marcus.vance@example.com",
    password: "patient123",
    name: "Marcus Vance",
    role: "patient",
    patientId: "PT-9104-Y",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "pat-3",
    email: "clara.duval@example.com",
    password: "patient123",
    name: "Clara Duval",
    role: "patient",
    patientId: "PT-3310-Z",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  },
];

// Patient portal records store
let patientPortalStore: Record<string, any> = {
  "PT-8842-X": {
    patientId: "PT-8842-X",
    name: "Elena Sterling",
    age: 42,
    gender: "Female",
    assignedDoctor: "Dr. Sarah Jenkins, MD",
    dietPlanName: "Low FODMAP & Anti-Inflammatory Protocol",
    caloricTarget: 2400,
    consumedCalories: 1450,
    riskLevel: "Moderate",
    status: "In-Treatment",
    allergies: ["Shellfish", "Penicillin", "High-Lactose Dairy"],
    chronicConditions: ["Gastroesophageal Reflux", "IBS-C"],
    macros: {
      protein: { current: 85, target: 120 },
      carbs: { current: 140, target: 200 },
      fats: { current: 42, target: 65 },
    },
    weight: 68.5,
    weightHistory: [
      { date: "Jul 1", weight: 72.0 },
      { date: "Jul 15", weight: 70.8 },
      { date: "Aug 1", weight: 69.4 },
      { date: "Aug 10", weight: 68.5 },
    ],
    todaySchedule: [
      { id: "m1", time: "08:00 AM", name: "Gluten-Free Oats with Almond Milk & Chia Seeds", calories: 380, macroLabel: "P: 14g | C: 52g | F: 12g", statusBorderColor: "border-emerald-500", completed: true },
      { id: "m2", time: "10:30 AM", name: "Blueberry & Spinach Hydrolyzed Collagen Smoothie", calories: 220, macroLabel: "P: 18g | C: 28g | F: 4g", statusBorderColor: "border-emerald-500", completed: true },
      { id: "m3", time: "01:00 PM", name: "Baked Salmon with Quinoa and Steamed Zucchini", calories: 550, macroLabel: "P: 42g | C: 45g | F: 20g", statusBorderColor: "border-amber-500", completed: false },
      { id: "m4", time: "04:30 PM", name: "Walnuts (30g) and Lactose-Free Greek Yogurt", calories: 210, macroLabel: "P: 12g | C: 15g | F: 12g", statusBorderColor: "border-slate-300", completed: false },
      { id: "m5", time: "07:30 PM", name: "Herb Roasted Chicken Breast with Sweet Potato Puree", calories: 540, macroLabel: "P: 48g | C: 50g | F: 14g", statusBorderColor: "border-slate-300", completed: false },
    ],
    doctorNotes: "Patient reports 60% reduction in bloating. Continue low FODMAP phase for 2 more weeks before structured reintroduction.",
    messages: [
      { sender: "Dr. Sarah Jenkins", text: "Hi Elena, please remember to log your evening water intake and avoid raw cruciferous vegetables after 6 PM.", time: "Yesterday, 4:15 PM" },
      { sender: "Elena Sterling", text: "Thank you Dr. Jenkins, feeling much better after switching to the cooked quinoa lunches!", time: "Today, 9:30 AM" }
    ]
  },
  "PT-9104-Y": {
    patientId: "PT-9104-Y",
    name: "Marcus Vance",
    age: 58,
    gender: "Male",
    assignedDoctor: "Dr. S. Miller, PhD",
    dietPlanName: "Glycemic Control & DASH Hybrid",
    caloricTarget: 2100,
    consumedCalories: 1620,
    riskLevel: "High",
    status: "In-Treatment",
    allergies: ["Peanuts"],
    chronicConditions: ["Type 2 Diabetes", "Hypertension"],
    macros: {
      protein: { current: 110, target: 140 },
      carbs: { current: 150, target: 180 },
      fats: { current: 48, target: 60 },
    },
    weight: 92.3,
    weightHistory: [
      { date: "Jul 1", weight: 96.0 },
      { date: "Jul 15", weight: 94.5 },
      { date: "Aug 1", weight: 93.1 },
      { date: "Aug 10", weight: 92.3 },
    ],
    todaySchedule: [
      { id: "m1", time: "08:00 AM", name: "Poached Eggs on Whole Grain Rye with Avocado", calories: 420, macroLabel: "P: 22g | C: 30g | F: 22g", completed: true },
      { id: "m2", time: "11:00 AM", name: "Handful of Roasted Almonds & Green Tea", calories: 180, macroLabel: "P: 6g | C: 8g | F: 14g", completed: true },
      { id: "m3", time: "01:30 PM", name: "Grilled Turkey Breast Bowl with Brown Rice & Broccoli", calories: 580, macroLabel: "P: 48g | C: 55g | F: 16g", completed: true },
      { id: "m4", time: "07:00 PM", name: "Cod Fillet with Steamed Asparagus & Olive Oil Drizzle", calories: 440, macroLabel: "P: 40g | C: 20g | F: 18g", completed: false },
    ],
    doctorNotes: "Fasting blood sugar down to 118 mg/dL. Keep sodium under 1,800mg daily.",
    messages: [
      { sender: "Dr. S. Miller", text: "Great progress on your blood glucose readings Marcus. Let us review your lab work on Friday.", time: "Aug 8, 11:00 AM" }
    ]
  },
  "PT-3310-Z": {
    patientId: "PT-3310-Z",
    name: "Clara Duval",
    age: 34,
    gender: "Female",
    assignedDoctor: "Dr. Sarah Jenkins, MD",
    dietPlanName: "Post-Surgical Gut Recovery",
    caloricTarget: 1950,
    consumedCalories: 1100,
    riskLevel: "Low",
    status: "Stable",
    allergies: ["Gluten", "Tree Nuts"],
    chronicConditions: ["Celiac Disease"],
    macros: {
      protein: { current: 70, target: 110 },
      carbs: { current: 120, target: 190 },
      fats: { current: 35, target: 55 },
    },
    weight: 56.0,
    weightHistory: [
      { date: "Jul 1", weight: 54.5 },
      { date: "Jul 15", weight: 55.2 },
      { date: "Aug 1", weight: 55.8 },
      { date: "Aug 10", weight: 56.0 },
    ],
    todaySchedule: [
      { id: "m1", time: "08:30 AM", name: "Gluten-Free Rice Porridge with Banana Puree", calories: 340, macroLabel: "P: 8g | C: 65g | F: 4g", completed: true },
      { id: "m2", time: "12:30 PM", name: "Bone Broth Soup with Shredded Chicken & Carrots", calories: 380, macroLabel: "P: 36g | C: 22g | F: 12g", completed: true },
      { id: "m3", time: "06:30 PM", name: "Mashed Sweet Potato with Steamed White Fish", calories: 380, macroLabel: "P: 30g | C: 45g | F: 8g", completed: false },
    ],
    doctorNotes: "Weight gain trajectory is on target (+1.5kg). Continue strict gluten-free recovery diet.",
    messages: [
      { sender: "Dr. Sarah Jenkins", text: "How are you tolerating the evening bone broth, Clara?", time: "Aug 9, 2:00 PM" }
    ]
  }
};

// API: Authentication Route
app.post("/api/auth/login", (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: "Email, password, and target role are required." });
  }

  const user = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role
  );

  if (!user || user.password !== password) {
    return res.status(401).json({
      error: `Invalid credentials for ${role === "doctor" ? "Doctor/Clinician" : "Patient"} portal. Check password or selected login role.`,
    });
  }

  // Return sanitized user session
  const { password: _, ...userSession } = user;
  return res.json({
    success: true,
    user: userSession,
    message: `Logged in successfully as ${user.name} (${user.role === "doctor" ? "Clinician" : "Patient"})`,
  });
});

// API: Patient Portal Data Route
app.get("/api/patient/portal/:patientId", (req, res) => {
  const { patientId } = req.params;
  const data = patientPortalStore[patientId];

  if (!data) {
    // Fallback if newly registered patient or unknown ID
    return res.json({
      success: true,
      data: {
        patientId,
        name: "Patient",
        dietPlanName: "Standard Clinical Nutrition Protocol",
        caloricTarget: 2000,
        consumedCalories: 1200,
        todaySchedule: [],
        weightHistory: [{ date: "Today", weight: 70.0 }],
        macros: { protein: { current: 60, target: 100 }, carbs: { current: 120, target: 200 }, fats: { current: 30, target: 60 } },
        messages: [],
      },
    });
  }

  return res.json({ success: true, data });
});

// API: Toggle Patient Meal Completion
app.post("/api/patient/toggle-meal", (req, res) => {
  const { patientId, mealId } = req.body;
  if (!patientId || !mealId) {
    return res.status(400).json({ error: "patientId and mealId are required." });
  }

  const patientData = patientPortalStore[patientId];
  if (patientData && patientData.todaySchedule) {
    patientData.todaySchedule = patientData.todaySchedule.map((m: any) => {
      if (m.id === mealId) {
        const completed = !m.completed;
        const calDiff = completed ? m.calories : -m.calories;
        patientData.consumedCalories = Math.max(0, patientData.consumedCalories + calDiff);
        return { ...m, completed };
      }
      return m;
    });
  }

  return res.json({ success: true, data: patientPortalStore[patientId] });
});

// API: Patient Log Weight
app.post("/api/patient/log-weight", (req, res) => {
  const { patientId, weight } = req.body;
  if (!patientId || !weight) {
    return res.status(400).json({ error: "patientId and weight are required." });
  }

  const patientData = patientPortalStore[patientId];
  if (patientData) {
    const numWeight = parseFloat(weight);
    patientData.weight = numWeight;
    const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    patientData.weightHistory.push({ date: dateStr, weight: numWeight });
  }

  return res.json({ success: true, data: patientPortalStore[patientId] });
});

// API: Patient Send Message to Doctor
app.post("/api/patient/send-message", (req, res) => {
  const { patientId, senderName, text } = req.body;
  if (!patientId || !text) {
    return res.status(400).json({ error: "patientId and message text are required." });
  }

  const patientData = patientPortalStore[patientId];
  if (patientData) {
    const timeStr = "Today, " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    patientData.messages.push({
      sender: senderName || patientData.name,
      text,
      time: timeStr
    });
  }

  return res.json({ success: true, messages: patientData?.messages || [] });
});

// API: AI Meal Plan Generator
app.post("/api/generate-meal-plan", async (req, res) => {
  try {
    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key is not configured.",
      });
    }

    const {
      patientName = "Patient",
      dietType = "Low FODMAP",
      calorieTarget = 2400,
      allergies = ["Shellfish", "Penicillin"],
      conditions = ["Type 2 Diabetes"],
      macroGoals = { protein: "120g", carbs: "200g", fats: "65g" },
      additionalNotes = "",
    } = req.body;

    const prompt = `You are a clinical dietitian creating a medical-grade meal plan for patient ${patientName}.
Diet Type: ${dietType}
Daily Calorie Target: ${calorieTarget} kcal
Macro Targets: Protein: ${macroGoals.protein}, Carbs: ${macroGoals.carbs}, Fats: ${macroGoals.fats}
Allergies / Intolerances: ${allergies.join(", ") || "None"}
Chronic Conditions: ${conditions.join(", ") || "None"}
Additional Clinical Notes: ${additionalNotes}

Generate a comprehensive daily meal plan with 5 schedule slots (08:00 Breakfast, 10:30 Morning Snack, 13:00 Lunch, 16:00 Afternoon Snack, 19:30 Dinner). Ensure strict adherence to allergies and condition protocols. Include clinical rationale notes for the dietitian.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a clinical dietitian expert specializing in medical nutrition therapy.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            dietType: { type: Type.STRING },
            targetCalories: { type: Type.NUMBER },
            clinicalSummary: { type: Type.STRING },
            clinicalRationale: { type: Type.STRING },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  mealName: { type: Type.STRING },
                  calories: { type: Type.NUMBER },
                  protein: { type: Type.STRING },
                  carbs: { type: Type.STRING },
                  fats: { type: Type.STRING },
                  category: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ["time", "mealName", "calories"],
              },
            },
            micronutrientHighlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            warningsOrContraindications: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["title", "dietType", "targetCalories", "schedule", "clinicalSummary"],
        },
      },
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);

    return res.json({ success: true, mealPlan: data });
  } catch (error: any) {
    console.error("Error generating meal plan:", error);
    return res.status(500).json({ error: error.message || "Failed to generate AI meal plan" });
  }
});

// API: AI Clinical Consultation Analyzer
app.post("/api/consultation-ai", async (req, res) => {
  try {
    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({ error: "Gemini API key is not configured." });
    }

    const { patientName, age, gender, weight, height, bp, hba1c, glucose, primaryGoal, clinicalNotes } = req.body;

    const prompt = `Analyze clinical consultation data for patient:
Name: ${patientName}
Age: ${age}, Gender: ${gender}
Vitals: Weight ${weight} kg, BP ${bp}, HbA1c ${hba1c}%, Fasting Glucose ${glucose} mg/dL
Primary Goal: ${primaryGoal}
Notes: ${clinicalNotes}

Provide a clinical summary, recommended nutrition protocol, 3 immediate action items for the dietitian, and key biomarkers to monitor.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a clinical decision support system for registered dietitians.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            assessmentSummary: { type: Type.STRING },
            recommendedDietProtocol: { type: Type.STRING },
            recommendedCalorieTarget: { type: Type.NUMBER },
            actionItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            biomarkersToMonitor: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            riskLevel: { type: Type.STRING },
          },
          required: ["assessmentSummary", "recommendedDietProtocol", "actionItems", "riskLevel"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    return res.json({ success: true, analysis: data });
  } catch (error: any) {
    console.error("Error analyzing consultation:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze consultation" });
  }
});

// Start Express + Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MediDiet AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
