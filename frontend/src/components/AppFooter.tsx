"use client";

import React from 'react';

interface AppFooterProps {
    className?: string;
    theme?: 'light' | 'dark';
}

export default function AppFooter({ className, theme = 'light' }: AppFooterProps) {
    // Light theme: Dark text on light background
    // Dark theme: White text on dark background
    const textColor = theme === 'dark' ? '#ffffff' : '#6b7280';
    const brandColor = theme === 'dark' ? '#ffffff' : '#111827';

    return (
        <footer className={className} style={{
            padding: '1.5rem 0',
            marginTop: 'auto',
            width: '100%',
            backgroundColor: 'inherit'
        }}>
            <div className="container" style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 1rem',
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center'
            }}>
                <span style={{
                    color: textColor,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    flexWrap: 'wrap'
                }}>
                    &copy; 2025 <span style={{ fontWeight: 800, color: brandColor }}>Zapsters</span>. All rights reserved.
                </span>
            </div>
        </footer>
    );
}
