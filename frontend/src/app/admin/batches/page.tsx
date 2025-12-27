"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Calendar } from "lucide-react";
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
        fetch('http://localhost:5001/api/admin/domains')
            .then(res => res.json())
            .then(data => {
                setDomains(data);
                if (data.length > 0) setSelectedDomain(data[0].id);
            });
    }, []);

    const fetchBatches = () => {
        if (!selectedDomain) return;
        fetch(`http://localhost:5001/api/admin/batches?domainId=${selectedDomain}`)
            .then(res => res.json())
            .then(data => setBatches(data));
    };

    useEffect(() => {
        fetchBatches();
    }, [selectedDomain]);

    const handleAddBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5001/api/admin/batches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBatch)
            });
            if (res.ok) {
                setShowModal(false);
                fetchBatches(); // Refresh
                setNewBatch({ name: "", domainId: selectedDomain, startDate: "", endDate: "" });
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="dashboard-container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "700" }}>Batches</h2>
                    <select
                        className="input"
                        style={{ width: "200px" }}
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
                                            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444" }}>
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
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
                }}>
                    <div className="card" style={{ width: "450px" }}>
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

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
