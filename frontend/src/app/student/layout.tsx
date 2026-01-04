"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
    Home,
    Award,
    LogOut
} from "lucide-react";
import "./student.css";
import ShinyText from "@/components/ShinyText";
import LightPillar from "@/components/LightPillar";
import AppFooter from "@/components/AppFooter";

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    // Use the global auth logout which handles Firebase + State + Redirect
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    const navItems = [
        { name: "My Dashboard", href: "/student/dashboard", icon: Home },
        { name: "Certificates", href: "/student/certificates", icon: Award },
    ];

    return (
        <div className="student-layout" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Background Animations */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none',
            }}>
                <LightPillar
                    topColor="#ff0000"
                    bottomColor="#262222"
                    intensity={0.8}
                    rotationSpeed={0.4}
                    interactive={false}
                    glowAmount={0.002}
                    pillarWidth={3}
                    pillarHeight={0.4}
                    noiseIntensity={0.5}
                    pillarRotation={25}
                />
            </div>

            {/* Content Wrapper to ensure z-index separation */}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

                {/* Top Navigation for Student (Simpler than Admin) */}
                <header className="student-header">
                    <div className="container header-container">
                        <Link href="https://www.zapsters.in" target="_blank" className="brand-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {/* Logo from Zapsters Website */}
                            <img
                                src="https://www.zapsters.in/assets/logo-Cvls4dij.png"
                                alt="Zapsters Logo"
                                style={{ height: '32px', width: 'auto' }}
                            />
                            <ShinyText text="Zapsters" color="#ffffff" shineColor="#ef4444" speed={3} />
                        </Link>

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

                <AppFooter theme="dark" />
            </div>
        </div>
    );
}
