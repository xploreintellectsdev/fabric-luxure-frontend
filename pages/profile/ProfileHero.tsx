"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import EditProfileModal from './EditProfileModal'
import EditAddressModal, { Address } from './EditAddressModal'
import { Pencil, ArrowUpRight, Trash2 } from 'lucide-react'


function ProfileHero() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
    const [selectedEditAddress, setSelectedEditAddress] = useState<Address | null>(null)

    // Dynamic Address state initialized as empty
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(true);

    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    const fetchRecentOrders = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            const res = await fetch(`${backendUrl}/api/orders/user`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                const list = Array.isArray(data) ? data : data.data || [];
                const flattened = list.flatMap((order: any) => 
                    (order.products || []).map((prod: any) => ({
                        order_number: order.order_number,
                        name: prod.product_name,
                        image: prod.product_image,
                        type: prod.fit_style ? `Shirt (${prod.fit_style})` : "Linen Fabric"
                    }))
                ).slice(0, 4);
                setRecentOrders(flattened);
            }
        } catch (err) {
            console.error("❌ Failed to fetch user orders:", err);
        } finally {
            setLoadingOrders(false);
        }
    };

    const fetchAddresses = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            const res = await fetch(`${backendUrl}/api/address`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setAddresses(data.data || []);
            }
        } catch (err) {
            console.error("❌ Failed to fetch user addresses:", err);
        } finally {
            setLoadingAddresses(false);
        }
    };

    const fetchProfile = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/signin");
            return;
        }

        try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            const res = await fetch(`${backendUrl}/api/auth/profile`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!res.ok) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.dispatchEvent(new Event("auth-change"));
                router.push("/signin");
                return;
            }

            const data = await res.json();
            setUser(data.data);
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
            const cachedUser = localStorage.getItem("user");
            if (cachedUser) {
                setUser(JSON.parse(cachedUser));
            } else {
                router.push("/signin");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchAddresses();
        fetchRecentOrders();
    }, [router]);

    // Handle saving (add or update) an address to database
    const handleSaveAddress = async (savedAddr: Address) => {
        const token = localStorage.getItem("token");
        if (!token) return;
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        // If this is the user's first address, automatically make isDefault = true
        const isFirst = addresses.length === 0;
        const finalIsDefault = savedAddr.isDefault || isFirst;

        const isEdit = savedAddr.addressId !== undefined && savedAddr.addressId !== null;

        try {
            const url = isEdit 
                ? `${backendUrl}/api/address/${savedAddr.addressId}`
                : `${backendUrl}/api/address`;
            
            const method = isEdit ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...savedAddr,
                    isDefault: finalIsDefault
                })
            });
            
            if (res.ok) {
                await fetchAddresses();
            } else {
                const errData = await res.json();
                console.error("❌ Failed to save address:", errData.error);
            }
        } catch (err) {
            console.error("❌ Error saving address:", err);
        }
    }

    // Handle deleting an address from database
    const handleDeleteAddress = async (addressId: string | number) => {
        const token = localStorage.getItem("token");
        if (!token) return;
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        
        try {
            const res = await fetch(`${backendUrl}/api/address/${addressId}`, {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (res.ok) {
                await fetchAddresses();
            } else {
                const errData = await res.json();
                console.error("❌ Failed to delete address:", errData.error);
            }
        } catch (err) {
            console.error("❌ Error deleting address:", err);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-tertiary flex items-center justify-center text-light font-mono text-sm">
                Loading profile...
            </div>
        );
    }

    return (
        <section className='bg-tertiary px-6 sm:px-12 lg:px-16 py-16 md:py-20 w-full flex justify-center overflow-hidden border-t border-[#E0D9CF]/10'>
            <div className='w-full mx-auto'>

                {/* Breadcrumbs */}
                <div className="text-xs uppercase font-mono tracking-wider text-Pinball/70 mb-10 text-left">
                    <Link href="/" className="hover:text-light transition-colors">Home</Link>
                    <span> &gt; profile</span>
                </div>

                {/* Header Title Block */}
                <div className='text-center mb-16'>
                    <h1 className="font-instrumentserif text-3xl sm:text-4xl lg:text-5xl font-medium text-light leading-[1.1] uppercase transform scale-y-130 tracking-tighter origin-center">
                        A Personalized VL Global Experience
                    </h1>
                    <p className='text-sm text-Pinball font-normal leading-relaxed mt-6 max-w-xl mx-auto'>
                        Access your orders and account settings designed to make <br className="hidden sm:block" /> every shopping experience seamless.
                    </p>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">

                    {/* LEFT COLUMN: Profile Info & Addresses */}
                    <div className="lg:col-span-4 flex flex-col gap-6 w-full">

                        {/* Profile Info Card */}
                        <div className="bg-primary border border-white/5 p-6 rounded-xl">
                            <div className='flex justify-between items-center mb-6'>
                                <h2 className='uppercase font-instrumentserif text-2xl text-light leading-[1.1] transform scale-y-140 origin-left'>Profile Info</h2>
                                <div className="flex gap-4">
                                    <button className='text-bg-blue flex items-center underline gap-1 text-xs font-medium cursor-pointer hover:opacity-80' onClick={() => setIsEditModalOpen(true)}>
                                        Edit <Pencil size={13} />
                                    </button>
                                    <button 
                                        className='text-red-400 flex items-center underline gap-1 text-xs font-medium cursor-pointer hover:opacity-80' 
                                        onClick={() => {
                                            localStorage.removeItem("token");
                                            localStorage.removeItem("user");
                                            window.dispatchEvent(new Event("auth-change"));
                                            router.push("/");
                                        }}
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 text-base">
                                <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center items-start gap-1 sm:gap-0 border-b border-white/5 pb-2'>
                                    <span className="text-light">Full Name</span>
                                    <span className='text-Pinball font-medium'>
                                        {user ? (user.name || "Unknown User") : "Rahul Sharma"}
                                    </span>
                                </div>
                                <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center items-start gap-1 sm:gap-0 border-b border-white/5 pb-2'>
                                    <span className="text-light">Phone Number</span>
                                    <span className='text-Pinball font-medium'>
                                        {user ? user.mobile : "+91 12345 78906"}
                                    </span>
                                </div>
                                <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center items-start gap-1 sm:gap-0'>
                                    <span className="text-light">Email</span>
                                    <span className='text-Pinball font-medium break-all'>
                                        {user ? user.email : "rahul@mail.com"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Saved Addresses Submodule */}
                        <div className="bg-primary border border-white/5 p-6 rounded-xl">
                            <h2 className='uppercase font-instrumentserif text-2xl text-light leading-[1.1] transform scale-y-140 origin-left text-left mb-6'>Saved Address</h2>

                            <div className="flex flex-col gap-5">
                                {loadingAddresses ? (
                                    <p className="text-xs text-Pinball/50 italic py-4">Loading saved addresses...</p>
                               ) : addresses.length === 0 ? (
                                    <p className="text-xs text-Pinball/50 italic py-4">No saved addresses.</p>
                                ) : (
                                    addresses.map((addr) => {
                                        const typeIcon = addr.addressType === 'Home' ? '🏠' : addr.addressType === 'Office' ? '💼' : '📍';
                                        return (
                                            <div
                                                key={addr.addressId}
                                                className="flex flex-col border border-white/10 rounded-xl p-4 bg-[#07122a] text-left relative transition-all"
                                            >
                                                {/* Header Section */}
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-semibold text-light flex items-center gap-1.5 select-none">
                                                        {typeIcon} {addr.addressType} {addr.isDefault && <span className="text-[9px] bg-bg-blue/20 text-bg-blue border border-bg-blue/30 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-mono">Default</span>}
                                                    </span>
                                                </div>

                                                {/* Details Section */}
                                                <div className="space-y-1 text-sm text-Pinball leading-relaxed">
                                                    <p className="font-semibold text-light text-base">{addr.fullName}</p>
                                                    <p className="font-mono">{addr.mobile}</p>
                                                    {addr.alternateMobile && <p className="font-mono text-xs text-Pinball/60">Alt: {addr.alternateMobile}</p>}
                                                    <p>{addr.houseBuilding}</p>
                                                    <p>{addr.streetLocality}</p>
                                                    {addr.landmark && <p className="text-xs text-Pinball/75">Landmark: {addr.landmark}</p>}
                                                    <p>{addr.city}, {addr.state} - {addr.postalCode}</p>
                                                    <p className="text-xs text-Pinball/50">{addr.country}</p>
                                                </div>

                                                {/* Actions Footer */}
                                                <div className="flex gap-4 border-t border-white/5 mt-3 pt-2.5 justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedEditAddress(addr)
                                                            setIsAddressModalOpen(true)
                                                        }}
                                                        className="text-bg-blue flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider hover:opacity-85"
                                                    >
                                                        Edit <Pencil size={11} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (addr.addressId !== undefined) {
                                                                handleDeleteAddress(addr.addressId);
                                                            }
                                                        }}
                                                        className="text-red-400 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider hover:text-red-300"
                                                    >
                                                        Delete <Trash2 size={11} />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}

                                {/* Add New Address Trigger */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedEditAddress(null)
                                        setIsAddressModalOpen(true)
                                    }}
                                    className="relative w-full py-6 rounded-lg text-xs font-medium text-bg-blue uppercase tracking-wider bg-bg-light-blue hover:bg-bg-light-blue/5 transition-colors cursor-pointer mt-2 overflow-hidden border-none"
                                >
                                    <svg
                                        className="absolute inset-0 w-full h-full pointer-events-none"
                                        preserveAspectRatio="none"
                                    >
                                        <rect
                                            x="1"
                                            y="1"
                                            width="calc(100% - 2px)"
                                            height="calc(100% - 2px)"
                                            rx="8"
                                            ry="8"
                                            fill="none"
                                            stroke="#4B6EBD"
                                            strokeWidth="1"
                                            strokeDasharray="12 8"
                                        />
                                    </svg>

                                    <span className="relative z-10 font-bold">+ Add New Address</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* MID COLUMN: Orders */}
                    <div className="lg:col-span-4 w-full bg-primary border border-white/5 p-6 rounded-xl">
                        <div className="flex justify-between items-baseline mb-6">
                            <h2 className='uppercase font-instrumentserif text-2xl text-light leading-[1.1] transform scale-y-140 origin-left'>Your Orders</h2>
                            <Link href="/profile/your-orders">
                                <span className="text-sm text-light underline uppercase tracking-wider font-medium cursor-pointer hover:text-bg-blue">View All</span>
                            </Link>
                        </div>

                        <div className="flex flex-col">
                            {loadingOrders ? (
                                <p className="text-xs text-Pinball/50 italic py-4 text-center">Loading recent orders...</p>
                            ) : recentOrders.length === 0 ? (
                                <p className="text-xs text-Pinball/50 italic py-4 text-center">No orders placed yet.</p>
                            ) : (
                                recentOrders.map((item, idx) => (
                                    <Link
                                        href={`/profile/orders/${item.order_number}`}
                                        key={idx}
                                        className="flex items-center gap-4 py-3 border-b last:border-0 border-white/5 group cursor-pointer"
                                    >
                                        <div className="relative w-12 h-14 bg-[#FAF0E4]/10 rounded-md shrink-0">
                                            <Image
                                                src={item.image?.startsWith("/uploads") ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${item.image}` : (item.image || "/images/profile/profile-img.webp")}
                                                alt="product showcase"
                                                fill
                                                className="object-cover rounded-md"
                                                unoptimized
                                            />
                                        </div>
                                        <div className="grow text-left">
                                            <p className="text-sm font-medium text-light group-hover:text-bg-blue transition-colors leading-snug truncate max-w-[180px]">{item.name}</p>
                                            <span className="text-xs text-Pinball tracking-wider font-mono">{item.type}</span>
                                        </div>
                                        <span className="text-light/40 group-hover:text-light transform group-hover:translate-x-0.5 transition-all text-sm font-mono">&gt;</span>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Editorial Banner */}
                    <div className="lg:col-span-4 w-full flex flex-col items-center">
                        <div className="relative w-full h-[680px] rounded-xl overflow-hidden shadow-sm group border border-white/5">
                            <Image
                                src="/images/profile/profile-img.webp"
                                alt="VL Global Heritage Collection editorial"
                                fill
                                className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                            <div className='absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%]'>
                                <Link href="/shop">
                                    <button type='button' className='w-full bg-bg-blue/90 text-light py-3.5 px-4 text-xs font-semibold tracking-widest uppercase rounded-md shadow-lg hover:bg-bg-blue transition-colors flex items-center justify-center gap-2 cursor-pointer border-none'>
                                        continue shopping
                                        <ArrowUpRight size={14} />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
                onUpdateSuccess={fetchProfile}
            />
            <EditAddressModal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                onSave={handleSaveAddress}
                initialAddress={selectedEditAddress}
            />
        </section>
    )
}

export default ProfileHero

