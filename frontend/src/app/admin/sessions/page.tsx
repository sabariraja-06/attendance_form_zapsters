"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Link as LinkIcon, Copy, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import "../admin.css";

import { useAuth } from "@/contexts/AuthContext";

export default function SessionsPage() {
    const { user, loading: authLoading } = useAuth();
    const [domains, setDomains] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [domainId, setDomainId] = useState("");
    const [batchId, setBatchId] = useState("");

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState("10:00");
    const [duration, setDuration] = useState(60);
    const [meetLink, setMeetLink] = useState("");

    const [loading, setLoading] = useState(false);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [sessionDetails, setSessionDetails] = useState<any>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (authLoading || !user) return;

        const fetchDomains = async () => {
            try {
                const data: any = await api.domains.getAll();
                if (Array.isArray(data)) {
                    setDomains(data);
                    if (data.length > 0) setDomainId(data[0].id);
                }
            } catch (err) { console.error(err); }
        };
        fetchDomains();
    }, [authLoading, user]);

    // Load batches when domain changes
    useEffect(() => {
        if (!domainId || authLoading || !user) return;
        const fetchBatches = async () => {
            try {
                const data: any = await api.batches.getAll(domainId);
                if (Array.isArray(data)) {
                    setBatches(data);
                    if (data.length > 0) setBatchId(data[0].id);
                }
            } catch (err) { console.error(err); }
        };
        fetchBatches();
    }, [domainId, authLoading, user]);

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setGeneratedCode(null);

        try {
            const data: any = await api.sessions.create({
                domainId,
                batchId,
                date,
                time,
                durationMinutes: Number(duration),
                meetLink
            });

            setGeneratedCode(data.attendanceCode);
            setSessionDetails(data);
            fetchSessions(); // Refresh sessions list
        } catch (err: any) {
            setError(err.message || "Failed to create session");
        } finally {
            setLoading(false);
        }
    };

    const copyCode = () => {
        if (generatedCode) {
            navigator.clipboard.writeText(generatedCode);
            alert("Code copied to clipboard!");
        }
    };

    const fetchSessions = async () => {
        if (authLoading || !user) return;
        try {
            const data: any = await api.sessions.getAll();
            if (Array.isArray(data)) {
                setSessions(data);
            } else {
                setSessions([]);
            }
        } catch (err) {
            console.error("Failed to load sessions", err);
            setSessions([]);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, [authLoading, user]);

    return (
        <div className="dashboard-container">
            <div className="sessions-layout">

                {/* Create Session Form */}
                <div className="card">
                    <h3 className="card-title">Create New Session</h3>
                    <form onSubmit={handleCreateSession} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                        <div className="form-grid">
                            <div>
                                <label className="input-label">Domain</label>
                                <select className="input" value={domainId} onChange={(e) => setDomainId(e.target.value)}>
                                    {domains.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="input-label">Batch</label>
                                <select className="input" value={batchId} onChange={(e) => setBatchId(e.target.value)}>
                                    {batches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-grid">
                            <div>
                                <label className="input-label">Date</label>
                                <div className="input-with-icon">
                                    <Calendar size={18} className="text-gray-400" />
                                    <input type="date" className="input-no-border" value={date} onChange={(e) => setDate(e.target.value)} required />
                                </div>
                            </div>
                            <div>
                                <label className="input-label">Time</label>
                                <div className="input-with-icon">
                                    <Clock size={18} className="text-gray-400" />
                                    <input type="time" className="input-no-border" value={time} onChange={(e) => setTime(e.target.value)} required />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="input-label">Duration (Minutes)</label>
                            <input type="number" className="input" value={duration} onChange={(e) => setDuration(Number(e.target.value))} min="5" max="180" />
                        </div>

                        <div>
                            <label className="input-label">Google Meet Link</label>
                            <div className="input-with-icon">
                                <LinkIcon size={18} className="text-gray-400" />
                                <input
                                    type="url"
                                    className="input-no-border"
                                    placeholder="https://meet.google.com/..."
                                    value={meetLink}
                                    onChange={(e) => setMeetLink(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Generating..." : "Create Session & Generate Code"}
                        </button>
                    </form>
                </div>

                {/* Generated Code Display */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    {generatedCode ? (
                        <div className="card" style={{ background: "#FEF2F2", border: "1px solid #FECACA", textAlign: "center", padding: "3rem 2rem" }}>
                            <div style={{ marginBottom: "1rem", color: "#DC2626", fontWeight: "600" }}>ATTENDANCE CODE</div>
                            <div style={{ fontSize: "4rem", fontWeight: "800", color: "#111", letterSpacing: "0.2rem", fontFamily: "monospace" }}>
                                {generatedCode}
                            </div>
                            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }}>
                                <button className="btn btn-secondary" onClick={copyCode} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <Copy size={16} /> Copy Code
                                </button>
                            </div>
                            <div style={{ marginTop: "2rem", fontSize: "0.9rem", color: "#666" }}>
                                Valid for {sessionDetails?.duration || duration} minutes.<br />
                                Share this with your students immediately.
                            </div>
                        </div>
                    ) : (
                        <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "300px", color: "var(--gray-500)", textAlign: "center" }}>
                            <div>
                                <div style={{ background: "var(--gray-100)", width: "64px", height: "64px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto" }}>
                                    <LinkIcon size={32} className="text-gray-400" />
                                </div>
                                <p>Fill the form to generate<br />a secure attendance code.</p>
                            </div>
                        </div>
                    )}

                    {/* Quick Stats or Tips */}
                    <div className="card">
                        <h4 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.5rem" }}>Safe Session Tips</h4>
                        <ul style={{ paddingLeft: "1.2rem", fontSize: "0.9rem", color: "var(--gray-600)", lineHeight: "1.6" }}>
                            <li>Code expires automatically after the set duration.</li>
                            <li>Students can only mark attendance once per session.</li>
                            <li>Ensure students are in the correct batch before sharing.</li>
                        </ul>
                    </div>

                </div>

            </div>

            {/* Sessions List */}
            <div className="card full-width" style={{ marginTop: "2rem" }}>
                <h3 className="card-title">All Sessions</h3>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Domain</th>
                                <th>Batch</th>
                                <th>Code</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>No sessions created yet.</td></tr>
                            ) : (
                                sessions.map((session) => {
                                    const now = new Date();
                                    const expiresAt = session.codeExpiresAt?.toDate ? session.codeExpiresAt.toDate() : new Date(session.codeExpiresAt);
                                    const isExpired = now > expiresAt;

                                    return (
                                        <tr key={session.id}>
                                            <td>{session.date || 'N/A'}</td>
                                            <td>{session.time || 'N/A'}</td>
                                            <td>{session.domainId}</td>
                                            <td>{session.batchId}</td>
                                            <td style={{ fontFamily: "monospace", fontWeight: "600" }}>{session.attendanceCode}</td>
                                            <td>
                                                <span className={`badge ${isExpired ? 'badge-secondary' : 'badge-success'}`}>
                                                    {isExpired ? 'Expired' : 'Active'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
