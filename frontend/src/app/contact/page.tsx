"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder for actual submission
        alert("Thank you for contacting us. We will get back to you shortly.");
        setFormData({ name: "", email: "", message: "" });
    };

    return (
        <div style={{ minHeight: "100vh", background: "#f5f5f7", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>

            {/* Hero Section */}
            <div style={{ background: "#000", color: "#fff", padding: "4rem 1rem", textAlign: "center" }}>
                <h1 style={{ fontSize: "3rem", fontWeight: "700", marginBottom: "1rem" }}>Contact Us</h1>
                <p style={{ fontSize: "1.2rem", color: "#86868b", maxWidth: "600px", margin: "0 auto" }}>
                    We’re here to help with any questions or issues you might have. Reach out to our support team.
                </p>
            </div>

            <div className="container" style={{ maxWidth: "1000px", margin: "4rem auto", padding: "0 20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "start" }}>

                    {/* Contact Info */}
                    <div>
                        <h2 style={{ fontSize: "2rem", fontWeight: "600", marginBottom: "2rem", color: "#1d1d1f" }}>Get in Touch</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                                <div style={{ background: "#e8e8ed", padding: "10px", borderRadius: "50%" }}>
                                    <Mail size={24} color="#1d1d1f" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.25rem", color: "#1d1d1f" }}>Email Support</h3>
                                    <p style={{ color: "#515154" }}>support@zapsters.in</p>
                                    <p style={{ color: "#86868b", fontSize: "0.9rem", marginTop: "0.25rem" }}>We reply within 24 hours.</p>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                                <div style={{ background: "#e8e8ed", padding: "10px", borderRadius: "50%" }}>
                                    <Phone size={24} color="#1d1d1f" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.25rem", color: "#1d1d1f" }}>Phone</h3>
                                    <p style={{ color: "#515154" }}>+91 98765 43210</p>
                                    <p style={{ color: "#86868b", fontSize: "0.9rem", marginTop: "0.25rem" }}>Mon-Fri, 9am - 6pm IST</p>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                                <div style={{ background: "#e8e8ed", padding: "10px", borderRadius: "50%" }}>
                                    <MapPin size={24} color="#1d1d1f" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.25rem", color: "#1d1d1f" }}>Office</h3>
                                    <p style={{ color: "#515154" }}>Zapsters Technologies</p>
                                    <p style={{ color: "#515154" }}>Tech Park, Bangalore, India</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="card" style={{
                        background: "#fff",
                        padding: "2rem",
                        borderRadius: "18px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                        border: "1px solid rgba(0,0,0,0.05)"
                    }}>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", color: "#1d1d1f" }}>Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={{
                                        width: "100%",
                                        padding: "1rem",
                                        borderRadius: "12px",
                                        border: "1px solid #d2d2d7",
                                        fontSize: "1rem",
                                        outline: "none",
                                        background: "#fbfbfd"
                                    }}
                                    placeholder="Your Name"
                                />
                            </div>

                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", color: "#1d1d1f" }}>Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={{
                                        width: "100%",
                                        padding: "1rem",
                                        borderRadius: "12px",
                                        border: "1px solid #d2d2d7",
                                        fontSize: "1rem",
                                        outline: "none",
                                        background: "#fbfbfd"
                                    }}
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", color: "#1d1d1f" }}>Message</label>
                                <textarea
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    style={{
                                        width: "100%",
                                        padding: "1rem",
                                        borderRadius: "12px",
                                        border: "1px solid #d2d2d7",
                                        fontSize: "1rem",
                                        minHeight: "150px",
                                        resize: "vertical",
                                        outline: "none",
                                        background: "#fbfbfd",
                                        fontFamily: "inherit"
                                    }}
                                    placeholder="How can we help you?"
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{
                                    width: "100%",
                                    padding: "1rem",
                                    borderRadius: "12px",
                                    fontSize: "1rem",
                                    background: "#0071e3", // Apple-like blue or stick to red? User likes professional. Blue is standard contact.
                                    // But Zapsters is red. Let's use Zapsters Red but cleaner.
                                    backgroundColor: "#E10600", // Zapsters Red
                                    color: "#fff",
                                    fontWeight: "600"
                                }}
                            >
                                Send Message <Send size={18} style={{ marginLeft: "8px" }} />
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
