"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
    LayoutDashboard,
    Users,
    Calendar,
    BookOpen,
    Layers,
    LogOut,
    Menu,
    X
} from "lucide-react";
import "./admin.css";
import ShinyText from "@/components/ShinyText";

import AppFooter from "@/components/AppFooter";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const navItems = [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Domains", href: "/admin/domains", icon: BookOpen },
        { name: "Batches", href: "/admin/batches", icon: Layers },
        { name: "Tutors", href: "/admin/tutors", icon: Users },
        { name: "Students", href: "/admin/students", icon: Users },
        { name: "Sessions", href: "/admin/sessions", icon: Calendar },
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
                    <h1 className="brand-logo">
                        <ShinyText text="Zapsters" color="#ffffff" shineColor="#ef4444" speed={3} />
                    </h1>
                    <span className="brand-badge">Admin</span>
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
                    <button onClick={handleLogout} className="nav-item logout-btn">
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
                        <div className="avatar">A</div>
                        <span className="user-name">Admin User</span>
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
