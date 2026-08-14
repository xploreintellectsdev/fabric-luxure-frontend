"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Products from '../../../pages/shop/products';
import { X, Search } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const resolveImageUrl = (img: string) => {
    if (!img) return "/images/shop/category.webp";
    if (img.startsWith("/uploads")) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? `http://${window.location.hostname}:5000` : "http://localhost:5000");
        return `${baseUrl}${img}`;
    }
    return img;
};

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarData, setSidebarData] = useState<any>(null);

  useEffect(() => {
    // Fetch master filters data once to map IDs to names for the active chips
    const fetchSidebarData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/search/sidebar`);
        const data = await res.json();
        if (data.success) {
          setSidebarData(data.data);
        }
      } catch (err) {
        console.error("Failed to load sidebar data for search filters", err);
      }
    };
    fetchSidebarData();
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchParams) return;
      setLoading(true);
      try {
        const query = searchParams.toString();
        const res = await fetch(`${API_URL}/api/products/search?${query}`);
        const data = await res.json();
        if (data.success) {
          const mappedProds = (data.data || []).map((p: any) => ({
              id: p.pro_id,
              categoryId: p.cat_id,
              productTypeId: p.pro_type_id,
              title: p.pro_name,
              imgUrl: resolveImageUrl(p.pro_img),
              price: `Rs. ${p.price}/-`,
              desc: p.cover_description || "",
              product_type_name: p.product_type_name
          }));
          setProducts(mappedProds);
        }
      } catch (err) {
        console.error("Failed to fetch search results", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchParams]);

  // Build active filter chips based on URL search params and sidebarData
  const activeFilters: { key: string; value: string; label: string }[] = [];
  
  if (searchParams && sidebarData) {
    searchParams.forEach((value, key) => {
      if (key === 'search' && value.trim()) {
        activeFilters.push({ key, value, label: `Search: "${value}"` });
      } else if (key === 'category') {
        const cat = sidebarData.categories?.find((c: any) => String(c.id) === value);
        if (cat) activeFilters.push({ key, value, label: cat.name });
      } else if (key === 'productType') {
        const pt = sidebarData.productTypes?.find((p: any) => String(p.id) === value);
        if (pt) activeFilters.push({ key, value, label: pt.name });
      } else if (key === 'fabric') {
        const f = sidebarData.filters?.fabricTypes?.find((x: any) => String(x.id) === value);
        if (f) activeFilters.push({ key, value, label: f.name });
      } else if (key === 'origin') {
        const o = sidebarData.filters?.origins?.find((x: any) => String(x.id) === value);
        if (o) activeFilters.push({ key, value, label: o.name });
      } else if (key === 'style') {
        const s = sidebarData.filters?.styles?.find((x: any) => String(x.id) === value);
        if (s) activeFilters.push({ key, value, label: s.name });
      } else if (key === 'weave') {
        const w = sidebarData.filters?.weaves?.find((x: any) => String(x.id) === value);
        if (w) activeFilters.push({ key, value, label: w.name });
      } else if (key === 'color') {
        const c = sidebarData.filters?.colors?.find((x: any) => String(x.id) === value);
        if (c) activeFilters.push({ key, value, label: c.name });
      } else if (key === 'pattern') {
        const p = sidebarData.filters?.patterns?.find((x: any) => String(x.id) === value);
        if (p) activeFilters.push({ key, value, label: p.name });
      }
    });
  }

  const removeFilter = (keyToRemove: string, valueToRemove: string) => {
    if (!searchParams) return;
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.delete(keyToRemove);
    router.push(`/search?${current.toString()}`);
  };

  return (
    <div className="bg-[#081529] min-h-screen text-white pt-28 pb-20 px-6 md:px-12 lg:px-20">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-4xl md:text-5xl font-instrumentserif tracking-wider text-[#A37646] mb-4 uppercase">
          Search Results
        </h1>
        
        {/* Active Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-10 min-h-[40px]">
          {activeFilters.map((filter, idx) => (
            <div 
              key={`${filter.key}-${idx}`}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300"
            >
              <span>{filter.label}</span>
              <button 
                onClick={() => removeFilter(filter.key, filter.value)}
                className="w-5 h-5 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {activeFilters.length > 0 && (
             <button 
                onClick={() => router.push('/search')}
                className="text-xs uppercase tracking-widest text-gray-500 hover:text-[#D4AF37] transition-colors ml-2"
              >
                Clear All
             </button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="space-y-4">
                <div className="w-full aspect-[3/4] bg-white/5 rounded-xl"></div>
                <div className="h-4 w-3/4 bg-white/5 rounded"></div>
                <div className="h-4 w-1/2 bg-white/5 rounded"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <p className="text-sm uppercase tracking-widest text-gray-400 mb-8">Showing {products.length} Products</p>
            <Products list={products} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_30px_rgba(163,118,70,0.1)]">
              <Search className="text-[#A37646]" size={32} />
            </div>
            <h3 className="text-2xl font-instrumentserif tracking-wider text-white mb-3 uppercase">No products found</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              We couldn't find any products matching your current filters. Try removing some filters or adjusting your search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#081529] flex items-center justify-center text-[#A37646] font-instrumentserif text-2xl uppercase tracking-widest animate-pulse">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
