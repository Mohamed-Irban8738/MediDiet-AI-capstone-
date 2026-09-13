import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function App() {
  const [backend, setBackend] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then((res) => {
        if (!res.ok) throw new Error("Backend error");
        setBackend("online");
      })
      .catch(() => setBackend("offline"));
  }, []);

  return (
    <div className="shell">
      <header className="brand">
        <div className="logo">M</div>
        <div>
          <strong>MediDiet-AI</strong>
          <span>Medical Nutrition Platform</span>
        </div>
      </header>

      <main className="hero">
        <p className="label">BUILT FROM SCRATCH</p>
        <h1>Personalized nutrition, powered by local AI.</h1>
        <p className="intro">
          A separate React frontend, Python FastAPI backend, PostgreSQL database,
          and local Ollama + Gemma AI engine.
        </p>

        <div className="system-card">
          <div>
            <span className={`indicator ${backend}`} />
            Backend {backend === "online" ? "connected" : backend === "offline" ? "offline" : "checking"}
          </div>
          <div>PostgreSQL</div>
          <div>Ollama · Gemma</div>
        </div>
      </main>
    </div>
  );
}
