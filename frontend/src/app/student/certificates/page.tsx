"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Download, Award, AlertCircle } from "lucide-react";
import "../student.css";

export default function CertificatesPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        // Placeholder for PDF generation/download
        alert("Downloading Certificate...");
    };

    if (loading) {
        return <div className="student-layout" style={{ display: "flex", justifyContent: "center", paddingTop: "4rem" }}>Loading...</div>;
    }

    return (
        <div className="student-content">
            <div className="container" style={{ maxWidth: "800px" }}>
                <div className="card" style={{ padding: "3rem", textAlign: "center" }}>

                    <div style={{ marginBottom: "2rem" }}>
                        <div style={{
                            width: "80px", height: "80px", background: stats?.isEligible ? "#E6FFFA" : "#FFF5F5",
                            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto"
                        }}>
                            {stats?.isEligible ? (
                                <Award size={40} color="#059669" />
                            ) : (
                                <AlertCircle size={40} color="#DC2626" />
                            )}
                        </div>
                    </div>

                    <h2 style={{ fontSize: "1.75rem", fontWeight: "700", marginBottom: "1rem" }}>
                        {stats?.isEligible ? "Congratulations!" : "Not Yet Eligible"}
                    </h2>

                    <p style={{ color: "var(--gray-500)", fontSize: "1.1rem", marginBottom: "2.5rem", lineHeight: "1.6" }}>
                        {stats?.isEligible ? (
                            <span>
                                You have successfully maintained an attendance of <strong>{stats.percentage}%</strong>.
                                You can now download your internship completion certificate.
                            </span>
                        ) : (
                            <span>
                                Your current attendance is <strong>{stats?.percentage}%</strong>.
                                You need a minimum of <strong>{stats?.minRequired}%</strong> to be eligible for the certificate.
                                Keep attending sessions!
                            </span>
                        )}
                    </p>

                    {stats?.isEligible ? (
                        <button className="btn btn-primary" onClick={handleDownload} style={{ fontSize: "1.1rem", padding: "1rem 2rem" }}>
                            <Download size={20} style={{ marginRight: "0.5rem" }} />
                            Download Certificate
                        </button>
                    ) : (
                        <div style={{
                            background: "var(--gray-50)", padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--gray-200)",
                            display: "inline-block", textAlign: "left"
                        }}>
                            <h4 style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "0.5rem" }}>Eligibility Criteria</h4>
                            <ul style={{ listStyle: "disc", paddingLeft: "1.5rem", color: "var(--gray-600)", fontSize: "0.9rem" }}>
                                <li>Minimum 75% Attendance</li>
                                <li>Complete all assigned projects</li>
                                <li>Supervisor approval</li>
                            </ul>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
