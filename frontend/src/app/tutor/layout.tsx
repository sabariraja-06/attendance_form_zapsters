"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
    LayoutDashboard,
    Users,
    Calendar,
    LogOut,
    Menu,
    X
} from "lucide-react";
import "../admin/admin.css"; // Reuse admin styles for consistency

import AppFooter from "@/components/AppFooter";

export default function TutorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const navItems = [
        { name: "Dashboard", href: "/tutor/dashboard", icon: LayoutDashboard },
        { name: "My Sessions", href: "/tutor/sessions", icon: Calendar },
        // { name: "My Students", href: "/tutor/students", icon: Users }, // Add later if needed
    ];

    return (
        <div className="admin-layout">
            {/* Mobile Menu Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="mobile-backdrop"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <h1 className="brand-logo">Zapsters</h1>
                    <span className="brand-badge" style={{ background: "var(--primary-red)" }}>Tutor</span>
                    <button
                        className="mobile-close-btn"
                        onClick={closeMobileMenu}
                        aria-label="Close menu"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-item ${isActive ? "active" : ""}`}
                                onClick={closeMobileMenu}
                            >
                                <Icon size={20} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={logout} className="nav-item logout-btn">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="top-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setIsMobileMenuOpen(true)}
                            aria-label="Open menu"
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="page-title">
                            {navItems.find(i => i.href === pathname)?.name || "Dashboard"}
                        </h2>
                    </div>
                    <div className="user-profile">
                        <div className="avatar" style={{ background: "var(--primary-red)" }}>
                            {user?.name?.[0] || "T"}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="user-name">{user?.name || "Tutor"}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                {user?.domainId ? `${user.domainId} Domain` : 'Tutor Panel'}
                            </span>
                        </div>
                    </div>
                </header>

                <div className="content-area" style={{ flex: 1 }}>
                    {children}
                </div>
                <AppFooter theme="light" />
            </main>
        </div>
    );
}
