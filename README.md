#project  Title: Diet & Nutrition Planning SaaS for Clinics

# 🥗 MediDiet AI

### AI-Powered Diet & Nutrition Management SaaS for Clinics

MediDiet AI is a full-stack healthcare SaaS platform designed for clinics, doctors, and dietitians to securely manage patient nutrition and create personalized diet plans. The platform combines patient management, nutrition tracking, AI-powered recommendations, secure access control, and data-driven dashboards in a single system.

---

## 🚀 Features

* 👤 **Patient Management**

  * Patient profiles
  * Health and dietary information
  * Medical history
  * Patient assessments

* 🥗 **Diet Plan Management**

  * Create personalized diet plans
  * Manage meals and food items
  * Track calories and nutrients
  * Support dietary preferences and restrictions

* 🤖 **AI Nutrition Recommendations**

  * Personalized diet recommendations
  * AI-assisted meal planning
  * Nutrition suggestions based on patient information
  * Dietitian review and approval

* 📊 **Progress Monitoring**

  * Weight tracking
  * BMI tracking
  * Nutrition progress
  * Interactive dashboards

* 🔐 **Security**

  * Authentication
  * Role-based access control
  * Secure patient data
  * Audit logging
  * Clinic-level data isolation

* 🏥 **Multi-Clinic SaaS**

  * Multiple clinics
  * Clinic administrators
  * Doctors and dietitians
  * Patient access

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │     Web Browser     │
                    │  React + TypeScript │
                    └──────────┬──────────┘
                               │
                            REST API
                               │
                    ┌──────────▼──────────┐
                    │    Spring Boot      │
                    │      Backend       │
                    └──────┬───────┬──────┘
                           │       │
                ┌──────────┘       └──────────┐
                ▼                             ▼
       ┌─────────────────┐          ┌─────────────────┐
       │   PostgreSQL    │          │  AI Service     │
       │    Database     │          │ Python/FastAPI  │
       └─────────────────┘          └────────┬────────┘
                                             │
                                      AI Recommendations
                                             │
                                      ┌──────▼──────┐
                                      │ Dietitian   │
                                      │   Review    │
                                      └─────────────┘
```

---

## 🗄️ Database Design

The system uses a normalized relational database designed for efficient healthcare record management.

Core entities include:

* `Clinics`
* `Roles`
* `Users`
* `Patients`
* `Assessments`
* `Diet_Plans`
* `Meals`
* `Food_Items`
* `Progress_Records`
* `AI_Recommendations`
* `Documents`
* `Audit_Logs`

The database architecture is designed to support secure multi-clinic data isolation and efficient record management.

---

## 🧠 AI Recommendation Flow

```text
Patient Information
        ↓
Health & Dietary Assessment
        ↓
Nutrition Calculation
        ↓
Food & Nutrition Database
        ↓
AI Recommendation Engine
        ↓
Personalized Diet Suggestions
        ↓
Dietitian Review
        ↓
Approved Diet Plan
```

AI recommendations are intended to assist healthcare professionals rather than replace professional judgment.

---

## 🛠️ Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Backend

* Spring Boot
* REST APIs
* Spring Security
* JWT Authentication

### Database

* PostgreSQL
* JPA / Hibernate

### AI

* Python
* FastAPI
* Google Gemini API

### DevOps & Cloud

* Git
* GitHub
* Docker
* GitHub Actions
* Cloud deployment

---

## 📁 Project Structure

```text
MediDiet-AI/
│
├── src/
│   ├── components/
│   ├── data/
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
│
├── docs/
│   ├── architecture.png
│   └── er-diagram.md
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── server.ts
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .gitignore
└── README.md
```

---

## 💻 Running the Frontend

### Prerequisites

* Node.js 20+
* npm

### Installation

```bash
git clone https://github.com/Mohamed-Irban8738/MediDiet-AI-capstone-.git

cd MediDiet-AI-capstone-

npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_api_key_here
```

Do **not** commit `.env` or expose your API key.

### Start Development Server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

---

## 🔒 Security

MediDiet AI is designed with healthcare data privacy in mind.

Security considerations include:

* Role-based access control
* Authentication and authorization
* Password hashing
* HTTPS
* Secure environment variables
* Audit logging
* Clinic-level data isolation
* Restricted access to patient information

---

## 🎯 Project Goals

The main objectives of MediDiet AI are to:

1. Simplify patient nutrition management for clinics.
2. Reduce the time required to create personalized diet plans.
3. Use AI to assist healthcare professionals with nutrition recommendations.
4. Provide continuous patient progress monitoring.
5. Maintain secure and organized healthcare records.
6. Build a scalable multi-clinic SaaS platform.

---

## 🔮 Future Enhancements

* 📱 Mobile application
* 🗣️ Voice-based nutrition assistant
* 🌐 Multilingual support
* 📷 Food image recognition
* 📈 Advanced nutrition analytics
* 💳 SaaS subscription management
* ☁️ Production cloud deployment
* 🔔 Patient reminders and notifications
* 🧬 Advanced personalized nutrition models

---

## 👨‍💻 Project

**MediDiet AI – Diet & Nutrition Planning SaaS for Clinics**

An AI-powered healthcare technology project focused on personalized nutrition, secure patient management, and intelligent diet planning.

---

## 📄 License

This project is developed for educational and demonstration purposes.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
