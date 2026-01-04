"use client";

import { useState, useEffect } from "react";
import { Users, BookOpen, Layers, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { DashboardStats } from "@/types";
import "../admin.css";

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalDomains: 0,
        totalBatches: 0,
        totalStudents: 0,
        studentsBelow75: 0,
        averageAttendance: 0,
        lowAttendanceStudents: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                console.log("Fetching dashboard stats...");
                const data = await api.dashboard.getStats() as DashboardStats;
                console.log("Received dashboard stats:", data);

                // Ensure we merge with defaults to avoid undefined properties
                setStats(prevStats => ({
                    ...prevStats,
                    ...(data || {})
                }));
            } catch (err: any) {
                console.error("Failed to load dashboard stats", err);
                setError(err.message || "Failed to load dashboard stats");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statsDisplay = [
        { label: "Total Domains", value: loading ? "..." : (stats?.totalDomains ?? 0).toString(), icon: BookOpen, color: "text-blue-600" },
        { label: "Total Batches", value: loading ? "..." : (stats?.totalBatches ?? 0).toString(), icon: Layers, color: "text-purple-600" },
        { label: "Total Students", value: loading ? "..." : (stats?.totalStudents ?? 0).toString(), icon: Users, color: "text-green-600" },
        { label: "Students < 75%", value: loading ? "..." : (stats?.studentsBelow75 ?? 0).toString(), icon: AlertCircle, color: "text-red-600", highlight: true },
    ];

    return (
        <div className="dashboard-container">
            {/* Stats Grid */}
            <div className="stats-grid">
                {statsDisplay.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className={`stat-card ${stat.highlight ? 'highlight-red' : ''}`}>
                            <div className="stat-info">
                                <span className="stat-label">{stat.label}</span>
                                <span className="stat-value">{stat.value}</span>
                            </div>
                            <div className={`stat-icon-wrapper ${stat.highlight ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'}`}>
                                <Icon size={24} />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="dashboard-sections">
                {/* Recent Activity / Low Attendance List */}
                <div className="card full-width">
                    <h3 className="card-title">Attendance Alerts (Below 75%)</h3>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>Domain</th>
                                    <th>Batch</th>
                                    <th>Attendance %</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>Loading...</td></tr>
                                ) : stats.lowAttendanceStudents && stats.lowAttendanceStudents.length > 0 ? (
                                    stats.lowAttendanceStudents.map((student) => (
                                        <tr key={student.id}>
                                            <td>{student.name}</td>
                                            <td>{student.domainName}</td>
                                            <td>{student.batchName}</td>
                                            <td>
                                                <span className="badge badge-warning">
                                                    {student.attendancePercentage}%
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-red-600 font-bold">At Risk</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>No students below 75% attendance. Great job!</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

