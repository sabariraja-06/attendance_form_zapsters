"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import "../admin.css";

interface Batch {
    id: string;
    name: string;
    domainId: string;
    startDate: string;
    endDate: string;
}

interface Domain {
    id: string;
    name: string;
}

export default function BatchesPage() {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [domains, setDomains] = useState<Domain[]>([]);
    const [selectedDomain, setSelectedDomain] = useState("web-dev");
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [newBatch, setNewBatch] = useState({
        name: "",
        domainId: "web-dev",
        startDate: "",
        endDate: ""
    });

    useEffect(() => {
        // Fetch Domains first
        const fetchDomains = async () => {
            try {
                const data: any = await api.domains.getAll();
                if (Array.isArray(data)) {
                    setDomains(data);
                    if (data.length > 0 && !selectedDomain) setSelectedDomain(data[0].id);
                } else {
                    console.error("Expected array for domains but got:", data);
                    setDomains([]);
                }
            } catch (err) {
                console.error("Failed to load domains", err);
                setDomains([]);
            }
        };
        fetchDomains();
    }, []);

    const fetchBatches = async () => {
        if (!selectedDomain) return;
        try {
            const data: any = await api.batches.getAll(selectedDomain);
            if (Array.isArray(data)) {
                setBatches(data);
            } else {
                console.error("Expected array for batches but got:", data);
                setBatches([]);
            }
        } catch (err) {
            console.error("Failed to load batches", err);
            setBatches([]);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, [selectedDomain]);

    const handleAddBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.batches.create(newBatch);
            setShowModal(false);
            fetchBatches(); // Refresh
            setNewBatch({ name: "", domainId: selectedDomain, startDate: "", endDate: "" });
        } catch (error) {
            console.error(error);
            alert("Failed to add batch");
        }
    };

    const handleDeleteBatch = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await api.batches.delete(id);
            fetchBatches();
            alert("Batch deleted successfully");
        } catch (error) {
            console.error(error);
            alert("Error deleting batch");
        }
    };

    return (
        <div className="dashboard-container">
            <div className="batches-header">
                <div className="batches-title-filter">
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "700" }}>Batches</h2>
                    <select
                        className="input"
                        value={selectedDomain}
                        onChange={(e) => {
                            setSelectedDomain(e.target.value);
                            setNewBatch({ ...newBatch, domainId: e.target.value });
                        }}
                    >
                        {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} style={{ marginRight: "0.5rem" }} />
                    Add Batch
                </button>
            </div>

            <div className="card full-width">
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Batch Name</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {batches.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>No batches found for this domain.</td></tr>
                            ) : (
                                batches.map((batch) => (
                                    <tr key={batch.id}>
                                        <td style={{ fontWeight: 500 }}>{batch.name}</td>
                                        <td>{batch.startDate || "N/A"}</td>
                                        <td>{batch.endDate || "N/A"}</td>
                                        <td><span className="badge" style={{ background: "#DCFCE7", color: "#166534" }}>Active</span></td>
                                        <td>
                                            <button
                                                onClick={() => handleDeleteBatch(batch.id, batch.name)}
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

            {/* Add Batch Modal */}
            {showModal && (
                <div
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowModal(false);
                    }}
                    style={{
                        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                        background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
                    }}
                >
                    <div className="card" style={{ width: "450px", maxWidth: "90%" }}>
                        <h3 className="card-title">Create New Batch</h3>
                        <form onSubmit={handleAddBatch} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                            <div>
                                <label className="input-label">Domain</label>
                                <input className="input" disabled value={domains.find(d => d.id === selectedDomain)?.name} style={{ background: "#f3f4f6" }} />
                            </div>

                            <div>
                                <label className="input-label">Batch Name</label>
                                <input
                                    className="input"
                                    placeholder="e.g. Batch C"
                                    required
                                    value={newBatch.name}
                                    onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                                />
                            </div>

                            <div className="form-grid">
                                <div>
                                    <label className="input-label">Start Date</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={newBatch.startDate}
                                        onChange={(e) => setNewBatch({ ...newBatch, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="input-label">End Date</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={newBatch.endDate}
                                        onChange={(e) => setNewBatch({ ...newBatch, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Batch</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
