"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Download, Award, AlertCircle, Printer, CheckCircle } from "lucide-react";
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
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), 10000)
            );
            const statsPromise = api.attendance.getStats(userId);
            const data: any = await Promise.race([statsPromise, timeoutPromise]);
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (authLoading || loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", color: "#666" }}>
                <div className="spinner"></div>
                <span style={{ marginLeft: "10px" }}>Checking eligibility...</span>
            </div>
        );
    }

    if (!stats) return <div className="p-4 text-center text-gray-500">No data available.</div>;

    const progressPercentage = Math.min(100, Math.max(0, stats.percentage));
    const isEligible = stats.isEligible;

    return (
        <div className="student-content">
            <style jsx global>{`
                @media print {
                    body * { visibility: hidden; }
                    .certificate-container, .certificate-container * { visibility: visible; }
                    .certificate-container {
                        position: absolute; left: 0; top: 0; width: 100%; height: 100%;
                        margin: 0; padding: 0; background: white; color: black !important;
                        display: flex; align-items: center; justifyContent: center; z-index: 9999;
                    }
                    .no-print { display: none !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                .mobile-card {
                    background: white;
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    margin-bottom: 1.5rem;
                    border: 1px solid #f3f4f6;
                }
                @media (max-width: 640px) {
                    .mobile-card { padding: 1.25rem; }
                    .stat-value { font-size: 2rem !important; }
                }
            `}</style>

            <div className="container no-print" style={{ maxWidth: "600px", margin: "0 auto", padding: "0 1rem" }}>

                {/* Header */}
                <div style={{ marginBottom: "2rem", textAlign: "center" }}>
                    <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#111", marginBottom: "0.5rem" }}>
                        Course Certificate
                    </h1>
                    <p style={{ color: "#666", fontSize: "0.95rem" }}>
                        Track your progress and claim your reward.
                    </p>
                </div>

                {/* Status Card */}
                <div className="mobile-card">
                    {!isEligible ? (
                        <div style={{ textAlign: "center" }}>
                            <div style={{
                                width: "64px", height: "64px", background: "#FEF2F2",
                                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem"
                            }}>
                                <AlertCircle size={32} color="#DC2626" />
                            </div>

                            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#1F2937", marginBottom: "0.5rem" }}>
                                Keep Going!
                            </h2>
                            <p style={{ color: "#4B5563", fontSize: "0.95rem", marginBottom: "2rem" }}>
                                You are almost there. Improve your attendance to unlock your certificate.
                            </p>

                            {/* Progress Section */}
                            <div style={{ background: "#F9FAFB", padding: "1.5rem", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem", color: "#4B5563" }}>
                                    <span>Current Attendance</span>
                                    <span style={{ fontWeight: "600" }}>{stats.percentage}%</span>
                                </div>

                                {/* Progress Bar */}
                                <div style={{ height: "10px", width: "100%", background: "#E5E7EB", borderRadius: "99px", overflow: "hidden", marginBottom: "1.5rem" }}>
                                    <div style={{
                                        height: "100%",
                                        width: `${progressPercentage}%`,
                                        background: progressPercentage >= 75 ? "#16A34A" : "#DC2626",
                                        borderRadius: "99px",
                                        transition: "width 0.5s ease"
                                    }} />
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "1rem", justifyContent: "space-between" }}>
                                    <div style={{ textAlign: "left" }}>
                                        <div style={{ fontSize: "0.8rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Required</div>
                                        <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#DC2626" }}>75%</div>
                                    </div>
                                    <div style={{ height: "40px", width: "1px", background: "#E5E7EB" }}></div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: "0.8rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Current</div>
                                        <div style={{ fontSize: "1.5rem", fontWeight: "800", color: progressPercentage >= 75 ? "#16A34A" : "#DC2626" }}>
                                            {stats.percentage}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: "center" }}>
                            <div style={{
                                width: "64px", height: "64px", background: "#ECFDF5",
                                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem"
                            }}>
                                <Award size={32} color="#059669" />
                            </div>

                            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#1F2937", marginBottom: "0.5rem" }}>
                                Certified!
                            </h2>
                            <p style={{ color: "#4B5563", fontSize: "0.95rem", marginBottom: "2rem" }}>
                                Congratulations! You have met all requirements.
                            </p>

                            <button
                                onClick={handlePrint}
                                className="btn"
                                style={{
                                    width: "100%",
                                    background: "#1F2937",
                                    color: "white",
                                    padding: "1rem",
                                    borderRadius: "10px",
                                    fontWeight: "600",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0.75rem",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                }}
                            >
                                <Download size={20} />
                                Download Certificate
                            </button>
                        </div>
                    )}
                </div>

                {/* Criteria List (Only show if not eligible to keep it clean) */}
                {!isEligible && (
                    <div style={{ padding: "0 1rem" }}>
                        <h3 style={{ fontSize: "0.95rem", fontWeight: "600", color: "#374151", marginBottom: "1rem" }}>
                            Requirements Checklist
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9rem", color: "#4B5563" }}>
                                <div style={{
                                    minWidth: "20px", height: "20px", borderRadius: "50%",
                                    background: stats.percentage >= 75 ? "#D1FAE5" : "#FEE2E2",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    {stats.percentage >= 75 ? <CheckCircle size={12} color="#059669" /> : <div style={{ width: "6px", height: "6px", background: "#DC2626", borderRadius: "50%" }} />}
                                </div>
                                <span>Maintain minimum <strong>75% attendance</strong></span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9rem", color: "#4B5563" }}>
                                <div style={{ minWidth: "20px", height: "20px", borderRadius: "50%", background: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <CheckCircle size={12} color="#059669" />
                                </div>
                                <span>Complete course duration</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Certificate Template (For Print Only) */}
            {isEligible && (
                <div className="certificate-wrapper" style={{ display: "none" }}> {/* Hidden except for print media query */}
                    <div className="certificate-container" style={{
                        width: "1123px", height: "794px", padding: "40px", background: "#fff",
                        color: "#000", position: "relative", fontFamily: "'Times New Roman', serif",
                        border: "1px solid #ddd"
                    }}>
                        <div style={{
                            border: "10px solid #111", height: "100%", padding: "40px",
                            position: "relative", display: "flex", flexDirection: "column",
                            alignItems: "center", textAlign: "center"
                        }}>
                            {/* Corner Decorations */}
                            <div style={{ position: 'absolute', top: 10, left: 10, borderTop: '4px solid #D4AF37', borderLeft: '4px solid #D4AF37', width: 40, height: 40 }}></div>
                            <div style={{ position: 'absolute', top: 10, right: 10, borderTop: '4px solid #D4AF37', borderRight: '4px solid #D4AF37', width: 40, height: 40 }}></div>
                            <div style={{ position: 'absolute', bottom: 10, left: 10, borderBottom: '4px solid #D4AF37', borderLeft: '4px solid #D4AF37', width: 40, height: 40 }}></div>
                            <div style={{ position: 'absolute', bottom: 10, right: 10, borderBottom: '4px solid #D4AF37', borderRight: '4px solid #D4AF37', width: 40, height: 40 }}></div>

                            <div style={{ marginTop: "2rem" }}>
                                <h1 style={{ fontSize: "56px", margin: "0", textTransform: "uppercase", letterSpacing: "4px", color: "#111" }}>Certificate</h1>
                                <p style={{ fontSize: "24px", letterSpacing: "2px", textTransform: "uppercase", color: "#666", marginTop: "10px" }}>of Completion</p>
                            </div>
                            <div style={{ marginTop: "3rem", width: "100%" }}>
                                <p style={{ fontSize: "18px", fontStyle: "italic", color: "#444" }}>This is to certify that</p>
                                <h2 style={{ fontSize: "48px", margin: "20px 0", color: "#D4AF37", fontFamily: "'Pinyon Script', cursive, serif", borderBottom: "1px solid #ddd", display: "inline-block", paddingBottom: "10px", minWidth: "400px" }}>
                                    {user?.name || "Student Name"}
                                </h2>
                                <p style={{ fontSize: "18px", marginTop: "20px", color: "#444", lineHeight: "1.6" }}>has successfully completed the Internship Program in</p>
                                <h3 style={{ fontSize: "32px", margin: "10px 0", color: "#111" }}>{stats.domainName || "Web Development"}</h3>
                                <p style={{ fontSize: "16px", marginTop: "30px", color: "#666", maxWidth: "600px", margin: "30px auto" }}>
                                    Demonstrating exceptional dedication, maintaining {stats.percentage}% attendance, and successfully meeting all the requirements of the program.
                                </p>
                            </div>
                            <div style={{ marginTop: "auto", width: "100%", display: "flex", justifyContent: "space-between", padding: "0 60px 40px 60px" }}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ borderBottom: "2px solid #333", width: "200px", marginBottom: "10px" }}></div>
                                    <p style={{ fontWeight: "bold" }}>Program Director</p>
                                    <p style={{ fontSize: "14px", color: "#666" }}>Zapsters Tech</p>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ width: "120px", height: "120px", margin: "-40px auto 10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#D4AF37", fontSize: "12px", border: "4px solid #D4AF37", borderRadius: "50%" }}>SEAL</div>
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
