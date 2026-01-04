"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import "../student.css";
import MagicBento from "@/components/MagicBento";
import ShinyText from "@/components/ShinyText"; // Fixed import path

import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { where } from "firebase/firestore";
import { Session, AttendanceRecord } from "@/types";

export default function StudentDashboard() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [attendanceCode, setAttendanceCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [mounted, setMounted] = useState(false);

    // 1. Direct Firestore Subscriptions (Hybrid Architecture)
    // We read 'sessions' and 'attendance' directly from Firebase to bypass backend cold-starts

    // Memoize query constraints
    const sessionConstraints = useMemo(() => {
        if (!user?.batchId) return [];
        return [
            where('batchId', '==', user.batchId)
            // We can't easily orderBy 'date' here if we don't have a composite index created yet.
            // So we'll sort in JS.
        ];
    }, [user?.batchId]);

    const attendanceConstraints = useMemo(() => {
        if (!user?.uid) return [];
        return [
            where('userId', '==', user.uid)
        ];
    }, [user?.uid]);

    // Use a flag to prevent query execution if user data isn't ready
    const shouldFetch = !!(user?.batchId && user?.uid);

    const { data: rawSessions, loading: sessionsLoading } = useFirestoreCollection<Session>(
        'sessions',
        sessionConstraints,
        shouldFetch
    );

    const { data: attendanceRecords, loading: attendanceLoading } = useFirestoreCollection<AttendanceRecord>(
        'attendance',
        attendanceConstraints,
        shouldFetch
    );

    useEffect(() => {
        setMounted(true);
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    // 2. Client-Side Data Processing (Merging Streams)
    const { processedSessions, stats } = useMemo(() => {
        if (!rawSessions || !attendanceRecords) return { processedSessions: [], stats: null };

        // Create Set of attended session IDs
        const attendedSet = new Set(attendanceRecords.map(a => a.sessionId));

        // Process Sessions
        // a. Mark attended/absent
        // b. Sort by Date/Time descending
        const sorted = [...rawSessions].sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time}`).getTime();
            const dateB = new Date(`${b.date} ${b.time}`).getTime();
            return dateB - dateA; // Descending (Newest first)
        }).map(session => ({
            ...session,
            attended: attendedSet.has(session.id)
        }));

        // Calculate Stats
        const total = rawSessions.length;
        // Count how many of the *assigned batch sessions* were attended
        // This handles cases where a student might have attendance for other sessions (rare) 
        // but primarily ensures we are comparing apples to apples.
        const validAttendedCount = sorted.filter(s => s.attended).length;

        const percentage = total === 0 ? 0 : Math.round((validAttendedCount / total) * 100);

        return {
            processedSessions: sorted.slice(0, 5), // Top 5
            allSessions: sorted, // For upcoming check
            stats: {
                percentage,
                isEligible: percentage >= 75,
                totalSessions: total,
                attendedSessions: validAttendedCount
            }
        };

    }, [rawSessions, attendanceRecords]);

    const handleMarkAttendance = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (!user) return;

        try {
            // Write operations still go through Backend for security!
            await api.attendance.mark({
                userId: user.uid,
                code: attendanceCode
            });

            setMessage({ type: 'success', text: 'Attendance marked successfully!' });
            setAttendanceCode("");
            // No need to manually refetch! The useFirestoreCollection hooks 
            // will automatically see the new document and update the UI instantly. 🪄

        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Something went wrong.' });
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || (!user && !mounted)) return <div className="p-8 text-center" style={{ color: '#fff' }}>Loading Dashboard...</div>;

    const isLoadingData = (sessionsLoading || attendanceLoading) && shouldFetch;

    return (
        <div>
            <div className="welcome-section">
                <h1 className="welcome-title">Welcome back, {user?.name || 'Student'}</h1>
                <p className="welcome-subtitle">Zapsters Attendance System</p>
            </div>

            <div style={{ padding: "0 1.5rem 1.5rem 1.5rem" }}>
                <MagicBento
                    enableStars={true}
                    enableSpotlight={true}
                    enableBorderGlow={true}
                    enableTilt={true}
                    glowColor="239, 68, 68" // Red color
                    textAutoHide={false}
                >
                    {/* Mark Attendance Card */}
                    <div className="card" style={{ gridColumn: "span 1" }}>
                        <h3 className="card-title">
                            <ShinyText text="Mark Attendance" color="#ffffff" shineColor="#ef4444" speed={4} />
                        </h3>
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
                    <div className="card" style={{ gridColumn: "span 1" }}>
                        <h3 className="card-title">
                            <ShinyText text="Recent Sessions" color="#ffffff" shineColor="#ef4444" speed={4} />
                        </h3>
                        <div className="session-list">
                            {isLoadingData ? (
                                <div style={{ textAlign: "center", padding: "1rem", color: "#666" }}>Loading sessions...</div>
                            ) : processedSessions.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "2rem", color: "var(--gray-500)" }}>No sessions yet</div>
                            ) : (
                                processedSessions.map((session, idx) => (
                                    <div key={idx} className="session-item">
                                        <div>
                                            <span className="session-date">{session.date || 'N/A'}</span>
                                            <span className="session-time">{session.time || 'N/A'}</span>
                                        </div>
                                        <span className={`session-status ${session.attended ? 'status-present' : 'status-absent'}`}>
                                            {session.attended ? 'Present' : 'Absent'}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Attendance Overview */}
                    <div className="card" style={{ gridColumn: "span 1" }}>
                        <h3 className="card-title">
                            <ShinyText text="Attendance Overview" color="#ffffff" shineColor="#ef4444" speed={4} />
                        </h3>
                        <div className="attendance-circle-wrapper">
                            <div style={{ textAlign: "center" }}>
                                <div className="attendance-percentage">
                                    {stats ? `${stats.percentage}%` : "--%"}
                                </div>
                                <div className={`attendance-status ${stats && stats.percentage >= 75 ? 'status-good' : 'status-bad'}`}>
                                    {stats ? (stats.percentage >= 75 ? 'Good Standing' : 'At Risk') : 'Calculating...'}
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

                    {/* Upcoming Session */}
                    <div className="card" style={{ gridColumn: "span 1" }}>
                        <h3 className="card-title">
                            <ShinyText text="Upcoming Session" color="#ffffff" shineColor="#ef4444" speed={4} />
                        </h3>
                        {(() => {
                            // Find next session in future from processed list (which includes all, sorted desc)
                            // We need ascending for "next", or just find the last one that is > now

                            // Re-filter rawSessions if available, or just use the memoized 'allSessions' if we exposed it
                            // For simplicity, let's look at rawSessions again
                            if (!rawSessions || rawSessions.length === 0) {
                                return (
                                    <div style={{ padding: "1rem", color: "var(--gray-500)", fontSize: "0.9rem", textAlign: "center" }}>
                                        {isLoadingData ? 'Checking schedule...' : 'No upcoming sessions scheduled.'}
                                    </div>
                                );
                            }

                            const now = new Date();
                            const upcoming = rawSessions
                                .filter(s => new Date(`${s.date} ${s.time}`) > now)
                                .sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime())[0];

                            if (upcoming) {
                                return (
                                    <div className="upcoming-session-card">
                                        <div className="upcoming-label">Based on Batch Schedule</div>
                                        <div className="upcoming-details">
                                            {upcoming.date} • {upcoming.time}
                                        </div>
                                        {upcoming.meetLink && (
                                            <a href={upcoming.meetLink} target="_blank" rel="noopener noreferrer" className="upcoming-link">
                                                Join Meeting
                                            </a>
                                        )}
                                    </div>
                                );
                            } else {
                                return (
                                    <div style={{ padding: "1rem", color: "var(--gray-500)", fontSize: "0.9rem", textAlign: "center" }}>
                                        No upcoming sessions scheduled.
                                    </div>
                                );
                            }
                        })()}
                    </div>
                </MagicBento>
            </div>
        </div >
    );
}
