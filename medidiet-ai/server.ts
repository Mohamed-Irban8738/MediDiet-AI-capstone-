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
