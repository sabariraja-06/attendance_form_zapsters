"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Search, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import "../admin.css";

interface Tutor {
    id: string;
    name: string;
    email: string;
    domainId: string;
}

interface Domain {
    id: string;
    name: string;
}

export default function TutorsPage() {
    const [tutors, setTutors] = useState<Tutor[]>([]);
    const [domains, setDomains] = useState<Domain[]>([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [newTutor, setNewTutor] = useState({
        name: "",
        email: "",
        domainId: ""
    });

    // Load Domains
    useEffect(() => {
        const fetchDomains = async () => {
            try {
                const data: any = await api.domains.getAll();
                if (Array.isArray(data)) {
                    setDomains(data);
                    if (data.length > 0) setNewTutor(prev => ({ ...prev, domainId: data[0].id }));
                }
            } catch (err) { console.error("Failed to load domains", err); }
        };
        fetchDomains();
    }, []);

    // Load Tutors
    const loadTutors = async () => {
        setLoading(true);
        try {
            const data: any = await api.tutors.getAll();
            if (Array.isArray(data)) {
                setTutors(data);
            } else {
                setTutors([]);
            }
        } catch (err) {
            console.error("Failed to load tutors", err);
            setTutors([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTutors();
    }, []);


    const handleAddTutor = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newTutor.domainId) {
            alert("Please select a domain. If no domains exist, create one in the Domains tap.");
            return;
        }

        try {
            await api.tutors.create(newTutor);
            setIsAddModalOpen(false);
            setNewTutor({ name: "", email: "", domainId: domains[0]?.id || "" });
            loadTutors(); // Refresh list
            alert("Tutor added successfully!");
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Error adding tutor");
        }
    };

    const handleDeleteTutor = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete tutor "${name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await api.tutors.delete(id);
            loadTutors();
            alert("Tutor deleted successfully");
        } catch (error) {
            console.error(error);
            alert("Error deleting tutor");
        }
    };

    const filteredTutors = tutors.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Helper functions to get names from IDs
    const getDomainName = (domainId: string) => {
        const domain = domains.find(d => d.id === domainId);
        return domain ? domain.name : domainId;
    };

    return (
        <div className="dashboard-container">
            {/* Header Actions */}
            <div className="students-header">
                <div className="students-filters">
                    <div className="search-wrapper">
                        <Search size={18} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--gray-500)" }} />
                        <input
                            className="input"
                            style={{ paddingLeft: "2.5rem" }}
                            placeholder="Search tutors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={18} style={{ marginRight: "0.5rem" }} />
                    Add Tutor
                </button>
            </div>

            {/* Tutors Table */}
            <div className="card" style={{ padding: "0" }}>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Assigned Domain</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>Loading...</td></tr>
                            ) : filteredTutors.length === 0 ? (
                                <tr><td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>No tutors found.</td></tr>
                            ) : (
                                filteredTutors.map(tutor => (
                                    <tr key={tutor.id}>
                                        <td style={{ fontWeight: 500 }}>{tutor.name}</td>
                                        <td style={{ color: "var(--gray-500)" }}>{tutor.email}</td>
                                        <td><span className="badge" style={{ background: "#FEF2F2", color: "#DC2626" }}>{getDomainName(tutor.domainId)}</span></td>
                                        <td>
                                            <button
                                                onClick={() => handleDeleteTutor(tutor.id, tutor.name)}
                                                style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444" }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Tutor Modal */}
            {isAddModalOpen && (
                <div
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsAddModalOpen(false);
                    }}
                    style={{
                        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                        background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50
                    }}
                >
                    <div className="card" style={{ width: "450px", maxWidth: "90%" }}>
                        <h3 className="card-title">Add New Tutor</h3>
                        <p style={{ fontSize: "0.9rem", color: "gray", marginBottom: "1rem" }}>
                            Tutors will manage all batches within their assigned domain.
                        </p>
                        <form onSubmit={handleAddTutor} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label className="input-label">Full Name</label>
                                <input className="input" required value={newTutor.name} onChange={e => setNewTutor({ ...newTutor, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="input-label">Email (Gmail)</label>
                                <input className="input" type="email" required value={newTutor.email} onChange={e => setNewTutor({ ...newTutor, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="input-label">Assign Domain</label>
                                <select className="input" value={newTutor.domainId} onChange={e => setNewTutor({ ...newTutor, domainId: e.target.value })}>
                                    <option value="">Select Domain</option>
                                    {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>

                            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add Tutor</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
