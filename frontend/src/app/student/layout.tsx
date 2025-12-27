"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Home,
    Award,
    LogOut
} from "lucide-react";
import "./student.css";

export default function StudentLayout({
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
        { name: "My Dashboard", href: "/student/dashboard", icon: Home },
        { name: "Certificates", href: "/student/certificates", icon: Award },
    ];

    return (
        <div className="student-layout">
            {/* Top Navigation for Student (Simpler than Admin) */}
            <header className="student-header">
                <div className="container header-container">
                    <div className="brand-logo">Zapsters</div>

                    <nav className="student-nav">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`student-nav-item ${isActive ? "active" : ""}`}
                                >
                                    <Icon size={18} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                        <button onClick={handleLogout} className="student-nav-item logout">
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="student-content container">
                {children}
            </main>
        </div>
    );
}
