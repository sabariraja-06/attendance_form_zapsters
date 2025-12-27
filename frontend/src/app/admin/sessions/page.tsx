"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Link as LinkIcon, Copy, CheckCircle } from "lucide-react";
import "../admin.css";

export default function SessionsPage() {
    const [domains, setDomains] = useState<any[]>([]);
    const [domainId, setDomainId] = useState("");
    const [batchId, setBatchId] = useState("batch-a");

    useEffect(() => {
        fetch('http://localhost:5001/api/admin/domains')
            .then(res => res.json())
            .then(data => {
                setDomains(data);
                if (data.length > 0) setDomainId(data[0].id);
            })
            .catch(err => console.error(err));
    }, []);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState("10:00");
    const [duration, setDuration] = useState(60);
    const [meetLink, setMeetLink] = useState("");

    const [loading, setLoading] = useState(false);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [sessionDetails, setSessionDetails] = useState<any>(null);
    const [error, setError] = useState("");

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setGeneratedCode(null);

        try {
            const response = await fetch('http://localhost:5001/api/attendance/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domainId,
                    batchId,
                    date,
                    time,
                    durationMinutes: Number(duration),
                    meetLink
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create session");
            }

            setGeneratedCode(data.attendanceCode);
            setSessionDetails(data);
        } catch (err: any) {
            setError(err.message);
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

    return (
        <div className="dashboard-container">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>

                {/* Create Session Form */}
                <div className="card">
                    <h3 className="card-title">Create New Session</h3>
                    <form onSubmit={handleCreateSession} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
                                    <option value="batch-a">Batch A</option>
                                    <option value="batch-b">Batch B</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
        </div>
    );
}
