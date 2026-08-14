"use client"
import React, { Suspense, useState, useEffect } from 'react'
import Products from '../../pages/shop/products';
import { useSearchParams } from 'next/navigation';

interface ProductItem {
    id: number;
    productTypeId: number;
    title: string;
    imgUrl: string;
    price: string;
    desc: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const resolveImageUrl = (img: string) => {
  if (!img) return "/images/home/cat-01.webp";
  if (img.startsWith("/uploads")) {
    return `${API_URL}${img}`;
  }
  return img;
};

function SimilarProductsContent() {
    const searchParams = useSearchParams();
    const productIdStr = searchParams ? (searchParams.get('id') || '1') : '1';
    const currentId = parseInt(productIdStr, 10) || 1;

    const [products, setProducts] = useState<ProductItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${API_URL}/api/products`);
                const resData = await res.json();
                if (res.ok && resData.success) {
                    const mappedProds = (resData.data || []).map((p: any) => ({
                        id: p.pro_id,
                        productTypeId: p.product_type_name === "Shirts" || p.product_type_name === "Shirt" ? 1 : 2,
                        title: p.pro_name,
                        imgUrl: resolveImageUrl(p.pro_img),
                        price: `Rs. ${p.price}/-`,
                        desc: p.cover_description || ""
                    }));
                    setProducts(mappedProds);
                }
            } catch (err) {
                console.error("Failed to load similar products dynamic data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div className="bg-tertiary py-12 md:py-16 w-full flex flex-col items-center justify-center overflow-hidden">
                <div className="w-full flex flex-col px-6 sm:px-12 lg:px-16">
                    <h1 className="uppercase font-instrumentserif text-lg md:text-2xl lg:text-2xl text-light leading-[1.1] transform scale-y-150 origin-center">
                        Similar Products
                    </h1>
                </div>
                <div className="text-center text-light/50 py-10 font-sans text-sm animate-pulse">Loading Similar Products...</div>
            </div>
        );
    }

    if (products.length === 0) {
        return null;
    }

    // Find the currently viewed product
    const currentProduct = products.find(p => p.id === currentId) || products[0];

    // Filter products of the same productTypeId (Shirts = 1, Towels = 2)
    // Exclude the current product
    const similarProductsList = products.filter(p => 
        p.productTypeId === currentProduct.productTypeId && p.id !== currentProduct.id
    );

    // Limit to a maximum of 4 similar products
    const displayList = similarProductsList.slice(0, 4);

    return (
        <div className='bg-tertiary py-12 md:py-16 w-full flex flex-col items-center justify-center overflow-hidden'>
            <div className='w-full flex flex-col px-6 sm:px-12 lg:px-16'>
                <h1 className="uppercase font-instrumentserif text-lg md:text-2xl lg:text-2xl text-light leading-[1.1] transform scale-y-150 origin-center">
                    Similar Products
                </h1>
            </div>
            {displayList.length > 0 ? (
                <Products list={displayList} />
            ) : (
                <div className="text-center text-light/50 py-10 font-sans text-sm">No similar products found.</div>
            )}
        </div>
    );
}

function SimilarProducts() {
    return (
        <Suspense fallback={
            <div className="bg-tertiary py-12 md:py-16 w-full flex flex-col items-center justify-center overflow-hidden">
                <div className="w-full flex flex-col px-6 sm:px-12 lg:px-16">
                    <h1 className="uppercase font-instrumentserif text-lg md:text-2xl lg:text-2xl text-light/50 leading-[1.1] transform scale-y-150 origin-center">
                        Similar Products
                    </h1>
                </div>
                <div className="text-center text-light/50 py-10">Loading Similar Products...</div>
            </div>
        }>
            <SimilarProductsContent />
        </Suspense>
    );
}

export default SimilarProducts;
