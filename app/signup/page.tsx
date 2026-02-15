'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateSubdomain } from '@/lib/utils';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        subdomain: '',
        whatsappNumber: '',
        upiId: '',
        address: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleNameChange = (name: string) => {
        setFormData({
            ...formData,
            name,
            subdomain: generateSubdomain(name),
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Check subdomain availability
            const checkResponse = await fetch(
                `/api/vendors/check-subdomain?subdomain=${formData.subdomain}`
            );
            const { available } = await checkResponse.json();

            if (!available) {
                setError('This subdomain is already taken. Please try a different name.');
                setLoading(false);
                return;
            }

            // Create vendor
            const response = await fetch('/api/vendors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create vendor');
            }

            const vendor = await response.json();

            // Redirect to dashboard using current host
            const currentHost = window.location.host; // e.g., localhost:3000
            window.location.href = `http://${vendor.subdomain}.${currentHost}/dashboard`;
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Digital Menu</h1>
                <p className="text-gray-600 mb-6">Start accepting orders in minutes</p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Shop Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ram's Cafe"
                        />
                    </div>

                    <div>
                        <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700 mb-1">
                            Your Subdomain
                        </label>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                            <span className="font-mono">{formData.subdomain || 'your-shop'}</span>
                            <span>.{process.env.NEXT_PUBLIC_APP_DOMAIN}</span>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                            WhatsApp Number * <span className="text-xs text-gray-500">(with country code)</span>
                        </label>
                        <input
                            type="tel"
                            id="whatsapp"
                            required
                            value={formData.whatsappNumber}
                            onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="919876543210"
                        />
                    </div>

                    <div>
                        <label htmlFor="upi" className="block text-sm font-medium text-gray-700 mb-1">
                            UPI ID *
                        </label>
                        <input
                            type="text"
                            id="upi"
                            required
                            value={formData.upiId}
                            onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="yourshop@upi"
                        />
                    </div>

                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                        </label>
                        <textarea
                            id="address"
                            rows={2}
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Street, City, State"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                        {loading ? 'Creating...' : 'Create My Menu'}
                    </button>
                </form>

                <p className="text-xs text-gray-500 mt-4 text-center">
                    No login required. Your dashboard will be publicly accessible for testing.
                </p>
            </div>
        </div>
    );
}
