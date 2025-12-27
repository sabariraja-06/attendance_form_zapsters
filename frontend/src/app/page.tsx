"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // TODO: Implement Firebase Auth Login here
    // For demo/scaffolding purposes, we simulate login
    setTimeout(() => {
      setLoading(false);
      if (email === "admin@zapsters.com") {
        router.push("/admin/dashboard");
      } else if (email) {
        // Store mock user for development
        const mockUser = {
          uid: 'test-student-123',
          email: email,
          name: 'Test Student',
          domainId: 'web-dev',
          batchId: 'batch-a'
        };
        localStorage.setItem('zapsters_user', JSON.stringify(mockUser));
        router.push("/student/dashboard");
      } else {
        setError("Please enter a valid email.");
      }
    }, 1000);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--gray-50)" }}>
      <div className="card" style={{ width: "100%", maxWidth: "400px", padding: "2.5rem" }}>
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <h1 style={{ color: "var(--primary-red)", fontSize: "1.8rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Zapsters</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.9rem" }}>Attendance Management System</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {error && (
            <div style={{ padding: "0.75rem", background: "#FEF2F2", color: "#B91C1C", borderRadius: "var(--radius)", fontSize: "0.875rem", border: "1px solid #FECACA" }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "500", color: "var(--gray-700)" }}>Email Address</label>
            <input
              type="email"
              className="input"
              placeholder="name@zapsters.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "500", color: "var(--gray-700)" }}>Password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: "1rem", width: "100%" }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.875rem", color: "var(--gray-500)" }}>
          <p>Protected System for Zapsters Interns</p>
        </div>
      </div>
    </div>
  );
}
