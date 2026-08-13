#!/usr/bin/env python3
import http.server
import socketserver
import json
import os
import sys
import urllib.request
import urllib.parse
import subprocess
import mimetypes
from pathlib import Path

PORT = 3000
HOST = "0.0.0.0"
DIST_DIR = Path(__file__).parent / "dist"

# Ensure frontend build assets exist
def build_frontend():
    index_html = DIST_DIR / "index.html"
    if not index_html.exists():
        print("[Python Server] dist/index.html missing. Building frontend...")
        try:
            # shell=True enables finding npx / npm on Windows systems
            subprocess.run(["npx", "vite", "build"], check=True, shell=os.name == "nt")
            print("[Python Server] Frontend built successfully!")
        except Exception as e:
            print(f"[Python Server] Build warning: {e}", file=sys.stderr)
    else:
        print("[Python Server] Frontend assets found in dist/.")

# Mock Database Store in Python
MOCK_USERS = [
    {
        "id": "doc-1",
        "email": "mohamed@gmail.com",
        "password": "password123",
        "name": "Dr.Mohamed",
        "title": "MD, Lead Clinical Nutritionist",
        "role": "doctor",
        "speciality": "Gastroenterology & Medical Nutrition",
        "avatarUrl": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
    },
    {
        "id": "doc-2",
        "email": "dr.miller@medidiet.ai",
        "password": "password123",
        "name": "Dr. S. Miller",
        "title": "PhD, Senior Registered Dietitian",
        "role": "doctor",
        "speciality": "Metabolic Health & Type 2 Diabetes",
        "avatarUrl": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
    },
    {
        "id": "pat-1",
        "email": "elena.sterling@example.com",
        "password": "patient123",
        "name": "Elena Sterling",
        "role": "patient",
        "patientId": "PT-8842-X",
        "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    {
        "id": "pat-2",
        "email": "marcus.vance@example.com",
        "password": "patient123",
        "name": "Marcus Vance",
        "role": "patient",
        "patientId": "PT-9104-Y",
        "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    {
        "id": "pat-3",
        "email": "clara.duval@example.com",
        "password": "patient123",
        "name": "Clara Duval",
        "role": "patient",
        "patientId": "PT-3310-Z",
        "avatarUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    },
]

patient_portal_store = {
    "PT-8842-X": {
        "patientId": "PT-8842-X",
        "name": "Elena Sterling",
        "age": 42,
        "gender": "Female",
        "assignedDoctor": "Dr. Sarah Jenkins, MD",
        "dietPlanName": "Low FODMAP & Anti-Inflammatory Protocol",
        "caloricTarget": 2400,
        "consumedCalories": 1450,
        "riskLevel": "Moderate",
        "status": "In-Treatment",
        "allergies": ["Shellfish", "Penicillin", "High-Lactose Dairy"],
        "chronicConditions": ["Gastroesophageal Reflux", "IBS-C"],
        "macros": {
            "protein": {"current": 85, "target": 120},
            "carbs": {"current": 140, "target": 200},
            "fats": {"current": 42, "target": 65},
        },
        "weight": 68.5,
        "weightHistory": [
            {"date": "Jul 1", "weight": 72.0},
            {"date": "Jul 15", "weight": 70.8},
            {"date": "Aug 1", "weight": 69.4},
            {"date": "Aug 10", "weight": 68.5},
        ],
        "todaySchedule": [
            {"id": "m1", "time": "08:00 AM", "name": "Gluten-Free Oats with Almond Milk & Chia Seeds", "calories": 380, "macroLabel": "P: 14g | C: 52g | F: 12g", "completed": True},
            {"id": "m2", "time": "10:30 AM", "name": "Blueberry & Spinach Hydrolyzed Collagen Smoothie", "calories": 220, "macroLabel": "P: 18g | C: 28g | F: 4g", "completed": True},
            {"id": "m3", "time": "01:00 PM", "name": "Baked Salmon with Quinoa and Steamed Zucchini", "calories": 550, "macroLabel": "P: 42g | C: 45g | F: 20g", "completed": False},
            {"id": "m4", "time": "04:30 PM", "name": "Walnuts (30g) and Lactose-Free Greek Yogurt", "calories": 210, "macroLabel": "P: 12g | C: 15g | F: 12g", "completed": False},
            {"id": "m5", "time": "07:30 PM", "name": "Herb Roasted Chicken Breast with Sweet Potato Puree", "calories": 540, "macroLabel": "P: 48g | C: 50g | F: 14g", "completed": False},
        ],
        "doctorNotes": "Patient reports 60% reduction in bloating. Continue low FODMAP phase for 2 more weeks before structured reintroduction.",
        "messages": [
            {"sender": "Dr. Sarah Jenkins", "text": "Hi Elena, please remember to log your evening water intake and avoid raw cruciferous vegetables after 6 PM.", "time": "Yesterday, 4:15 PM"},
            {"sender": "Elena Sterling", "text": "Thank you Dr. Jenkins, feeling much better after switching to the cooked quinoa lunches!", "time": "Today, 9:30 AM"}
        ]
    },
    "PT-9104-Y": {
        "patientId": "PT-9104-Y",
        "name": "Marcus Vance",
        "age": 58,
        "gender": "Male",
        "assignedDoctor": "Dr. S. Miller, PhD",
        "dietPlanName": "Glycemic Control & DASH Hybrid",
        "caloricTarget": 2100,
        "consumedCalories": 1620,
        "riskLevel": "High",
        "status": "In-Treatment",
        "allergies": ["Peanuts"],
        "chronicConditions": ["Type 2 Diabetes", "Hypertension"],
        "macros": {
            "protein": {"current": 110, "target": 140},
            "carbs": {"current": 150, "target": 180},
            "fats": {"current": 48, "target": 60},
        },
        "weight": 92.3,
        "weightHistory": [
            {"date": "Jul 1", "weight": 96.0},
            {"date": "Jul 15", "weight": 94.5},
            {"date": "Aug 1", "weight": 93.1},
            {"date": "Aug 10", "weight": 92.3},
        ],
        "todaySchedule": [
            {"id": "m1", "time": "08:00 AM", "name": "Poached Eggs on Whole Grain Rye with Avocado", "calories": 420, "macroLabel": "P: 22g | C: 30g | F: 22g", "completed": True},
            {"id": "m2", "time": "11:00 AM", "name": "Handful of Roasted Almonds & Green Tea", "calories": 180, "macroLabel": "P: 6g | C: 8g | F: 14g", "completed": True},
            {"id": "m3", "time": "01:30 PM", "name": "Grilled Turkey Breast Bowl with Brown Rice & Broccoli", "calories": 580, "macroLabel": "P: 48g | C: 55g | F: 16g", "completed": True},
            {"id": "m4", "time": "07:00 PM", "name": "Cod Fillet with Steamed Asparagus & Olive Oil Drizzle", "calories": 440, "macroLabel": "P: 40g | C: 20g | F: 18g", "completed": False},
        ],
        "doctorNotes": "Fasting blood sugar down to 118 mg/dL. Keep sodium under 1,800mg daily.",
        "messages": [
            {"sender": "Dr. S. Miller", "text": "Great progress on your blood glucose readings Marcus. Let us review your lab work on Friday.", "time": "Aug 8, 11:00 AM"}
        ]
    },
    "PT-3310-Z": {
        "patientId": "PT-3310-Z",
        "name": "Clara Duval",
        "age": 34,
        "gender": "Female",
        "assignedDoctor": "Dr. Sarah Jenkins, MD",
        "dietPlanName": "Post-Surgical Gut Recovery",
        "caloricTarget": 1950,
        "consumedCalories": 1100,
        "riskLevel": "Low",
        "status": "Stable",
        "allergies": ["Gluten", "Tree Nuts"],
        "chronicConditions": ["Celiac Disease"],
        "macros": {
            "protein": {"current": 70, "target": 110},
            "carbs": {"current": 120, "target": 190},
            "fats": {"current": 35, "target": 55},
        },
        "weight": 56.0,
        "weightHistory": [
            {"date": "Jul 1", "weight": 54.5},
            {"date": "Jul 15", "weight": 55.2},
            {"date": "Aug 1", "weight": 55.8},
            {"date": "Aug 10", "weight": 56.0},
        ],
        "todaySchedule": [
            {"id": "m1", "time": "08:30 AM", "name": "Gluten-Free Rice Porridge with Banana Puree", "calories": 340, "macroLabel": "P: 8g | C: 65g | F: 4g", "completed": True},
            {"id": "m2", "time": "12:30 PM", "name": "Bone Broth Soup with Shredded Chicken & Carrots", "calories": 380, "macroLabel": "P: 36g | C: 22g | F: 12g", "completed": True},
            {"id": "m3", "time": "06:30 PM", "name": "Mashed Sweet Potato with Steamed White Fish", "calories": 380, "macroLabel": "P: 30g | C: 45g | F: 8g", "completed": False},
        ],
        "doctorNotes": "Weight gain trajectory is on target (+1.5kg). Continue strict gluten-free recovery diet.",
        "messages": [
            {"sender": "Dr. Sarah Jenkins", "text": "How are you tolerating the evening bone broth, Clara?", "time": "Aug 9, 2:00 PM"}
        ]
    }
}

class MediDietHTTPRequestHandler(http.server.BaseHTTPRequestHandler):
    
    def log_message(self, format, *args):
        # Clean logging format
        print(f"[Python Server] {self.command} {self.path} -> {args[0] if args else ''}")

    def send_json(self, data, status=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, message, status=400):
        self.send_json({"success": False, "error": message}, status=status)

    def read_json_body(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length == 0:
            return {}
        raw = self.rfile.read(content_length).decode("utf-8")
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {}

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        # API Routes
        if path == "/api/health":
            return self.send_json({"status": "ok", "backend": "Python 3.10 HTTP Server"})

        if path.startswith("/api/patient/portal/"):
            patient_id = path.replace("/api/patient/portal/", "")
            data = patient_portal_store.get(patient_id)
            if not data:
                data = {
                    "patientId": patient_id,
                    "name": "Patient",
                    "dietPlanName": "Standard Clinical Nutrition Protocol",
                    "caloricTarget": 2000,
                    "consumedCalories": 1200,
                    "todaySchedule": [],
                    "weightHistory": [{"date": "Today", "weight": 70.0}],
                    "macros": {"protein": {"current": 60, "target": 100}, "carbs": {"current": 120, "target": 200}, "fats": {"current": 30, "target": 60}},
                    "messages": [],
                }
            return self.send_json({"success": True, "data": data})

        # Static File Serving from dist/
        return self.serve_static_file(path)

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        body = self.read_json_body()

        if path == "/api/auth/login":
            email = body.get("email", "").strip().lower()
            password = body.get("password", "")
            role = body.get("role", "")

            if not email or not password or not role:
                return self.send_error_json("Email, password, and role are required.")

            matched_user = None
            for u in MOCK_USERS:
                if u["email"].lower() == email and u["role"] == role:
                    matched_user = u
                    break

            if not matched_user or matched_user["password"] != password:
                return self.send_error_json(
                    f"Invalid credentials for {'Doctor/Clinician' if role == 'doctor' else 'Patient'} portal.",
                    status=401
                )

            user_session = {k: v for k, v in matched_user.items() if k != "password"}
            return self.send_json({
                "success": True,
                "user": user_session,
                "message": f"Successfully authenticated as {user_session['name']}"
            })

        if path == "/api/patient/toggle-meal":
            patient_id = body.get("patientId")
            meal_id = body.get("mealId")
            patient_data = patient_portal_store.get(patient_id)
            if patient_data and "todaySchedule" in patient_data:
                for meal in patient_data["todaySchedule"]:
                    if meal["id"] == meal_id:
                        meal["completed"] = not meal.get("completed", False)
                        cal_diff = meal["calories"] if meal["completed"] else -meal["calories"]
                        patient_data["consumedCalories"] = max(0, patient_data["consumedCalories"] + cal_diff)
            return self.send_json({"success": True, "data": patient_data})

        if path == "/api/patient/log-weight":
            patient_id = body.get("patientId")
            weight_val = body.get("weight")
            patient_data = patient_portal_store.get(patient_id)
            if patient_data and weight_val:
                num_weight = float(weight_val)
                patient_data["weight"] = num_weight
                patient_data["weightHistory"].append({"date": "Today", "weight": num_weight})
            return self.send_json({"success": True, "data": patient_data})

        if path == "/api/patient/send-message":
            patient_id = body.get("patientId")
            sender_name = body.get("senderName", "Patient")
            text = body.get("text", "").strip()
            patient_data = patient_portal_store.get(patient_id)
            if patient_data and text:
                patient_data["messages"].append({
                    "sender": sender_name,
                    "text": text,
                    "time": "Just now"
                })
            return self.send_json({"success": True, "messages": patient_data.get("messages", []) if patient_data else []})

        if path == "/api/generate-meal-plan":
            return self.handle_generate_meal_plan(body)

        return self.send_error_json("API Route not found", status=404)

    def handle_generate_meal_plan(self, body):
        patient_name = body.get("patientName", "Patient")
        caloric_target = body.get("caloricTarget", 2000)
        allergies = body.get("allergies", [])
        medical_conditions = body.get("medicalConditions", [])
        dietary_pref = body.get("dietaryPreference", "Standard")

        # Try Gemini API if key is present
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            try:
                prompt = f"""You are a clinical registered dietitian. Generate a detailed 1-day Medical Nutrition Therapy meal plan for:
Patient Name: {patient_name}
Target Calories: {caloric_target} kcal
Allergies: {', '.join(allergies) if allergies else 'None'}
Medical Conditions: {', '.join(medical_conditions) if medical_conditions else 'None'}
Dietary Preference: {dietary_pref}

Return ONLY a valid JSON object matching this structure:
{{
  "planTitle": "string",
  "summary": "string",
  "caloricTarget": number,
  "macroTargets": {{ "proteinGrams": number, "carbsGrams": number, "fatsGrams": number }},
  "meals": [
    {{
      "mealType": "Breakfast" | "Morning Snack" | "Lunch" | "Afternoon Snack" | "Dinner",
      "time": "string",
      "title": "string",
      "calories": number,
      "proteinGrams": number,
      "carbsGrams": number,
      "fatsGrams": number,
      "ingredients": ["string"],
      "clinicalNotes": "string"
    }}
  ]
}}"""
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
                req_data = json.dumps({"contents": [{"parts": [{"text": prompt}]}]}).encode("utf-8")
                req = urllib.request.Request(url, data=req_data, headers={"Content-Type": "application/json"})
                
                with urllib.request.urlopen(req, timeout=12) as resp:
                    resp_data = json.loads(resp.read().decode("utf-8"))
                    text_content = resp_data["candidates"][0]["content"]["parts"][0]["text"]
                    clean_json = text_content.replace("```json", "").replace("```", "").strip()
                    parsed_plan = json.loads(clean_json)
                    return self.send_json({"success": True, "mealPlan": parsed_plan})
            except Exception as e:
                print(f"[Python Server] Gemini API call fallback: {e}", file=sys.stderr)

        # High quality fallback plan
        fallback_plan = {
            "planTitle": f"Clinical {dietary_pref} Nutrition Protocol",
            "summary": f"Custom therapeutic meal schedule tailored for {patient_name} with target {caloric_target} kcal.",
            "caloricTarget": caloric_target,
            "macroTargets": {"proteinGrams": 120, "carbsGrams": 200, "fatsGrams": 65},
            "meals": [
                {
                    "mealType": "Breakfast",
                    "time": "08:00 AM",
                    "title": "Steel-Cut Oats with Chia Seeds & Almond Butter",
                    "calories": 420,
                    "proteinGrams": 16,
                    "carbsGrams": 58,
                    "fatsGrams": 14,
                    "ingredients": ["1 cup cooked steel-cut oats", "1 tbsp chia seeds", "1 tbsp almond butter", "1/2 cup blueberries"],
                    "clinicalNotes": "High soluble fiber to optimize lipid absorption and gut motility."
                },
                {
                    "mealType": "Lunch",
                    "time": "01:00 PM",
                    "title": "Pan-Seared Wild Salmon with Quinoa & Steamed Zucchini",
                    "calories": 580,
                    "proteinGrams": 42,
                    "carbsGrams": 48,
                    "fatsGrams": 20,
                    "ingredients": ["150g wild salmon fillet", "3/4 cup cooked quinoa", "1 cup steamed zucchini with olive oil drizzle"],
                    "clinicalNotes": "Omega-3 fatty acids for anti-inflammatory endothelial support."
                },
                {
                    "mealType": "Dinner",
                    "time": "07:00 PM",
                    "title": "Herb-Roasted Lean Chicken Breast with Sweet Potato Puree",
                    "calories": 520,
                    "proteinGrams": 46,
                    "carbsGrams": 50,
                    "fatsGrams": 12,
                    "ingredients": ["160g roasted chicken breast", "1 medium sweet potato", "1 cup steamed broccoli"],
                    "clinicalNotes": "Complex carbs to support nighttime liver glycogen storage."
                }
            ]
        }
        return self.send_json({"success": True, "mealPlan": fallback_plan})

    def serve_static_file(self, req_path):
        # Resolve clean relative path inside dist/
        safe_path = req_path.lstrip("/")
        file_path = DIST_DIR / safe_path

        # If file doesn't exist or is a directory, fallback to index.html (SPA routing)
        if not safe_path or not file_path.exists() or file_path.is_dir():
            file_path = DIST_DIR / "index.html"

        if not file_path.exists():
            return self.send_error_json("Build output missing. Run vite build.", status=404)

        try:
            mime_type, _ = mimetypes.guess_type(str(file_path))
            if not mime_type:
                if file_path.suffix == ".js":
                    mime_type = "application/javascript"
                elif file_path.suffix == ".css":
                    mime_type = "text/css"
                elif file_path.suffix == ".html":
                    mime_type = "text/html"
                else:
                    mime_type = "application/octet-stream"

            with open(file_path, "rb") as f:
                content = f.read()

            self.send_response(200)
            self.send_header("Content-Type", mime_type)
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error_json(f"Error serving file: {e}", status=500)


def run_server():
    build_frontend()
    server_address = (HOST, PORT)
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(server_address, MediDietHTTPRequestHandler)
    print(f"[Python Server] Running full-stack MediDiet server on http://{HOST}:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[Python Server] Server stopped gracefully.")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
