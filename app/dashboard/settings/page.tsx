'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Vendor } from '@/types';

function SettingsPageContent() {
    const searchParams = useSearchParams();
    const subdomain = searchParams.get('subdomain');
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        whatsappNumber: '',
        upiId: '',
        address: '',
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!subdomain) return;

        async function fetchVendor() {
            const res = await fetch(`/api/vendors?subdomain=${subdomain}`);
            const data = await res.json();
            setVendor(data);
            setFormData({
                name: data.name,
                whatsappNumber: data.whatsappNumber,
                upiId: data.upiId,
                address: data.address,
            });
        }

        fetchVendor();
    }, [subdomain]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const res = await fetch('/api/vendors', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: vendor?.id,
                    ...formData,
                }),
            });

            if (!res.ok) throw new Error('Failed to update');

            setMessage('Settings saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    if (!vendor) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>

            {message && (
                <div className={`mb-6 px-4 py-3 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                    }`}>
                    {message}
                </div>
            )}

            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Subdomain</h3>
                <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-mono">{vendor.subdomain}</span>
                    <span className="text-gray-600">.{process.env.NEXT_PUBLIC_APP_DOMAIN}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Subdomain cannot be changed</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Shop Details</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            WhatsApp Number <span className="text-xs text-gray-500">(with country code)</span>
                        </label>
                        <input
                            type="tel"
                            required
                            value={formData.whatsappNumber}
                            onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="919876543210"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                        <input
                            type="text"
                            required
                            value={formData.upiId}
                            onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="yourshop@upi"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea
                            rows={3}
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Street, City, State"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="max-w-2xl mx-auto"><div className="text-gray-600">Loading...</div></div>}>
            <SettingsPageContent />
        </Suspense>
    );
}
