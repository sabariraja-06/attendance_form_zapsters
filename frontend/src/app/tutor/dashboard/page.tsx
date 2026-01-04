"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Users, Calendar, CheckCircle, Clock } from "lucide-react";

export default function TutorDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalSessions: 0,
        activeBatches: 0,
        totalStudents: 0,
        nextSession: null as any
    });
    const [domainName, setDomainName] = useState(user?.domainId || "Your Domain");

    useEffect(() => {
        const loadData = async () => {
            // Fetch domain name if we have an ID
            if (user?.domainId) {
                try {
                    const domains: any = await api.domains.getAll();
                    const myDomain = domains.find((d: any) => d.id === user.domainId);
                    if (myDomain) setDomainName(myDomain.name);
                } catch (e) {
                    console.error(e);
                }
            }

            // In a real app, we'd fetch specific stats for this tutor/domain
            // For now we'll mock or just show welcome message if API doesn't support tutor-stats yet
        };
        loadData();
    }, [user]);

    return (
        <div className="dashboard-container">
            <div className="welcome-section" style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#111" }}>
                    Welcome back, {user?.name?.split(' ')[0] || "Tutor"}!
                </h2>
                <p style={{ color: "var(--gray-500)", marginTop: "0.5rem" }}>
                    Managing <span style={{ color: "var(--primary-red)", fontWeight: "600" }}>{domainName}</span>
                </p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-info">
                        <span className="stat-label">Upcoming Sessions</span>
                        <span className="stat-value">{stats.totalSessions || 0}</span>
                    </div>
                    <div className="stat-icon-wrapper" style={{ background: "#EEF2FF", color: "#4F46E5" }}>
                        <Calendar size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <span className="stat-label">Active Students</span>
                        <span className="stat-value">{stats.totalStudents || 0}</span>
                    </div>
                    <div className="stat-icon-wrapper" style={{ background: "#F0FDF4", color: "#16A34A" }}>
                        <Users size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <span className="stat-label">Next Class</span>
                        <span className="stat-value" style={{ fontSize: "1.2rem" }}>
                            {stats.nextSession ? stats.nextSession : "No upcoming info"}
                        </span>
                    </div>
                    <div className="stat-icon-wrapper" style={{ background: "#FFF7ED", color: "#EA580C" }}>
                        <Clock size={24} />
                    </div>
                </div>
            </div>

            <div className="card full-width" style={{ marginTop: "2rem", textAlign: "center", padding: "3rem" }}>
                <div style={{ marginBottom: "1rem" }}>
                    <CheckCircle size={48} color="var(--gray-300)" />
                </div>
                <h3>Ready to start a class?</h3>
                <p style={{ color: "var(--gray-500)", margin: "1rem 0" }}>
                    Create a new session code for your {domainName} students now.
                </p>
                <a href="/tutor/sessions" className="btn btn-primary">
                    Go to Sessions
                </a>
            </div>
        </div>
    );
}
