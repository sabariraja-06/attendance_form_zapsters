"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Particles from "@/components/ui/Particles";
import ShinyText from "@/components/ShinyText";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, error: authError, loginWithGoogle, login, loginWithMock } = useAuth();
  const [activeTab, setActiveTab] = useState<'student' | 'tutor'>('student');
  const [localError, setLocalError] = useState("");
  const [isDevMode, setIsDevMode] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'student') {
        router.push('/student/dashboard');
      } else if (user.role === 'tutor') {
        router.push('/tutor/dashboard');
      }
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    // @ts-ignore
    const email = e.target.email.value;
    // @ts-ignore
    const password = e.target.password.value;

    try {
      // In production, use real Firebase Auth
      // In development, this will fallback to mock if Firebase is not enabled
      await login(email, password);
    } catch (err: any) {
      setLocalError(err.message || "Login failed");
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#000", color: "#fff" }}>
        <div className="card" style={{ padding: "2rem", textAlign: "center", background: "#111", border: "1px solid #333" }}>
          <p style={{ color: "#fff" }}>Loading Zapsters...</p>
        </div>
      </div>
    );
  }

  const isTutor = activeTab === 'tutor';

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#000", fontFamily: "var(--font-inter)" }}>

      {/* Dynamic Particles Background */}
      <Particles
        particleCount={300}
        particleSpread={10}
        speed={0.1}
        particleColors={['#ffffff', '#ef4444']}
        moveParticlesOnHover={true}
        particleHoverFactor={1}
        alphaParticles={true}
        particleBaseSize={100}
        sizeRandomness={1}
        cameraDistance={20}
        disableRotation={false}
        className="particles-background"
      />

      <div className="login-card">

        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <h1 style={{
            fontSize: "2.2rem",
            fontWeight: "800",
            marginBottom: "0.5rem",
            color: "var(--primary-red)", // Red color for Zapsters
            textShadow: "0 2px 10px rgba(220, 38, 38, 0.3)"
          }}>
            Zapsters
          </h1>
          <p style={{ color: "#888", fontSize: "0.95rem" }}>Attendance Management System</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "#222", padding: "4px", borderRadius: "8px", marginBottom: "2rem" }}>
          <button
            onClick={() => setActiveTab('student')}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "6px",
              background: !isTutor ? "var(--primary-red)" : "transparent",
              color: !isTutor ? "#fff" : "#888",
              border: "none",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            Student
          </button>
          <button
            onClick={() => setActiveTab('tutor')}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "6px",
              background: isTutor ? "var(--primary-red)" : "transparent",
              color: isTutor ? "#fff" : "#888",
              border: "none",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            Tutor
          </button>
        </div>

        {(authError || localError) && (
          <div style={{ padding: "0.75rem", background: "rgba(220, 38, 38, 0.1)", color: "#ef4444", borderRadius: "6px", fontSize: "0.875rem", border: "1px solid rgba(220, 38, 38, 0.2)", marginBottom: "1.5rem" }}>
            {authError || localError}
          </div>
        )}

        {/* Conditional Login Forms */}
        {!isTutor ? (
          // STUDENT VIEW: Google Login
          <div style={{ marginBottom: "1.5rem" }}>
            <button
              onClick={handleGoogleLogin}
              className="btn"
              disabled={loading}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                background: "#fff",
                color: "#111",
                border: "none",
                fontWeight: "600",
                padding: "1rem",
                fontSize: "1rem",
                borderRadius: "8px"
              }}
            >
              <svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z" fill="#34A853" />
                <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </button>
            <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem", color: "#666" }}>
              <p>Students, please use your official email to sign in.</p>
            </div>
          </div>
        ) : (
          // TUTOR VIEW: Developer Access Form
          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ color: "#fff", fontSize: "1.1rem", marginBottom: "1rem", fontWeight: "600", textAlign: "center" }}>
              Developer Access
            </h3>
            <form onSubmit={handleEmailLogin}>
              <div style={{ marginBottom: "1rem" }}>
                <input
                  name="email"
                  type="email"
                  className="input"
                  placeholder="Tutor Email"
                  required
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    borderRadius: "8px",
                    background: "#222",
                    border: "1px solid #333",
                    color: "#fff",
                    outline: "none"
                  }}
                />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <input
                  name="password"
                  type="password"
                  className="input"
                  placeholder="Password"
                  required
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    borderRadius: "8px",
                    background: "#222",
                    border: "1px solid #333",
                    color: "#fff",
                    outline: "none"
                  }}
                />
              </div>
              <button
                type="submit"
                className="btn"
                disabled={loading}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #DC2626 0%, #7f1d1d 100%)",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "1rem",
                  padding: "1rem",
                  boxShadow: "0 4px 10px rgba(220, 38, 38, 0.3)",
                  border: "none",
                  borderRadius: "8px"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                Login to Tutor Dashboard
              </button>
            </form>
          </div>
        )}

        <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.875rem", color: "#666" }}>
          <p>Protected System for Zapsters</p>
        </div>
      </div>
    </div>
  );
}
