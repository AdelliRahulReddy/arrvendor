'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Vendor, MenuItem } from '@/types';
import QRCode from 'react-qr-code';

function DashboardOverviewContent() {
    const searchParams = useSearchParams();
    const subdomain = searchParams.get('subdomain');
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const menuUrl = `http://${subdomain}.localhost:3000`;

    useEffect(() => {
        if (!subdomain) return;

        async function fetchData() {
            // Fetch vendor
            const vendorRes = await fetch(`/api/vendors?subdomain=${subdomain}`);
            const vendorData = await vendorRes.json();
            setVendor(vendorData);

            // Fetch menu items
            const menuRes = await fetch(`/api/menu?vendorId=${vendorData.id}`);
            const menuData = await menuRes.json();
            setMenuItems(menuData);
        }

        fetchData();
    }, [subdomain]);

    const downloadQR = () => {
        const svg = document.getElementById('qr-code');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.download = `${subdomain}-qr-code.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    const availableItems = menuItems.filter((item) => item.isAvailable).length;

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="text-gray-600 text-sm font-medium mb-1">Total Items</div>
                    <div className="text-3xl font-bold text-gray-900">{menuItems.length}</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="text-gray-600 text-sm font-medium mb-1">Available</div>
                    <div className="text-3xl font-bold text-green-600">{availableItems}</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="text-gray-600 text-sm font-medium mb-1">Sold Out</div>
                    <div className="text-3xl font-bold text-red-600">{menuItems.length - availableItems}</div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Your QR Code</h3>
                <p className="text-gray-600 mb-6">
                    Print this QR code and display it in your shop. Customers can scan it to view your menu.
                </p>

                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                        <QRCode id="qr-code" value={menuUrl} size={200} />
                    </div>

                    <div className="flex-1">
                        <div className="mb-4">
                            <div className="text-sm font-medium text-gray-700 mb-1">Your Customer View URL:</div>
                            <a
                                href={typeof window !== 'undefined' ? `${window.location.protocol}//${subdomain}.${window.location.host.split('.').slice(-1)[0]}` : '#'}
                                target="_blank"
                                className="text-blue-600 hover:underline font-mono text-sm break-all"
                            >
                                {typeof window !== 'undefined' ? `${window.location.protocol}//${subdomain}.${window.location.host.split('.').slice(-1)[0]}` : ''}
                            </a>
                        </div>

                        <button
                            onClick={downloadQR}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                        >
                            Download QR Code
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DashboardOverview() {
    return (
        <Suspense fallback={<div className="max-w-4xl mx-auto"><div className="text-gray-600">Loading...</div></div>}>
            <DashboardOverviewContent />
        </Suspense>
    );
}
