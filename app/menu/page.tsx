'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense, useMemo } from 'react';
import { Vendor, MenuItem, CartItem } from '@/types';
import { generateWhatsAppLink, formatWhatsAppOrder, generateUpiLink } from '@/lib/utils';

function MenuPageContent() {
    const searchParams = useSearchParams();
    const subdomain = searchParams.get('subdomain');

    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string>('All');

    useEffect(() => {
        // Fallback: extract subdomain from current URL
        let currentSubdomain = (subdomain === 'null') ? null : subdomain;

        if (!currentSubdomain && typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            const parts = hostname.split('.');
            if (parts.length > 1 && parts[parts.length - 1] === 'localhost') {
                currentSubdomain = parts[0];
            }
        }

        if (!currentSubdomain) {
            setLoading(false);
            return;
        }

        async function fetchData() {
            try {
                const vendorRes = await fetch(`/api/vendors?subdomain=${currentSubdomain}`);
                if (!vendorRes.ok) throw new Error('Vendor not found');
                const vendorData = await vendorRes.json();
                setVendor(vendorData);

                const menuRes = await fetch(`/api/menu?vendorId=${vendorData.id}`);
                const menuData = await menuRes.json();
                setMenuItems(menuData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [subdomain]);

    const categories = useMemo(() => {
        const cats = ['All', ...new Set(menuItems.map((item) => item.category))];
        return cats;
    }, [menuItems]);

    const filteredItems = useMemo(() => {
        if (activeCategory === 'All') return menuItems;
        return menuItems.filter(item => item.category === activeCategory);
    }, [menuItems, activeCategory]);

    const addToCart = (item: MenuItem) => {
        const existing = cart.find((c) => c.id === item.id);
        if (existing) {
            setCart(cart.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)));
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart((prev) =>
            prev
                .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
                .filter((item) => item.quantity > 0)
        );
    };

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleWhatsAppOrder = () => {
        if (!vendor || cart.length === 0) return;
        const message = formatWhatsAppOrder(cart, vendor);
        const link = generateWhatsAppLink(vendor.whatsappNumber, message);
        window.open(link, '_blank');
    };

    const handleUpiPayment = () => {
        if (!vendor || totalAmount === 0) return;
        const link = generateUpiLink(vendor.upiId, vendor.name, totalAmount);
        window.location.href = link;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="flex flex-col items-center animate-pulse">
                    <div className="w-16 h-16 bg-blue-100 rounded-full mb-4 flex items-center justify-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
                    </div>
                    <div className="text-xl font-semibold text-gray-400">Loading your menu...</div>
                </div>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center max-w-sm">
                    <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Shop Not Found</h1>
                    <p className="text-gray-600">The shop you're looking for doesn't exist or has moved.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-gray-900 pb-40">
            {/* Hero Section */}
            <div className="relative h-64 md:h-80 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-[#F8FAFC]"></div>
                <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-[2px]"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 max-w-4xl mx-auto">
                    <div className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                        Open Now
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2 tracking-tight">
                        {vendor.name}
                    </h1>
                    <div className="flex items-center text-gray-600 gap-2">
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                        <span className="text-sm font-medium">{vendor.address || 'Quality Food & Fast Service'}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-8">
                {/* Category Slider */}
                <div className="sticky top-4 z-40 mb-10 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 bg-[#F8FAFC]/80 backdrop-blur-md">
                    <div className="flex gap-2 min-w-max">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${activeCategory === cat
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                                        : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className={`group bg-white rounded-3xl p-4 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 flex gap-4 ${!item.isAvailable ? 'opacity-50 grayscale' : ''
                                }`}
                        >
                            <div className="relative w-28 h-28 md:w-32 md:h-32 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    </div>
                                )}
                                {!item.isAvailable && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <span className="text-white text-[10px] font-black uppercase tracking-widest bg-red-600 px-2 py-1 rounded">Sold Out</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col justify-between flex-1 py-1">
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.name}</h3>
                                        <div className="w-4 h-4 rounded-sm border border-gray-300 flex items-center justify-center p-[2px]">
                                            <div className="w-full h-full rounded-full bg-green-600"></div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium">{item.category}</p>
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                    <span className="text-xl font-black text-blue-600">₹{item.price}</span>
                                    {item.isAvailable && (
                                        <button
                                            onClick={() => addToCart(item)}
                                            className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all duration-300"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="text-6xl mb-4">🍽️</div>
                        <p className="text-gray-400 font-bold">No items found in this category.</p>
                    </div>
                )}
            </div>

            {/* Premium Floating Cart */}
            {cart.length > 0 && (
                <div className="fixed bottom-6 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 duration-500">
                    <div className="max-w-lg mx-auto bg-gray-900 text-white rounded-[2.5rem] shadow-2xl shadow-blue-900/40 p-5 backdrop-blur-xl border border-white/10">
                        <div className="flex items-center justify-between mb-5 px-2">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center relative">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 100-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path></svg>
                                    <span className="absolute -top-2 -right-2 bg-white text-blue-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                                        {totalItems}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Total Order</p>
                                    <p className="text-xl font-black text-white">₹{totalAmount}</p>
                                </div>
                            </div>
                            <div className="flex -space-x-3 overflow-hidden">
                                {cart.slice(0, 3).map((item, idx) => (
                                    <div key={item.id} className="w-10 h-10 rounded-full border-2 border-gray-900 overflow-hidden bg-gray-800 flex-shrink-0 z-[idx]">
                                        <img src={item.image} className="w-full h-full object-cover" alt="" />
                                    </div>
                                ))}
                                {cart.length > 3 && (
                                    <div className="w-10 h-10 rounded-full border-2 border-gray-900 bg-blue-600 text-[10px] font-black flex items-center justify-center z-0">
                                        +{cart.length - 3}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleWhatsAppOrder}
                                className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black py-4 rounded-[1.5rem] transition-all duration-300"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.7 17.7 69.1 27 106.2 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.6-2.8-23.5-8.7-44.8-27.7-16.6-14.8-27.8-33.1-31.1-38.6-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.6-9.2 1.9-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.5 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" /></svg>
                                WhatsApp
                            </button>
                            <button
                                onClick={handleUpiPayment}
                                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black py-4 rounded-[1.5rem] transition-all duration-300 shadow-lg shadow-blue-500/20"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                                Pay Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}

export default function MenuPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        }>
            <MenuPageContent />
        </Suspense>
    );
}
