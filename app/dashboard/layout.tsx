'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Vendor } from '@/types';
import Link from 'next/link';

function DashboardContent({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams();
    const subdomain = searchParams.get('subdomain');
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fallback: extract subdomain from current URL if searchParams is empty or "null"
        let currentSubdomain = (subdomain === 'null') ? null : subdomain;

        if (!currentSubdomain && typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            const parts = hostname.split('.');
            // If hostname is like "vendor.localhost", extract "vendor"
            if (parts.length > 1 && parts[parts.length - 1] === 'localhost') {
                currentSubdomain = parts[0];
            }
        }

        console.log('Dashboard - raw searchParams subdomain:', subdomain);
        console.log('Dashboard - resolved subdomain:', currentSubdomain);

        if (!currentSubdomain) {
            console.error('No subdomain found on host:', typeof window !== 'undefined' ? window.location.hostname : 'SSR');
            setLoading(false);
            return;
        }

        async function fetchVendor() {
            try {
                const res = await fetch(`/api/vendors?subdomain=${currentSubdomain}`);
                if (!res.ok) throw new Error('Vendor not found');
                const data = await res.json();
                setVendor(data);
            } catch (error) {
                console.error('Error fetching vendor:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchVendor();
    }, [subdomain]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-xl text-gray-600">Loading dashboard...</div>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Vendor Not Found</h1>
                    <p className="text-gray-600">This vendor does not exist in our system.</p>
                </div>
            </div>
        );
    }

    const resolvedSubdomain = vendor.subdomain;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{vendor.name}</h1>
                            <p className="text-sm text-gray-500">Dashboard</p>
                        </div>
                        <Link
                            href={typeof window !== 'undefined' ? `${window.location.protocol}//${resolvedSubdomain}.${window.location.host.split('.').slice(-1)[0]}` : '#'}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            target="_blank"
                        >
                            View Public Menu →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4">
                    <nav className="flex gap-6">
                        <Link
                            href={`/dashboard?subdomain=${resolvedSubdomain}`}
                            className="py-4 border-b-2 border-blue-600 text-blue-600 font-medium"
                        >
                            Overview
                        </Link>
                        <Link
                            href={`/dashboard/menu?subdomain=${resolvedSubdomain}`}
                            className="py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium"
                        >
                            Menu
                        </Link>
                        <Link
                            href={`/dashboard/settings?subdomain=${resolvedSubdomain}`}
                            className="py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium"
                        >
                            Settings
                        </Link>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">{children}</div>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-xl text-gray-600">Loading dashboard...</div>
            </div>
        }>
            <DashboardContent>{children}</DashboardContent>
        </Suspense>
    );
}
