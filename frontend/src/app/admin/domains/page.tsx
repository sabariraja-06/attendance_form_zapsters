"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import "../admin.css";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { Domain } from "@/types";

export default function DomainsPage() {
    // 1. Direct Firestore Read (Real-time updates without refreshing!)
    const { data: domains, loading } = useFirestoreCollection<Domain>('domains', [], true);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newDomainName, setNewDomainName] = useState("");

    const handleAddDomain = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDomainName.trim()) return;
        try {
            await api.domains.create({ name: newDomainName });
            setNewDomainName("");
            setIsAddModalOpen(false);
            // No need to fetchDomains() - hook updates automatically!
        } catch (error) {
            console.error(error);
            alert("Failed to add domain");
        }
    };

    const handleDeleteDomain = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
        try {
            await api.domains.delete(id);
            // No need to fetchDomains()
        } catch (error) {
            console.error(error);
            alert("Failed to delete domain");
        }
    };

    return (
        <div className="dashboard-container">
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "700" }}>Domains</h2>
                <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
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
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} style={{ textAlign: "center" }}>Loading domains...</td></tr>
                            ) : domains.length === 0 ? (
                                <tr><td colSpan={4} style={{ textAlign: "center" }}>No domains found.</td></tr>
                            ) : (
                                domains.map((domain) => (
                                    <tr key={domain.id}>
                                        <td style={{ fontWeight: 500 }}>{domain.name}</td>
                                        <td style={{ color: "var(--gray-500)", fontSize: "0.9rem" }}>{domain.id}</td>
                                        <td>
                                            <span className="badge" style={{ background: "#ECFDF5", color: "#059669" }}>Active</span>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleDeleteDomain(domain.id, domain.name)}
                                                style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444" }}
                                                title="Delete Domain"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Domain Modal */}
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
                    <div className="card" style={{ width: "400px", maxWidth: "90%" }}>
                        <h3 className="card-title">Add New Domain</h3>
                        <form onSubmit={handleAddDomain} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label className="input-label">Domain Name</label>
                                <input
                                    className="input"
                                    required
                                    placeholder="e.g. Web Development"
                                    value={newDomainName}
                                    onChange={e => setNewDomainName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add Domain</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
