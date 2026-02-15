'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { MenuItem } from '@/types';

function MenuManagementPageContent() {
    const searchParams = useSearchParams();
    const subdomain = searchParams.get('subdomain');
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [vendorId, setVendorId] = useState<string>('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: '',
        isAvailable: true,
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        if (!subdomain) return;

        async function fetchData() {
            const vendorRes = await fetch(`/api/vendors?subdomain=${subdomain}`);
            const vendor = await vendorRes.json();
            setVendorId(vendor.id);

            const menuRes = await fetch(`/api/menu?vendorId=${vendor.id}`);
            const items = await menuRes.json();
            setMenuItems(items);
        }

        fetchData();
    }, [subdomain]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = {
            vendorId,
            name: formData.name,
            price: parseFloat(formData.price),
            category: formData.category,
            isAvailable: formData.isAvailable,
        };

        if (editingId) {
            // Update
            await fetch(`/api/menu`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editingId, ...data }),
            });
        } else {
            // Create
            await fetch(`/api/menu`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
        }

        // Refresh
        const menuRes = await fetch(`/api/menu?vendorId=${vendorId}`);
        const items = await menuRes.json();
        setMenuItems(items);

        // Reset form
        setFormData({ name: '', price: '', category: '', isAvailable: true });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (item: MenuItem) => {
        setFormData({
            name: item.name,
            price: item.price.toString(),
            category: item.category,
            isAvailable: item.isAvailable,
        });
        setEditingId(item.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this item?')) return;

        await fetch(`/api/menu?id=${id}`, { method: 'DELETE' });

        const menuRes = await fetch(`/api/menu?vendorId=${vendorId}`);
        const items = await menuRes.json();
        setMenuItems(items);
    };

    const toggleAvailability = async (item: MenuItem) => {
        await fetch(`/api/menu`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: item.id, isAvailable: !item.isAvailable }),
        });

        const menuRes = await fetch(`/api/menu?vendorId=${vendorId}`);
        const items = await menuRes.json();
        setMenuItems(items);
    };

    const categories = [...new Set(menuItems.map((item) => item.category))];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
                <button
                    onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', price: '', category: '', isAvailable: true }); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                    + Add Item
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{editingId ? 'Edit Item' : 'Add New Item'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Tea"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Beverages"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="available"
                                checked={formData.isAvailable}
                                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                                className="w-4 h-4 text-blue-600"
                            />
                            <label htmlFor="available" className="text-sm font-medium text-gray-700">Available</label>
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg">
                                {editingId ? 'Update Item' : 'Add Item'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); setEditingId(null); }}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-6 py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {categories.map((category) => (
                <div key={category} className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{category}</h3>
                    <div className="space-y-3">
                        {menuItems
                            .filter((item) => item.category === category)
                            .map((item) => (
                                <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                        <p className="text-blue-600 font-bold">₹{item.price}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleAvailability(item)}
                                            className={`px-3 py-1 rounded-lg text-sm font-medium ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {item.isAvailable ? 'Available' : 'Sold Out'}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-blue-600 hover:text-blue-700 font-medium text-sm px-3 py-1"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-600 hover:text-red-700 font-medium text-sm px-3 py-1"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            ))}

            {menuItems.length === 0 && !showForm && (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                    <p className="text-gray-600 mb-4">No menu items yet. Add your first item!</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg"
                    >
                        + Add Item
                    </button>
                </div>
            )}
        </div>
    );
}

export default function MenuManagementPage() {
    return (
        <Suspense fallback={<div className="max-w-4xl mx-auto"><div className="text-gray-600">Loading...</div></div>}>
            <MenuManagementPageContent />
        </Suspense>
    );
}
