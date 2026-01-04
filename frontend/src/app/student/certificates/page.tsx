"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Download, Award, AlertCircle, Printer } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import "../student.css";

export default function CertificatesPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        if (!authLoading) {
            if (!user) {
                router.push('/');
            } else {
                fetchStats(user.uid);
            }
        }
        return () => { mounted = false; };
    }, [user, authLoading, router]);

    const fetchStats = async (userId: string) => {
        try {
            // Add a timeout to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), 10000)
            );

            const statsPromise = api.attendance.getStats(userId);
            const data: any = await Promise.race([statsPromise, timeoutPromise]);

            setStats(data);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
            // Optional: Set mock data for testing if in dev mode
            // For now, just stop loading so user sees "No data" instead of spinner
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (authLoading || loading) {
        return <div className="p-8 text-center text-white">Loading certificate data...</div>;
    }

    if (!stats) return <div className="p-8 text-center text-white">No data available.</div>;

    return (
        <div className="student-content">
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .certificate-container, .certificate-container * {
                        visibility: visible;
                    }
                    .certificate-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        margin: 0;
                        padding: 0;
                        background: white;
                        color: black !important;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 9999;
                    }
                    .no-print {
                        display: none !important;
                    }
                    /* Ensure background graphics are printed */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            <div className="container no-print" style={{ maxWidth: "800px" }}>
                <div className="page-header">
                    <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Certificates</h1>
                    <p style={{ color: "var(--gray-400)" }}>View and download your completion certificates.</p>
                </div>

                {!stats.isEligible ? (
                    <div className="card" style={{ padding: "3rem", textAlign: "center", marginTop: "2rem" }}>
                        <div style={{ marginBottom: "2rem" }}>
                            <div style={{
                                width: "80px", height: "80px", background: "rgba(220, 38, 38, 0.1)",
                                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto"
                            }}>
                                <AlertCircle size={40} color="#DC2626" />
                            </div>
                        </div>

                        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem" }}>
                            Not Yet Eligible
                        </h2>

                        <p style={{ color: "var(--gray-400)", fontSize: "1.1rem", marginBottom: "2.5rem", lineHeight: "1.6" }}>
                            Your current attendance is <strong style={{ color: "white" }}>{stats.percentage}%</strong>.
                            <br />
                            You need a minimum of <strong style={{ color: "white" }}>{stats.minRequired}%</strong> to be eligible for the certificate.
                        </p>

                        <div style={{
                            background: "rgba(255,255,255,0.05)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border-color)",
                            display: "inline-block", textAlign: "left"
                        }}>
                            <h4 style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "0.5rem", color: "var(--primary-color)" }}>Eligibility Criteria</h4>
                            <ul style={{ listStyle: "disc", paddingLeft: "1.5rem", color: "var(--gray-400)", fontSize: "0.9rem" }}>
                                <li style={{ marginBottom: "0.5rem" }}>Minimum 75% Attendance Record</li>
                                <li style={{ marginBottom: "0.5rem" }}>Active participation in assigned batch</li>
                                <li>Completion of course duration</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="card" style={{ padding: "2rem", marginTop: "2rem" }}>
                        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                            <div style={{
                                width: "64px", height: "64px", background: "rgba(5, 150, 105, 0.1)",
                                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem"
                            }}>
                                <Award size={32} color="#059669" />
                            </div>
                            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Congratulations!</h2>
                            <p style={{ color: "var(--gray-400)", marginTop: "0.5rem" }}>
                                You have successfully completed the requirements. Here is your certificate.
                            </p>
                            <button
                                onClick={handlePrint}
                                className="btn btn-primary"
                                style={{ marginTop: "1.5rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                            >
                                <Printer size={18} />
                                Print / Save as PDF
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Hidden Certificate Container (Only visible in Print) - Or visible as preview */}
            {stats.isEligible && (
                <div className="certificate-wrapper" style={{ marginTop: "2rem", display: "flex", justifyContent: "center" }}>
                    <div className="certificate-container" style={{
                        width: "1123px", // A4 Landscape roughly at 96dpi (297mm)
                        height: "794px", // 210mm
                        padding: "40px",
                        background: "#fff",
                        color: "#000",
                        position: "relative",
                        fontFamily: "'Times New Roman', serif",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                        border: "1px solid #ddd",
                        transform: "scale(0.6)", // Scale down for preview
                        transformOrigin: "top center",
                        marginBottom: "-300px" // Compensate for scale
                    }}>
                        <div style={{
                            border: "10px solid #111",
                            height: "100%",
                            padding: "40px",
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center"
                        }}>
                            {/* Corner Decorations */}
                            <div style={{ position: 'absolute', top: 10, left: 10, borderTop: '4px solid #D4AF37', borderLeft: '4px solid #D4AF37', width: 40, height: 40 }}></div>
                            <div style={{ position: 'absolute', top: 10, right: 10, borderTop: '4px solid #D4AF37', borderRight: '4px solid #D4AF37', width: 40, height: 40 }}></div>
                            <div style={{ position: 'absolute', bottom: 10, left: 10, borderBottom: '4px solid #D4AF37', borderLeft: '4px solid #D4AF37', width: 40, height: 40 }}></div>
                            <div style={{ position: 'absolute', bottom: 10, right: 10, borderBottom: '4px solid #D4AF37', borderRight: '4px solid #D4AF37', width: 40, height: 40 }}></div>

                            {/* Header */}
                            <div style={{ marginTop: "2rem" }}>
                                <h1 style={{ fontSize: "56px", margin: "0", textTransform: "uppercase", letterSpacing: "4px", color: "#111" }}>
                                    Certificate
                                </h1>
                                <p style={{ fontSize: "24px", letterSpacing: "2px", textTransform: "uppercase", color: "#666", marginTop: "10px" }}>
                                    of Completion
                                </p>
                            </div>

                            <div style={{ marginTop: "3rem", width: "100%" }}>
                                <p style={{ fontSize: "18px", fontStyle: "italic", color: "#444" }}>This is to certify that</p>

                                <h2 style={{
                                    fontSize: "48px",
                                    margin: "20px 0",
                                    color: "#D4AF37",
                                    fontFamily: "'Pinyon Script', cursive, serif", // Fallback to serif
                                    borderBottom: "1px solid #ddd",
                                    display: "inline-block",
                                    paddingBottom: "10px",
                                    minWidth: "400px"
                                }}>
                                    {user?.name || "Student Name"}
                                </h2>

                                <p style={{ fontSize: "18px", marginTop: "20px", color: "#444", lineHeight: "1.6" }}>
                                    has successfully completed the Internship Program in
                                </p>

                                <h3 style={{ fontSize: "32px", margin: "10px 0", color: "#111" }}>
                                    {stats.domainName || "Web Development"}
                                </h3>

                                <p style={{ fontSize: "16px", marginTop: "30px", color: "#666", maxWidth: "600px", margin: "30px auto" }}>
                                    Demonstrating exceptional dedication, maintaining {stats.percentage}% attendance,
                                    and successfully meeting all the requirements of the program.
                                </p>
                            </div>

                            <div style={{
                                marginTop: "auto",
                                width: "100%",
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "0 60px 40px 60px"
                            }}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ borderBottom: "2px solid #333", width: "200px", marginBottom: "10px" }}></div>
                                    <p style={{ fontWeight: "bold" }}>Program Director</p>
                                    <p style={{ fontSize: "14px", color: "#666" }}>Zapsters Tech</p>
                                </div>

                                <div style={{ textAlign: "center" }}>
                                    <div style={{
                                        width: "120px",
                                        height: "120px",
                                        background: "url('/badge.png')", // Placeholder if no image
                                        backgroundSize: "contain",
                                        margin: "-40px auto 10px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#D4AF37",
                                        fontSize: "12px",
                                        border: "4px solid #D4AF37",
                                        borderRadius: "50%"
                                    }}>
                                        SEAL
                                    </div>
                                    <p style={{ fontSize: "14px", color: "#666" }}>{new Date().toLocaleDateString()}</p>
                                </div>

                                <div style={{ textAlign: "center" }}>
                                    <div style={{ borderBottom: "2px solid #333", width: "200px", marginBottom: "10px" }}></div>
                                    <p style={{ fontWeight: "bold" }}>Academic Head</p>
                                    <p style={{ fontSize: "14px", color: "#666" }}>Zapsters Tech</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
