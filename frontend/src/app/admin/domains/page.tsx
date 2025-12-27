"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import "../admin.css";

interface Domain {
    id: string;
    name: string;
}

export default function DomainsPage() {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newDomainName, setNewDomainName] = useState("");

    const fetchDomains = () => {
        fetch('http://localhost:5001/api/admin/domains')
            .then(res => res.json())
            .then(data => setDomains(data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchDomains();
    }, []);

    const handleAddDomain = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5001/api/admin/domains', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newDomainName })
            });
            if (res.ok) {
                setShowModal(false);
                setNewDomainName("");
                fetchDomains();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="dashboard-container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "700" }}>Domains</h2>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} style={{ marginRight: "0.5rem" }} />
                    Add Domain
                </button>
            </div>

            <div className="card full-width">
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Domain Name</th>
                                <th>Domain ID</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {domains.length === 0 ? (
                                <tr><td colSpan={3} style={{ textAlign: "center" }}>Loading domains...</td></tr>
                            ) : (
                                domains.map((domain) => (
                                    <tr key={domain.id}>
                                        <td style={{ fontWeight: 500 }}>{domain.name}</td>
                                        <td style={{ color: "var(--gray-500)", fontSize: "0.9rem" }}>{domain.id}</td>
                                        <td>
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                <button style={{ padding: "0.5rem", border: "1px solid #FECACA", borderRadius: "6px", background: "#FEF2F2", cursor: "pointer", color: "#DC2626" }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Domain Modal */}
            {showModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
                }}>
                    <div className="card" style={{ width: "400px" }}>
                        <h3 className="card-title">Add New Domain</h3>
                        <form onSubmit={handleAddDomain}>
                            <input
                                className="input"
                                placeholder="Domain Name"
                                style={{ marginBottom: "1rem" }}
                                value={newDomainName}
                                onChange={(e) => setNewDomainName(e.target.value)}
                                required
                            />
                            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Domain</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
