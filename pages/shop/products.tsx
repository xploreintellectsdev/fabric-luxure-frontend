"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { ArrowUpRight, Heart, ShoppingCart, X } from 'lucide-react'
import Link from 'next/link'
import { useWishlist } from '../../context/wishlistContext'
import { useCart } from '../../context/cartContext'
import QuickAddModal from '../../components/QuickAddModal'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface ProductItem {
    id?: number;
    imgUrl: string;
    title?: string;
    price?: string;
    desc?: string;
    product_type_name?: string;
    productTypeId?: number;
    standard_size?: string;
    stock_quantity?: number;
  stitching_price?: number;
}

function Products(props: { list?: ProductItem[], className?: string }) {
    const combinedList = props.list || []
    const { isWishlisted, toggleWishlist } = useWishlist()
    const { addToCart } = useCart()

    // Selection popup states
    const [activeItem, setActiveItem] = useState<ProductItem | null>(null);
    const [showQuickAddPopup, setShowQuickAddPopup] = useState(false);

    const handleAddToCartClick = async (item: ProductItem) => {
        setActiveItem(item);
        console.log("DEBUG: products.tsx handleAddToCartClick:", item);
        const pType = (item.product_type_name || "").toLowerCase();
        const isTowel = pType === "towel" || pType === "towels" || item.title?.toLowerCase().includes("towel");

        if (isTowel) {
            // Directly add towel to cart with standard size
            const rawPriceStr = (item.price || "").replace(/[^0-9]/g, '');
            const numericPrice = parseInt(rawPriceStr, 10) || 0;

            await addToCart({
                pro_id: Number(item.id),
                quantity: 1,
                selected_meter: item.standard_size || null,
                is_custom: 0,
                pro_name: item.title,
                price: numericPrice,
                pro_img: item.imgUrl,
                cover_description: item.desc,
                pro_type_name: item.product_type_name,
      stitching_price: item.stitching_price
            });
            setActiveItem(null);
        } else {
            setShowQuickAddPopup(true);
        }
    };

    const mappedActiveItem = activeItem ? {
        pro_id: Number(activeItem.id),
        pro_name: activeItem.title || "",
        price: parseInt((activeItem.price || "").replace(/[^0-9]/g, ''), 10) || 0,
        pro_img: activeItem.imgUrl,
        cover_description: activeItem.desc,
        product_type_name: activeItem.product_type_name,
        productTypeId: activeItem.productTypeId,
        standard_size: activeItem.standard_size
    } : null;


    return (
        <div className={props.className || "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-8 px-4 sm:px-8 lg:px-16 mx-auto w-full"}>
            {combinedList.map((item, i) => {
                const wishlisted = isWishlisted(Number(item.id));
                return (
                    <div key={i} className="group block relative h-full">
                        <Link href={`/productdetailviewpage?id=${item.id || 1}`} className="block h-full">
                            <div
                                className="bg-bg-light-blue hover:bg-primary rounded-md overflow-hidden shadow-sm hover:shadow-xl border border-transparent hover:border-light/10 transition-all duration-300 ease-in-out cursor-pointer flex flex-col h-full"
                            >
                                <div className="relative aspect-square w-full bg-primary overflow-hidden shrink-0">
                                    {(item.stock_quantity === 0) && (
                                        <div className="absolute top-3 left-3 z-10 bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-md border border-red-500/50">
                                            Out of Stock
                                        </div>
                                    )}
                                    <Image
                                        src={item.imgUrl}
                                        alt={item.title || "product image"}
                                        fill
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                                        unoptimized
                                    />
                                </div>

                                <div className="p-5 flex flex-col justify-between flex-1 gap-5">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-[#F8F4EC] font-semibold text-sm sm:text-base tracking-wide uppercase text-left transition-colors duration-300 leading-[1.3] line-clamp-2 max-w-[85%]">
                                                {item.title}
                                            </h3>
                                            <ArrowUpRight className="w-4 h-4 text-light/50 group-hover:text-[#E6C068] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 shrink-0 mt-0.5" />
                                        </div>
                                        
                                        {/* Stock Badges */}
                                        {(item.stock_quantity !== undefined && item.stock_quantity !== null && item.stock_quantity > 0 && item.stock_quantity <= 10) && (
                                            <div className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full w-max ${item.stock_quantity <= 5 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                                                {item.stock_quantity <= 5 ? `Hurry! Only ${item.stock_quantity} left` : `Only ${item.stock_quantity} left`}
                                            </div>
                                        )}

                                        <p className="text-[#C7CFDD] font-normal text-sm sm:text-base text-left line-clamp-2 sm:line-clamp-3 leading-relaxed overflow-hidden">
                                            {item.desc}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-light/5 mt-auto">
                                        <span className="text-base sm:text-lg font-bold tracking-wider text-[#E6C068] select-none">
                                            {item.price}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <button
                                                className={`p-1.5 border rounded-md transition-all duration-200 cursor-pointer ${
                                                    wishlisted
                                                        ? 'bg-red-500 border-transparent text-light'
                                                        : 'border-[#D7DCE8] text-[#D7DCE8] hover:border-[#E6C068] hover:text-[#E6C068]'
                                                }`}
                                                aria-label={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    toggleWishlist(Number(item.id));
                                                }}
                                            >
                                                <Heart
                                                    className="w-4 h-4"
                                                    fill={wishlisted ? "currentColor" : "none"}
                                                />
                                            </button>
                                            
                                            <button
                                                className={`p-1.5 border rounded-md transition-all duration-200 ${item.stock_quantity === 0 ? 'border-light/5 text-light/20 cursor-not-allowed bg-transparent' : 'border-[#D7DCE8] text-[#D7DCE8] hover:border-[#E6C068] hover:text-[#E6C068] cursor-pointer'}`}
                                                aria-label="Add to Cart"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    if (item.stock_quantity === 0) {
                                                        const toast = document.createElement('div');
                                                        toast.className = 'fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-md shadow-lg z-50 animate-bounce text-sm font-semibold tracking-wide';
                                                        toast.innerText = 'Product is currently out of stock.';
                                                        document.body.appendChild(toast);
                                                        setTimeout(() => document.body.removeChild(toast), 3000);
                                                        return;
                                                    }
                                                    handleAddToCartClick(item);
                                                }}
                                                disabled={item.stock_quantity === 0}
                                            >
                                                <ShoppingCart className="w-4 h-4 stroke-[1.5]" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                )
            })}

            <QuickAddModal 
                isOpen={showQuickAddPopup}
                onClose={() => { setShowQuickAddPopup(false); setActiveItem(null); }}
                product={mappedActiveItem as any}
            />


        </div>
    )
}

export default Products
