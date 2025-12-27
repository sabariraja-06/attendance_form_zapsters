"use client";

import { Users, BookOpen, Layers, AlertCircle } from "lucide-react";
import "../admin.css";

// Mock Data for Dashboard
const stats = [
    { label: "Total Domains", value: "6", icon: BookOpen, color: "text-blue-600" },
    { label: "Total Batches", value: "12", icon: Layers, color: "text-purple-600" },
    { label: "Total Students", value: "1,240", icon: Users, color: "text-green-600" },
    { label: "Students < 75%", value: "42", icon: AlertCircle, color: "text-red-600", highlight: true },
];

export default function AdminDashboard() {
    return (
        <div className="dashboard-container">
            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => {
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
                                {/* Mock Row 1 */}
                                <tr>
                                    <td>John Doe</td>
                                    <td>Web Development</td>
                                    <td>Batch A</td>
                                    <td className="text-red-600 font-bold">65%</td>
                                    <td><span className="badge badge-warning">At Risk</span></td>
                                </tr>
                                {/* Mock Row 2 */}
                                <tr>
                                    <td>Jane Smith</td>
                                    <td>UI/UX Design</td>
                                    <td>Batch B</td>
                                    <td className="text-red-600 font-bold">72%</td>
                                    <td><span className="badge badge-warning">At Risk</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
