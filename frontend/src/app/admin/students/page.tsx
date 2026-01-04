"use client";

import { useState, useEffect } from "react";
import { Users, Filter, Plus, Search, Mail, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import "../admin.css";

// Interface for Student
interface Student {
    id: string;
    name: string;
    email: string;
    domainId: string;
    batchId: string;
}

interface Batch {
    id: string;
    name: string;
    domainId: string;
}

interface Domain {
    id: string;
    name: string;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [domains, setDomains] = useState<Domain[]>([]);

    const [selectedDomain, setSelectedDomain] = useState("web-dev");
    const [selectedBatch, setSelectedBatch] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [newStudent, setNewStudent] = useState({
        name: "",
        email: "",
        domainId: "web-dev",
        batchId: "batch-a"
    });
    const [modalBatches, setModalBatches] = useState<Batch[]>([]);

    // Load Domains
    useEffect(() => {
        const fetchDomains = async () => {
            try {
                const data: any = await api.domains.getAll();
                if (Array.isArray(data)) setDomains(data);
            } catch (err) { console.error("Failed to load domains", err); }
        };
        fetchDomains();
    }, []);

    // Load Batches when Domain Changes
    useEffect(() => {
        if (!selectedDomain) return;
        const fetchBatches = async () => {
            try {
                const data: any = await api.batches.getAll(selectedDomain);
                if (Array.isArray(data)) setBatches(data);
            } catch (err) { console.error("Failed to load batches", err); }
        };
        fetchBatches();
    }, [selectedDomain]);

    // Load Students
    const loadStudents = async () => {
        setLoading(true);
        try {
            const filters: any = {};
            if (selectedDomain) filters.domainId = selectedDomain;
            if (selectedBatch !== 'all') filters.batchId = selectedBatch;

            const data: any = await api.students.getAll(filters);
            if (Array.isArray(data)) {
                setStudents(data);
            } else {
                setStudents([]);
            }
        } catch (err) {
            console.error("Failed to load students", err);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudents();
    }, [selectedDomain, selectedBatch]);


    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.students.create(newStudent);
            setIsAddModalOpen(false);
            setNewStudent({ name: "", email: "", domainId: "web-dev", batchId: "batch-a" });
            loadStudents(); // Refresh list
            alert("Student added successfully!");
        } catch (error) {
            alert("Error adding student");
        }
    };

    const handleDeleteStudent = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await api.students.delete(id);
            loadStudents();
            alert("Student deleted successfully");
        } catch (error) {
            console.error(error);
            alert("Error deleting student");
        }
    };

    // Load batches for modal when domain changes
    useEffect(() => {
        if (isAddModalOpen && newStudent.domainId) {
            const fetchModalBatches = async () => {
                try {
                    const data: any = await api.batches.getAll(newStudent.domainId);
                    if (Array.isArray(data)) {
                        setModalBatches(data);
                        if (data.length > 0) {
                            setNewStudent(prev => ({ ...prev, batchId: data[0].id }));
                        }
                    }
                } catch (err) { console.error("Failed to load batches for modal", err); }
            };
            fetchModalBatches();
        }
    }, [isAddModalOpen, newStudent.domainId]);

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Helper functions to get names from IDs
    const getDomainName = (domainId: string) => {
        const domain = domains.find(d => d.id === domainId);
        return domain ? domain.name : domainId;
    };

    const getBatchName = (batchId: string) => {
        const batch = batches.find(b => b.id === batchId);
        return batch ? batch.name : batchId;
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
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <select
                        className="input"
                        value={selectedDomain}
                        onChange={(e) => setSelectedDomain(e.target.value)}
                    >
                        {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>

                    <select
                        className="input"
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                    >
                        <option value="all">All Batches</option>
                        {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>

                <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={18} style={{ marginRight: "0.5rem" }} />
                    Add Student
                </button>
            </div>

            {/* Students Table */}
            <div className="card" style={{ padding: "0" }}>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Domain</th>
                                <th>Batch</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>Loading...</td></tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>No students found.</td></tr>
                            ) : (
                                filteredStudents.map(student => (
                                    <tr key={student.id}>
                                        <td style={{ fontWeight: 500 }}>{student.name}</td>
                                        <td style={{ color: "var(--gray-500)" }}>{student.email}</td>
                                        <td><span className="badge" style={{ background: "#F3F4F6" }}>{getDomainName(student.domainId)}</span></td>
                                        <td>{getBatchName(student.batchId)}</td>
                                        <td>
                                            <button
                                                onClick={() => handleDeleteStudent(student.id, student.name)}
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

            {/* Add Student Modal (Simple Overlay) */}
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
                        <h3 className="card-title">Add New Student</h3>
                        <form onSubmit={handleAddStudent} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label className="input-label">Full Name</label>
                                <input className="input" required value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="input-label">Email Address</label>
                                <input className="input" type="email" required value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} />
                            </div>
                            <div className="form-grid">
                                <div>
                                    <label className="input-label">Domain</label>
                                    <select className="input" value={newStudent.domainId} onChange={e => setNewStudent({ ...newStudent, domainId: e.target.value })}>
                                        {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label">Batch</label>
                                    <select className="input" value={newStudent.batchId} onChange={e => setNewStudent({ ...newStudent, batchId: e.target.value })}>
                                        {modalBatches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add Student</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
