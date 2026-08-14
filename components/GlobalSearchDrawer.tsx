"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, X, ChevronRight, Clock, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface GlobalSearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const resolveImageUrl = (img: string) => {
  if (!img) return "/images/shop/category.webp";
  if (img.startsWith("/uploads")) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? `http://${window.location.hostname}:5000` : "http://localhost:5000");
      return encodeURI(`${baseUrl}${img}`);
  }
  return encodeURI(img);
};


const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) return <>{text}</>;
  
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? <mark key={i} className="bg-transparent text-[#A37646] font-semibold">{part}</mark> : part
      )}
    </>
  );
};

export default function GlobalSearchDrawer({ isOpen, onClose }: GlobalSearchDrawerProps) {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [sidebarData, setSidebarData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [filteredProductTypes, setFilteredProductTypes] = useState<any[]>([]);
  
  const [isSearching, setIsSearching] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [navItems, setNavItems] = useState<{type: string, data: any, url: string}[]>([]);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load Recent Searches
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("fl_recent_searches");
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (e) {}
      }
    }
  }, []);

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const q = query.trim();
    let updated = [q, ...recentSearches.filter(s => s.toLowerCase() !== q.toLowerCase())];
    if (updated.length > 10) updated = updated.slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("fl_recent_searches", JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("fl_recent_searches");
  };

  // Fetch Sidebar Data
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch(`${API_URL}/api/search/sidebar`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSidebarData(data.data);
          }
        })
        .catch(err => console.error("Error fetching search sidebar data:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  // Handle Global Search (Debounced)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    setSelectedIndex(-1); // reset selection
    
    if (searchQuery.trim().length > 0) {
      setIsSearching(true);
      
      // Local filtering for categories and product types
      const queryLower = searchQuery.trim().toLowerCase();
      if (sidebarData) {
        const matchingCats = (sidebarData.categories || [])
          .filter((c: any) => c.name.toLowerCase().includes(queryLower))
          .slice(0, 3);
        const matchingTypes = (sidebarData.productTypes || [])
          .filter((pt: any) => pt.name.toLowerCase().includes(queryLower))
          .slice(0, 3);
          
        setFilteredCategories(matchingCats);
        setFilteredProductTypes(matchingTypes);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        fetch(`${API_URL}/api/search?q=${encodeURIComponent(searchQuery)}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setSuggestions(data.data.slice(0, 5)); // Limit to 5 products
            }
          })
          .catch(err => console.error("Error fetching search suggestions:", err))
          .finally(() => setIsSearching(false));
      }, 300);
    } else {
      setSuggestions([]);
      setFilteredCategories([]);
      setFilteredProductTypes([]);
      setIsSearching(false);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, sidebarData]);

  // Build NavItems for Keyboard Navigation
  useEffect(() => {
    const items: {type: string, data: any, url: string}[] = [];
    if (searchQuery.trim().length > 0 && !isSearching) {
      filteredCategories.forEach(c => items.push({ type: 'category', data: c, url: `/search?category=${c.id}` }));
      filteredProductTypes.forEach(pt => items.push({ type: 'productType', data: pt, url: `/search?productType=${pt.id}` }));
      suggestions.forEach(p => items.push({ type: 'product', data: p, url: `/product/${p.id}` }));
      if (items.length > 0) {
        items.push({ type: 'viewAll', data: null, url: `/search?search=${encodeURIComponent(searchQuery.trim())}` });
      }
    }
    setNavItems(items);
  }, [filteredCategories, filteredProductTypes, suggestions, searchQuery, isSearching]);

  // Keybindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      
      if (searchQuery.trim().length > 0 && navItems.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => (prev < navItems.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : navItems.length - 1));
        } else if (e.key === 'Enter') {
          if (selectedIndex >= 0 && selectedIndex < navItems.length) {
            e.preventDefault();
            const selected = navItems[selectedIndex];
            router.push(selected.url);
            saveRecentSearch(searchQuery);
            onClose();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, navItems, selectedIndex, searchQuery, router]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Auto focus logic handled by input autoFocus
    } else {
      document.body.style.overflow = '';
      // Reset state on close
      setSearchQuery("");
      setShowAllProducts(false);
      setSelectedIndex(-1);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?search=${encodeURIComponent(searchQuery.trim())}`);
      saveRecentSearch(searchQuery);
      onClose();
    }
  };
  
  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
    // Let the effect fetch the suggestions
  };

  const executeNavUrl = (url: string) => {
    if (searchQuery.trim()) saveRecentSearch(searchQuery);
    router.push(url);
    onClose();
  };

  if (!isOpen) return null;

  const displayProducts = showAllProducts ? sidebarData?.products : sidebarData?.products?.slice(0, 10);
  const hasResults = suggestions.length > 0 || filteredCategories.length > 0 || filteredProductTypes.length > 0;

  // Render Skeleton
  const renderSkeleton = () => (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-3 w-24 bg-white/10 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-6 w-full max-w-[200px] bg-white/5 rounded"></div>
          <div className="h-6 w-full max-w-[150px] bg-white/5 rounded"></div>
        </div>
      </div>
      <div>
        <div className="h-3 w-32 bg-white/10 rounded mb-4"></div>
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-white/5 rounded shrink-0"></div>
              <div className="space-y-2 w-full">
                <div className="h-4 w-3/4 bg-white/5 rounded"></div>
                <div className="h-3 w-1/2 bg-white/5 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  let itemIndex = 0; // To track global index for highlighting

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity animate-in fade-in"
        onClick={onClose}
      />
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(163, 118, 70, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(163, 118, 70, 0.8);
        }
      `}</style>
      <div className="fixed top-0 right-0 h-full w-full sm:max-w-[520px] md:max-w-[650px] lg:max-w-[700px] bg-[#081529]/95 backdrop-blur-xl z-[70] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-right duration-500 ease-out border-l border-white/5">
        
        <div className="p-6 md:p-8 border-b border-[#A37646]/20 bg-transparent sticky top-0 z-10 shrink-0">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-4xl font-instrumentserif tracking-wider text-[#A37646]">
              Search
            </h2>
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 border border-white/5 hover:border-white/10"
            >
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSearchSubmit} className="relative group w-full">
            <div className="absolute inset-0 bg-white/5 rounded-2xl backdrop-blur-md group-focus-within:bg-white/10 transition-colors duration-300"></div>
            <input
              type="text"
              placeholder="Search for products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative w-full bg-transparent border border-white/10 group-focus-within:border-[#A37646]/60 rounded-2xl pl-16 pr-6 py-5 text-base md:text-lg text-white placeholder:text-gray-400 focus:outline-none transition-all duration-300 font-sans shadow-[0_4px_20px_rgba(0,0,0,0.1)] group-focus-within:shadow-[0_4px_25px_rgba(163,118,70,0.15)]"
              autoFocus
            />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#A37646] transition-colors duration-300" size={24} />
          </form>
          
          {/* Recent Searches */}
          {searchQuery.trim().length === 0 && recentSearches.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] uppercase tracking-widest text-Pinball">Recent Searches</h3>
                <button onClick={clearRecentSearches} className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-red-400 flex items-center gap-1 transition-colors">
                  <Trash2 size={12} /> Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((rs, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleRecentSearchClick(rs)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-xs text-gray-300 transition-colors"
                  >
                    <Clock size={12} className="text-gray-500" />
                    {rs}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden font-sans text-light" ref={scrollContainerRef}>
          
          {loading && !sidebarData ? (
            <div className="p-6">{renderSkeleton()}</div>
          ) : (
            <div className="p-6 space-y-10">
              
              {searchQuery.trim().length > 0 ? (
                <div>
                  {isSearching ? (
                    renderSkeleton()
                  ) : hasResults ? (
                    <div className="space-y-8">
                      
                      {/* Categories */}
                      {filteredCategories.length > 0 && (
                        <div>
                          <h3 className="text-xs uppercase tracking-widest text-Pinball mb-3 border-b border-white/10 pb-2">Categories</h3>
                          <div className="space-y-1">
                            {filteredCategories.map(cat => {
                              const currentIndex = itemIndex++;
                              return (
                                <button 
                                  key={cat.id}
                                  onClick={() => executeNavUrl(`/search?category=${cat.id}`)}
                                  className={`w-full text-left flex items-center px-3 py-2 rounded transition-colors ${selectedIndex === currentIndex ? 'bg-[#A37646]/20 text-white' : 'hover:bg-white/5 text-gray-300'}`}
                                >
                                  <Search size={14} className="mr-3 text-gray-500" />
                                  <span className="text-sm"><HighlightText text={cat.name} highlight={searchQuery} /></span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Product Types */}
                      {filteredProductTypes.length > 0 && (
                        <div>
                          <h3 className="text-xs uppercase tracking-widest text-Pinball mb-3 border-b border-white/10 pb-2">Product Types</h3>
                          <div className="space-y-1">
                            {filteredProductTypes.map(pt => {
                              const currentIndex = itemIndex++;
                              return (
                                <button 
                                  key={pt.id}
                                  onClick={() => executeNavUrl(`/search?productType=${pt.id}`)}
                                  className={`w-full text-left flex items-center px-3 py-2 rounded transition-colors ${selectedIndex === currentIndex ? 'bg-[#A37646]/20 text-white' : 'hover:bg-white/5 text-gray-300'}`}
                                >
                                  <Search size={14} className="mr-3 text-gray-500" />
                                  <span className="text-sm"><HighlightText text={pt.name} highlight={searchQuery} /></span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Products */}
                      {suggestions.length > 0 && (
                        <div>
                          <h3 className="text-xs uppercase tracking-widest text-Pinball mb-4 border-b border-white/10 pb-2">Products</h3>
                          <div className="space-y-2">
                            {suggestions.map((prod) => {
                              const currentIndex = itemIndex++;
                              return (
                                <button 
                                  key={prod.id} 
                                  onClick={() => executeNavUrl(`/productdetailviewpage?id=${prod.id}`)}
                                  className={`w-full text-left flex items-center gap-4 group p-2 rounded transition-colors ${selectedIndex === currentIndex ? 'bg-[#A37646]/20' : 'hover:bg-white/5'}`}
                                >
                                  <div className="w-12 h-12 bg-white/5 rounded overflow-hidden shrink-0 relative">
                                    <Image src={resolveImageUrl(prod.imgUrl)} alt={prod.title} fill className="object-cover" unoptimized />
                                  </div>
                                  <div>
                                    <p className={`text-sm font-medium transition-colors line-clamp-1 ${selectedIndex === currentIndex ? 'text-white' : 'text-gray-200 group-hover:text-[#A37646]'}`}>
                                      <HighlightText text={prod.title} highlight={searchQuery} />
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">{prod.product_type_name}</p>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* View All */}
                      <button 
                        onClick={handleSearchSubmit}
                        className={`mt-6 flex items-center justify-center w-full py-3.5 text-[11px] font-bold tracking-[0.2em] uppercase rounded-xl border transition-all duration-300 group ${selectedIndex === itemIndex++ ? 'bg-[#A37646] text-white border-[#A37646]' : 'bg-white/5 hover:bg-white/10 text-white border-white/5 hover:border-white/10'}`}
                      >
                        View All Results <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                      </button>

                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in duration-500">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                        <Search className="text-gray-500" size={24} />
                      </div>
                      <h3 className="text-lg font-instrumentserif tracking-wider text-[#A37646] mb-2 uppercase">No Products Found</h3>
                      <p className="text-sm text-gray-500 max-w-[250px]">
                        We couldn't find any results for "<span className="text-gray-300">{searchQuery}</span>". Try checking the spelling or exploring our categories.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {sidebarData?.categories?.length > 0 && (
                    <div className="w-full">
                      <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-white/50 mb-6">Shop by Category</h3>
                      <div className="flex gap-8 overflow-x-auto pb-6 custom-scrollbar -mx-6 px-6 md:-mx-8 md:px-8">
                        {sidebarData.categories.map((cat: any) => (
                          <Link 
                            key={cat.id} 
                            href={`/search?category=${cat.id}`}
                            onClick={onClose}
                            className="flex flex-col items-center gap-4 group min-w-[110px]"
                          >
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-white/5 border border-white/10 group-hover:border-[#A37646] group-hover:shadow-[0_0_20px_rgba(163,118,70,0.2)] transition-all duration-300 shrink-0 relative">
                              <Image src={resolveImageUrl(cat.imgUrl)} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                            </div>
                            <span className="text-sm md:text-[15px] text-center font-medium text-gray-300 group-hover:text-[#A37646] transition-colors whitespace-nowrap">{cat.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {sidebarData?.productTypes?.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-white/50 mb-5">Shop by Product Type</h3>
                      <div className="flex flex-wrap gap-3">
                        {sidebarData.productTypes.map((pt: any) => (
                          <Link 
                            key={pt.id} 
                            href={`/search?productType=${pt.id}`}
                            onClick={onClose}
                            className="px-6 py-3 text-sm md:text-[15px] font-medium bg-white/5 hover:bg-[#081529] border border-white/10 hover:border-[#A37646] rounded-full transition-all duration-300 text-gray-300 hover:text-[#D4AF37] shadow-sm hover:shadow-[0_0_15px_rgba(163,118,70,0.15)]"
                          >
                            {pt.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 6 New Filters */}
                  {sidebarData?.filters?.fabricTypes?.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-white/50 mb-5">Fabric Type</h3>
                      <div className="flex flex-wrap gap-3">
                        {sidebarData.filters.fabricTypes.map((item: any) => (
                          <Link key={item.id} href={`/search?fabric=${item.id}`} onClick={onClose} className="px-6 py-3 text-sm md:text-[15px] font-medium bg-white/5 hover:bg-[#081529] border border-white/10 hover:border-[#A37646] rounded-full transition-all duration-300 text-gray-300 hover:text-[#D4AF37] shadow-sm hover:shadow-[0_0_15px_rgba(163,118,70,0.15)]">
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {sidebarData?.filters?.origins?.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-white/50 mb-5">Origin</h3>
                      <div className="flex flex-wrap gap-3">
                        {sidebarData.filters.origins.map((item: any) => (
                          <Link key={item.id} href={`/search?origin=${item.id}`} onClick={onClose} className="px-6 py-3 text-sm md:text-[15px] font-medium bg-white/5 hover:bg-[#081529] border border-white/10 hover:border-[#A37646] rounded-full transition-all duration-300 text-gray-300 hover:text-[#D4AF37] shadow-sm hover:shadow-[0_0_15px_rgba(163,118,70,0.15)]">
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {sidebarData?.filters?.styles?.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-white/50 mb-5">Style</h3>
                      <div className="flex flex-wrap gap-3">
                        {sidebarData.filters.styles.map((item: any) => (
                          <Link key={item.id} href={`/search?style=${item.id}`} onClick={onClose} className="px-6 py-3 text-sm md:text-[15px] font-medium bg-white/5 hover:bg-[#081529] border border-white/10 hover:border-[#A37646] rounded-full transition-all duration-300 text-gray-300 hover:text-[#D4AF37] shadow-sm hover:shadow-[0_0_15px_rgba(163,118,70,0.15)]">
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {sidebarData?.filters?.weaves?.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-white/50 mb-5">Weave</h3>
                      <div className="flex flex-wrap gap-3">
                        {sidebarData.filters.weaves.map((item: any) => (
                          <Link key={item.id} href={`/search?weave=${item.id}`} onClick={onClose} className="px-6 py-3 text-sm md:text-[15px] font-medium bg-white/5 hover:bg-[#081529] border border-white/10 hover:border-[#A37646] rounded-full transition-all duration-300 text-gray-300 hover:text-[#D4AF37] shadow-sm hover:shadow-[0_0_15px_rgba(163,118,70,0.15)]">
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {sidebarData?.filters?.colors?.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-white/50 mb-5">Color</h3>
                      <div className="flex flex-wrap gap-3">
                        {sidebarData.filters.colors.map((item: any) => (
                          <Link key={item.id} href={`/search?color=${item.id}`} onClick={onClose} className="px-6 py-3 text-sm md:text-[15px] font-medium bg-white/5 hover:bg-[#081529] border border-white/10 hover:border-[#A37646] rounded-full transition-all duration-300 text-gray-300 hover:text-[#D4AF37] shadow-sm hover:shadow-[0_0_15px_rgba(163,118,70,0.15)] flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full shadow-inner border border-white/20" style={{ backgroundColor: item.color_code || '#fff' }}></span>
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {sidebarData?.filters?.patterns?.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-white/50 mb-5">Pattern</h3>
                      <div className="flex flex-wrap gap-3">
                        {sidebarData.filters.patterns.map((item: any) => (
                          <Link key={item.id} href={`/search?pattern=${item.id}`} onClick={onClose} className="px-6 py-3 text-sm md:text-[15px] font-medium bg-white/5 hover:bg-[#081529] border border-white/10 hover:border-[#A37646] rounded-full transition-all duration-300 text-gray-300 hover:text-[#D4AF37] shadow-sm hover:shadow-[0_0_15px_rgba(163,118,70,0.15)]">
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}


                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
