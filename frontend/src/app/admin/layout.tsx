"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Calendar,
    BookOpen,
    Layers,
    LogOut,
    Settings
} from "lucide-react";
import "./admin.css";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        // TODO: Clear auth state
        router.push("/");
    };

    const navItems = [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Domains", href: "/admin/domains", icon: BookOpen },
        { name: "Batches", href: "/admin/batches", icon: Layers },
        { name: "Students", href: "/admin/students", icon: Users },
        { name: "Sessions", href: "/admin/sessions", icon: Calendar },
    ];

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1 className="brand-logo">Zapsters</h1>
                    <span className="brand-badge">Admin</span>
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
                    <h2 className="page-title">
                        {navItems.find(i => i.href === pathname)?.name || "Dashboard"}
                    </h2>
                    <div className="user-profile">
                        <div className="avatar">A</div>
                        <span>Admin User</span>
                    </div>
                </header>

                <div className="content-area">
                    {children}
                </div>
            </main>
        </div>
    );
}
