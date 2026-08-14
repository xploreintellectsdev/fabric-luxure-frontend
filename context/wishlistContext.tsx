"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface WishlistContextType {
  wishlistIds: number[];
  wishlistItems: any[];
  loading: boolean;
  toggleWishlist: (productId: number) => Promise<void>;
  isWishlisted: (productId: number) => boolean;
  syncGuestWishlist: () => Promise<void>;
  fetchWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch token safe helper
  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  // Fetch wishlist from server or localStorage
  const fetchWishlist = async () => {
    const token = getToken();
    if (!token) {
      // Guest User
      if (typeof window !== "undefined") {
        const local = localStorage.getItem("wishlist");
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed)) {
              setWishlistIds(parsed.map(Number));
            }
          } catch (e) {
            console.error("❌ Failed to parse guest wishlist:", e);
          }
        }
      }
      setWishlistItems([]);
      setLoading(false);
    } else {
      // Registered User
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/wishlist`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const items = data.data || [];
          setWishlistItems(items);
          setWishlistIds(items.map((item: any) => Number(item.pro_id)));
        }
      } catch (err) {
        console.error("❌ Failed to fetch wishlist:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchWishlist();

    const handleFocus = () => {
      fetchWishlist();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("focus", handleFocus);
      window.addEventListener("auth-change", handleFocus);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", handleFocus);
        window.removeEventListener("auth-change", handleFocus);
      }
    };
  }, []);

  const isWishlisted = (productId: number) => {
    return wishlistIds.includes(Number(productId));
  };

  const toggleWishlist = async (productId: number) => {
    const pId = Number(productId);
    const token = getToken();

    if (!token) {
      // Guest User toggle
      let current = [...wishlistIds];
      if (current.includes(pId)) {
        current = current.filter(id => id !== pId);
      } else {
        current.push(pId);
      }
      setWishlistIds(current);
      if (typeof window !== "undefined") {
        localStorage.setItem("wishlist", JSON.stringify(current));
      }
    } else {
      // Registered User toggle
      const alreadyWishlisted = wishlistIds.includes(pId);
      try {
        if (alreadyWishlisted) {
          // DELETE
          const res = await fetch(`${API_URL}/api/wishlist/${pId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            setWishlistIds(prev => prev.filter(id => id !== pId));
            setWishlistItems(prev => prev.filter(item => Number(item.pro_id) !== pId));
          } else {
            const data = await res.json();
            throw new Error(data.error || "Failed to remove wishlist item.");
          }
        } else {
          // POST
          const res = await fetch(`${API_URL}/api/wishlist`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ pro_id: pId })
          });
          if (res.ok) {
            setWishlistIds(prev => [...prev, pId]);
            fetchWishlist(); // Refresh details mapping
          } else {
            const data = await res.json();
            throw new Error(data.error || "Failed to add wishlist item.");
          }
        }
      } catch (err: any) {
        console.error("❌ Wishlist toggle error:", err.message);
        // Show a basic console or alert toast
        if (typeof window !== "undefined") {
          toast.error(`Wishlist action failed: ${err.message}`);
        }
      }
    }
  };

  const syncGuestWishlist = async () => {
    const token = getToken();
    if (!token) return;

    if (typeof window !== "undefined") {
      const local = localStorage.getItem("wishlist");
      if (!local) return;

      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const res = await fetch(`${API_URL}/api/wishlist/sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ products: parsed.map(Number) })
          });
          if (res.ok) {
            localStorage.removeItem("wishlist");
            await fetchWishlist();
          }
        }
      } catch (e) {
        console.error("❌ Guest wishlist sync failed:", e);
      }
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistItems,
        loading,
        toggleWishlist,
        isWishlisted,
        syncGuestWishlist,
        fetchWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    return {
      wishlistIds: [],
      wishlistItems: [],
      loading: false,
      toggleWishlist: async () => {},
      isWishlisted: () => false,
      syncGuestWishlist: async () => {},
      fetchWishlist: async () => {}
    };
  }
  return context;
}
