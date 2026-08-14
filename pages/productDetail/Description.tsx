"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

interface ProductDescription {
  id: number;
  pro_id: number;
  title: string | null;
  text: string;
  number: number;
}

interface Product {
  pro_id: number;
  cat_id: number;
  pro_name: string;
  price: number;
  pro_img: string;
  cover_description?: string;
  category_name: string;
  product_type_name: string;
  additionalImages?: string[];
  descriptions?: ProductDescription[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const resolveImageUrl = (img: string) => {
  if (!img) return "";
  if (img.startsWith("/uploads")) {
    return `${API_URL}${img}`;
  }
  return img;
};

function Description() {
  const searchParams = useSearchParams();
  const productIdStr = searchParams ? (searchParams.get('id') || '1') : '1';
  const currentId = parseInt(productIdStr, 10) || 1;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/${currentId}`);
        const resData = await res.json();
        if (res.ok && resData.success) {
          setProduct(resData.data);
        }
      } catch (err) {
        console.error("Failed to load product description cards:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [currentId]);

  if (loading) {
    return (
      <div className="bg-primary md:py-24 px-6 sm:px-12 lg:px-16 py-16 w-full flex flex-col items-center justify-center overflow-hidden font-sans text-light min-h-[400px]">
        <div className="text-light/60 font-sans text-sm animate-pulse tracking-widest uppercase">
          Loading Descriptions...
        </div>
      </div>
    );
  }

  if (!product) {
    return null; // Skip rendering if no product data is loaded
  }

  const descList = product.descriptions || [];
  const block1 = descList[0] || null;
  const block2 = descList[1] || null;
  const block3 = descList[2] || null;
  const finalDesc = descList.length > 3 ? descList[descList.length - 1] : null;

  const galleryImages = [
    product.pro_img,
    ...(product.additionalImages || [])
  ].filter(Boolean).slice(0, 5);

  return (
    <div className="bg-primary md:py-24 px-6 sm:px-12 lg:px-16 py-16 w-full flex flex-col items-center justify-center overflow-hidden font-sans text-light">
      <div className="w-full flex flex-col">
        <h2 className="uppercase font-instrumentserif text-lg md:text-2xl lg:text-2xl text-light leading-[1.1] transform scale-y-150 origin-center">
          ( Description )
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-10 gap-6 w-full items-stretch my-6">
          <div className="md:col-span-6 relative aspect-video md:aspect-auto md:h-80 rounded-xl overflow-hidden bg-light/5">
            {galleryImages[0] && (
              <Image
                src={resolveImageUrl(galleryImages[0])}
                alt="Large Image"
                fill
                className="object-cover object-center"
                priority
                unoptimized
              />
            )}
          </div>
          <div className="md:col-span-4 bg-bg-light-blue rounded-xl overflow-hidden flex flex-col justify-between h-80">
            {block1 && (
              <div className="p-6">
                <h3 className="font-medium text-lg md:text-xl tracking-tight text-light mb-2">
                  {block1.title}
                </h3>
                <p className="text-sm text-Pinball leading-relaxed font-light">
                  {block1.text}
                </p>
              </div>
            )}
            {galleryImages[1] && (
              <div className="relative w-full h-35 mt-auto bg-light/5">
                <Image
                  src={resolveImageUrl(galleryImages[1])}
                  alt={block1?.title || "Top Right Image"}
                  fill
                  className="object-cover object-center"
                  unoptimized
                />
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-stretch">
          <div className="bg-bg-light-blue rounded-xl overflow-hidden flex flex-col justify-between min-h-105">
            {block2 && (
              <div className="p-6">
                <h3 className="font-medium text-lg md:text-xl tracking-tight text-light mb-2">
                  {block2.title}
                </h3>
                <p className="text-sm text-Pinball leading-relaxed font-light">
                  {block2.text}
                </p>
              </div>
            )}
            {galleryImages[2] && (
              <div className="relative w-full h-65 mt-auto bg-light/5">
                <Image
                  src={resolveImageUrl(galleryImages[2])}
                  alt={block2?.title || "Bottom Left Image"}
                  fill
                  className="object-cover object-center"
                  unoptimized
                />
              </div>
            )}
          </div>
          <div className="relative min-h-105 rounded-xl overflow-hidden bg-light/5">
            {galleryImages[3] && (
              <Image
                src={resolveImageUrl(galleryImages[3])}
                alt="Bottom Center Image"
                fill
                className="object-cover object-center"
                unoptimized
              />
            )}
          </div>
          <div className="bg-bg-light-blue rounded-xl overflow-hidden flex flex-col justify-between min-h-105">
            {block3 && (
              <div className="p-6">
                <h3 className="font-medium text-lg md:text-xl tracking-tight text-light mb-2">
                  {block3.title}
                </h3>
                <p className="text-sm text-Pinball leading-relaxed font-light">
                  {block3.text}
                </p>
              </div>
            )}
            {galleryImages[4] && (
              <div className="relative w-full h-65 mt-auto bg-light/5">
                <Image
                  src={resolveImageUrl(galleryImages[4])}
                  alt={block3?.title || "Bottom Right Image"}
                  fill
                  className="object-cover object-center"
                  unoptimized
                />
              </div>
            )}
          </div>
        </div>
        {finalDesc && (
          <div className="mt-12 w-full text-justify">
            <p className="text-sm sm:text-base text-Pinball font-light leading-relaxed">
              {finalDesc.text}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Description
