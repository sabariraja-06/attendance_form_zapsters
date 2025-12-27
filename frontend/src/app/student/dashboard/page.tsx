"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../student.css";

export default function StudentDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [attendanceCode, setAttendanceCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('zapsters_user');
        if (!storedUser) {
            router.push('/');
        } else {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchStats(parsedUser.uid);
        }
    }, [router]);

    const fetchStats = async (userId: string) => {
        try {
            const res = await fetch(`http://localhost:5001/api/attendance/stats/${userId}`);
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkAttendance = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (!user) return;

        try {
            const response = await fetch('http://localhost:5001/api/attendance/mark', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.uid,
                    code: attendanceCode
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to mark attendance');
            }

            setMessage({ type: 'success', text: 'Attendance marked successfully!' });
            setAttendanceCode(""); // Clear code on success
            if (user) fetchStats(user.uid); // Refresh stats
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Something went wrong.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="welcome-section">
                <h1 className="welcome-title">Welcome back, Student</h1>
                <p className="welcome-subtitle">Web Development • Batch A</p>
            </div>

            <div className="attendance-grid">
                {/* Left Column: Mark Attendance & Recent Sessions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    {/* Mark Attendance Card */}
                    <div className="card">
                        <h3 className="card-title">Mark Attendance</h3>
                        <p style={{ marginBottom: "1rem", color: "var(--gray-500)", fontSize: "0.9rem" }}>
                            Enter the 6-digit code provided by your trainer.
                        </p>

                        <form onSubmit={handleMarkAttendance}>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Enter Code (e.g., 123456)"
                                    maxLength={6}
                                    value={attendanceCode}
                                    onChange={(e) => setAttendanceCode(e.target.value)}
                                    required
                                />
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? "Verifying..." : "Submit"}
                                </button>
                            </div>
                            {message && (
                                <div style={{
                                    color: message.type === 'success' ? '#16A34A' : '#DC2626',
                                    fontSize: '0.9rem',
                                    marginTop: '0.5rem',
                                    fontWeight: 500
                                }}>
                                    {message.text}
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Recent Sessions */}
                    <div className="card">
                        <h3 className="card-title">Recent Sessions</h3>
                        <div className="session-list">
                            <div className="session-item">
                                <div>
                                    <span className="session-date">Dec 26, 2024</span>
                                    <span className="session-time">10:00 AM - 12:00 PM</span>
                                </div>
                                <span className="session-status status-present">Present</span>
                            </div>
                            <div className="session-item">
                                <div>
                                    <span className="session-date">Dec 24, 2024</span>
                                    <span className="session-time">10:00 AM - 12:00 PM</span>
                                </div>
                                <span className="session-status status-present">Present</span>
                            </div>
                            <div className="session-item">
                                <div>
                                    <span className="session-date">Dec 22, 2024</span>
                                    <span className="session-time">10:00 AM - 12:00 PM</span>
                                </div>
                                <span className="session-status status-absent">Absent</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Stats */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div className="card">
                        <h3 className="card-title">Attendance Overview</h3>
                        <div className="attendance-circle-wrapper">
                            {/* Simple CSS text representation for now, could use a chart lib if needed */}
                            <div style={{ textAlign: "center" }}>
                                <div className="attendance-percentage">
                                    {stats ? `${stats.percentage}%` : "--%"}
                                </div>
                                <div className={`attendance-status ${stats && stats.percentage >= 75 ? 'status-good' : 'status-bad'}`}>
                                    {stats ? (stats.percentage >= 75 ? 'Good Standing' : 'At Risk') : 'Loading...'}
                                </div>
                            </div>
                        </div>
                        <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--gray-500)" }}>
                            {stats && stats.isEligible ? (
                                <span style={{ color: "green" }}>You are eligible for the certificate!</span>
                            ) : (
                                <span>Minimum 75% required for certificate.</span>
                            )}
                        </p>
                    </div>


                    <div className="card">
                        <h3 className="card-title">Upcoming Session</h3>
                        <div style={{ padding: "1rem", background: "#EFF6FF", borderRadius: "8px", border: "1px solid #DBEAFE" }}>
                            <div style={{ fontWeight: "600", color: "#1E40AF", marginBottom: "0.25rem" }}>React Hooks Deep Dive</div>
                            <div style={{ fontSize: "0.9rem", color: "#3B82F6", marginBottom: "0.5rem" }}>Dec 28, 2024 • 10:00 AM</div>
                            <a href="#" style={{ fontSize: "0.85rem", color: "#2563EB", textDecoration: "underline" }}>Join Google Meet</a>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
}
