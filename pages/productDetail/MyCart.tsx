"use client";

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { useCart, CartItem } from '../../context/cartContext'

interface MyCartProps {
    isOpen: boolean;
    onClose: () => void;
}

function MyCart({ isOpen, onClose }: MyCartProps) {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [animate, setAnimate] = useState(false);
    const { cartItems, updateQuantity, removeFromCart, removeMonogramFromCart } = useCart();

    const platformFee = 23;

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const timer = setTimeout(() => setAnimate(true), 10);
            return () => clearTimeout(timer);
        } else {
            setAnimate(false);
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!shouldRender) return null;

    const handleQuantityChange = async (cartId: number | string, currentQty: number, amount: number) => {
        const nextQty = currentQty + amount;
        if (nextQty > 0) {
            await updateQuantity(cartId, nextQty);
        }
    };

    const handleRemoveItem = async (cartId: number | string) => {
        await removeFromCart(cartId);
    };

    const totalMRP: number = (cartItems as CartItem[]).reduce((acc: number, item: CartItem) => {
        const isFabric = item.pro_type_name?.toLowerCase().includes('fabric');
        const lengthMultiplier = isFabric && item.selected_meter ? Number(item.selected_meter) : 1;
        const itemPrice = (item.price || 0) * lengthMultiplier;
        return acc + ((itemPrice + (item.monogram?.enabled ? item.monogram.extra_price : 0)) * item.quantity);
    }, 0);
    const totalAmount = totalMRP > 0 ? totalMRP + platformFee : 0;

    return (
        <div
            className={`fixed inset-0 z-100 flex justify-end bg-black/80 backdrop-blur-[2px] transition-opacity duration-300 ${
                animate ? 'opacity-100' : 'opacity-0'
            }`}
        >
            <div className="absolute inset-0 -z-10" onClick={onClose} />
            <div
                className={`w-full sm:w-112.5 lg:w-100 h-full bg-tertiary flex flex-col justify-between text-light transform transition-transform duration-300 ease-out ${
                    animate ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div 
                    className="flex flex-col flex-1 overflow-y-auto pt-6 px-6 pr-5"
                    style={{
                        scrollbarWidth: 'none',    
                        msOverflowStyle: 'none',         
                    }}
                >
                    <style>{`
                        div::-webkit-scrollbar {
                            display: none;               /* Chrome, Safari and Opera */
                        }
                    `}</style>
 
                    <div className="flex justify-between items-center pb-4 mb-6 shrink-0">
                        <h1 className="uppercase font-instrumentserif text-lg md:text-2xl text-light transform scale-y-150 origin-center select-none">
                            ( My Cart )
                        </h1>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex items-center gap-1 text-xs tracking-wider font-bold uppercase opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                        >
                            <span>Close</span>
                        </button>
                    </div>
 
                    <div className="flex flex-col gap-4 pb-6">
                        {cartItems.length === 0 ? (
                            <p className="text-sm text-light/50 text-center py-8 font-sans">Your cart is empty.</p>
                        ) : (
                            cartItems.map((item) => {
                                const variantLabel = item.is_custom 
                                    ? "Custom Size"
                                    : item.selected_meter 
                                    ? (item.pro_type_name?.toLowerCase().includes('towel')
                                        ? `Standard Size: ${item.selected_meter}`
                                        : `${item.selected_meter} Meter`)
                                    : item.selected_size 
                                    ? `Size: ${item.selected_size}` 
                                    : "";

                                const fitLabel = item.fit_style ? `Fit: ${item.fit_style}` : "";

                                return (
                                    <div key={item.cart_id} className="w-full flex gap-4 bg-primary rounded-xl p-4 items-center">
                                        
                                        <div className="w-25 h-34 bg-white rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                            <Image 
                                                src={item.pro_img || '/images/productview/olive-shirt.svg'} 
                                                alt={item.pro_name || 'Product Image'} 
                                                width={80} 
                                                height={96} 
                                                className="h-full w-auto object-cover"
                                            />
                                        </div>
 
                                        <div className="flex flex-col gap-1.5 flex-1 pr-6 relative">
                                            <button 
                                                onClick={() => handleRemoveItem(item.cart_id)}
                                                className="absolute top-2 right-0 text-red-500 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
 
                                            <h3 className="font-serif text-sm font-medium tracking-wide leading-tight max-w-[85%] text-light transform scale-y-150 mt-3">
                                                {item.pro_name}
                                            </h3>
                                            <div className="text-[10px] text-light/60 mt-2 space-y-0.5">
                                                {variantLabel && <p>{variantLabel}</p>}
                                                {fitLabel && <p>{fitLabel}</p>}
                                                
                                                {item.monogram?.enabled && (
                                                    <div className="mt-2 p-2 rounded-md bg-[#0A1633]/50 border border-[#D4AF37]/20 flex flex-col gap-1 text-[11px]">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-bold text-[#D4AF37] uppercase tracking-widest text-[9px]">
                                                                {item.monogram.type === 'upload' || item.monogram.upload_file ? "Custom Monogram" : "Monogram"}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                {!(item.monogram.type === 'upload' || item.monogram.upload_file) && (
                                                                    <Link 
                                                                        href={`/productdetailviewpage?id=${item.pro_id}&edit_cart_id=${item.cart_id}`}
                                                                        className="text-[9px] text-white/50 hover:text-white underline cursor-pointer"
                                                                    >
                                                                        Edit
                                                                    </Link>
                                                                )}
                                                                <button
                                                                    onClick={() => removeMonogramFromCart(item.cart_id)}
                                                                    className="text-[9px] text-red-400 hover:text-red-300 underline cursor-pointer"
                                                                    title="Remove Monogram"
                                                                >
                                                                    Remove Monogram
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {item.monogram.type === 'upload' || item.monogram.upload_file ? (
                                                            <>
                                                                <span className="text-white font-mono text-[10px] truncate max-w-[180px]">
                                                                    {item.monogram.file_name || item.monogram.upload_file?.split('/').pop() || 'logo.pdf'}
                                                                </span>
                                                                <div className="flex justify-between items-center mt-0.5">
                                                                    <span className="text-[#D4AF37] font-semibold">+₹{item.monogram.extra_price}</span>
                                                                    {item.monogram.upload_file && (
                                                                        <a
                                                                            href={item.monogram.upload_file.startsWith('http') ? item.monogram.upload_file : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${item.monogram.upload_file}`}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="text-[9px] text-[#D4AF37] hover:underline font-medium"
                                                                        >
                                                                            View File
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="text-white">Text: <span className="tracking-widest">{item.monogram.text}</span></span>
                                                                <span>Placement: {item.monogram.placement_name}</span>
                                                                <span>Color: {item.monogram.color_name} | Font: {item.monogram.font_name}</span>
                                                                <span className="text-[#D4AF37] font-semibold">+₹{item.monogram.extra_price}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center justify-between mt-1 pt-1">
                                                <div className="flex items-center border border-light/20 rounded-md bg-bg-blue text-xs overflow-hidden">
                                                    <button 
                                                        onClick={() => handleQuantityChange(item.cart_id, item.quantity, -1)}
                                                        className="px-2.5 py-1 hover:bg-black/4 transition-colors font-bold cursor-pointer"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="px-2 font-semibold min-w-4 text-center">{item.quantity}</span>
                                                    <button 
                                                        onClick={() => handleQuantityChange(item.cart_id, item.quantity, 1)}
                                                        className="px-2.5 py-1 hover:bg-black/4 transition-colors font-bold cursor-pointer"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <span className="text-xs font-semibold text-brown flex flex-col items-end gap-0.5">
                                                    <span>Rs. {((item.price || 0) * (item.pro_type_name?.toLowerCase().includes('fabric') && item.selected_meter ? Number(item.selected_meter) : 1)) + (item.monogram?.enabled ? Number(item.monogram.extra_price || 0) : 0)}/-</span>
                                                    {item.pro_type_name?.toLowerCase().includes('fabric') && item.selected_meter && (
                                                        <span className="text-[10px] text-light/50 font-normal">
                                                            (Rs. {item.price} / Meter)
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
 
                <div className="p-6 border-t-2 border-bg-light-blue shrink-0 bg-tertiary">
                    <div className="flex flex-col gap-2 text-xs font-medium text-light/70 mb-5">
                        <div className="flex justify-between">
                            <span>Total MRP</span>
                            <span>Rs. {totalMRP}/-</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Platform Fee</span>
                            <span>Rs. {platformFee}.00/-</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-brown pt-1">
                            <span>Total Amount</span>
                            <span>Rs. {totalAmount}/-</span>
                        </div>
                    </div>
 
                    <Link 
                        href="/order-summary"
                        onClick={onClose}
                        className="w-full block text-center bg-bg-blue hover:bg-bg-blue/90 text-light py-3.5 font-bold uppercase tracking-wider text-xs rounded-md transition-colors shadow-sm cursor-pointer"
                    >
                        Proceed To Checkout
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default MyCart;
