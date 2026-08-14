"use client"
import React, { createContext, useContext, useState, useEffect, useRef } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface CartItem {
  cart_id: number | string;
  user_id?: number;
  pro_id: number;
  fit_style?: string | null;
  selected_size?: string | null;
  selected_meter?: number | string | null;
  selected_length?: number | string | null;
  selected_sleeve?: string | null;
  is_custom: boolean | number;
  custom_chest?: string | null;
  custom_length?: string | null;
  custom_shoulder?: string | null;
  custom_sleeve?: string | null;
  custom_waist?: string | null;
  custom_inseam?: string | null;
  custom_hip?: string | null;
  custom_thigh?: string | null;
  custom_knee?: string | null;
  custom_leg_opening?: string | null;
  quantity: number;
  cart_order?: number;
  pro_name?: string;
  price?: number;
  pro_img?: string;
  cover_description?: string;
  pro_type_name?: string;
  stitching_price?: number | string | null;
  monogram?: {
    enabled: boolean;
    type?: 'text' | 'upload';
    text?: string;
    placement_id?: number;
    color_id?: number;
    font_id?: number;
    extra_price: number;
    placement_name?: string;
    color_name?: string;
    font_name?: string;
    upload_file?: string;
    upload_file_type?: string;
    file_name?: string;
  } | null;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  loading: boolean;
  toast: { visible: boolean; message: string; type: "success" | "error" };
  addToCart: (item: Omit<CartItem, 'cart_id'> & { pro_name?: string; price?: number; pro_img?: string; cover_description?: string; pro_type_name?: string; stitching_price?: number | string | null }) => Promise<void>;
  updateQuantity: (cartId: number | string, quantity: number) => Promise<void>;
  removeFromCart: (cartId: number | string) => Promise<void>;
  removeMonogramFromCart: (cartId: number | string) => Promise<void>;
  mergeGuestCart: (token?: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const isDuplicateMatch = (incoming: any, existing: any) => {
  return (
    String(incoming.selected_size || "") === String(existing.selected_size || "") &&
    String(incoming.selected_meter || "") === String(existing.selected_meter || "") &&
    String(incoming.selected_length || "") === String(existing.selected_length || "") &&
    Boolean(incoming.is_custom) === Boolean(existing.is_custom) &&
    String(incoming.custom_chest || "") === String(existing.custom_chest || "") &&
    String(incoming.custom_length || "") === String(existing.custom_length || "") &&
    String(incoming.custom_shoulder || "") === String(existing.custom_shoulder || "") &&
    String(incoming.custom_sleeve || "") === String(existing.custom_sleeve || "") &&
    String(incoming.custom_waist || "") === String(existing.custom_waist || "") &&
    String(incoming.custom_inseam || "") === String(existing.custom_inseam || "") &&
    String(incoming.custom_hip || "") === String(existing.custom_hip || "") &&
    String(incoming.custom_thigh || "") === String(existing.custom_thigh || "") &&
    String(incoming.custom_knee || "") === String(existing.custom_knee || "") &&
    String(incoming.custom_leg_opening || "") === String(existing.custom_leg_opening || "") &&
    String(incoming.selected_sleeve || "") === String(existing.selected_sleeve || "") &&
    Boolean(incoming.monogram?.enabled) === Boolean(existing.monogram?.enabled || existing.monogram_enabled) &&
    String(incoming.monogram?.text || "") === String(existing.monogram?.text || existing.monogram_text || "") &&
    String(incoming.monogram?.placement_id || "") === String(existing.monogram?.placement_id || existing.monogram_placement_id || "") &&
    String(incoming.monogram?.color_id || "") === String(existing.monogram?.color_id || existing.monogram_color_id || "") &&
    String(incoming.monogram?.font_id || "") === String(existing.monogram?.font_id || existing.monogram_font_id || "")
  );
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: "success" | "error" }>({ visible: false, message: "", type: "success" });
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to trigger toast notifications
  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ visible: true, message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ visible: false, message: "", type: "success" });
    }, 3500);
  };

  // Get token helper
  const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  };

  // Refresh cart items
  const refreshCart = async () => {
    const token = getAuthToken();
    if (token) {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/cart`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const resData = await res.json();
        if (res.ok && resData.success) {
          setCartItems(resData.data || []);
        } else {
          setCartItems([]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch authenticated cart:", err);
      } finally {
        setLoading(false);
      }
    } else {
      // Load from localStorage and inflate with backend prices if possible
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('cart');
        let localItems = local ? JSON.parse(local) : [];
        if (localItems.length > 0) {
          try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/products`);
            const resData = await res.json();
            if (res.ok && resData.success && resData.data) {
              const productMap = new Map();
              resData.data.forEach((p: any) => productMap.set(p.pro_id, p));
              localItems = localItems.map((item: any) => {
                const dbProd = productMap.get(item.pro_id);
                if (dbProd) {
                  return {
                    ...item,
                    price: dbProd.price,
                    stitching_price: dbProd.stitching_price,
                    pro_name: dbProd.pro_name
                  };
                }
                return item;
              });
              localStorage.setItem('cart', JSON.stringify(localItems));
            }
          } catch (err) {
            console.error("Failed to sync guest cart prices:", err);
          }
        }
        setCartItems(localItems);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();

    const handleAuthChange = () => {
      refreshCart();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("auth-change", handleAuthChange);
    }

    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (typeof window !== "undefined") {
        window.removeEventListener("auth-change", handleAuthChange);
      }
    };
  }, []);

  // Calculate total quantity count
  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);

  // Add to Cart
  const addToCart = async (incoming: Omit<CartItem, 'cart_id'> & { pro_name?: string; price?: number; pro_img?: string; cover_description?: string; pro_type_name?: string; stitching_price?: number | string | null }) => {
    const token = getAuthToken();
    if (token) {
      try {
        const res = await fetch(`${API_URL}/api/cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(incoming)
        });
        const resData = await res.json();
        if (res.ok && resData.success) {
          await refreshCart();
          triggerToast("✓ Product added to cart successfully", "success");
        } else {
          triggerToast(resData.error || resData.message || "Failed to add product to cart.", "error");
        }
      } catch (err) {
        console.error("❌ Add to Cart API Error:", err);
        triggerToast("Failed to connect to backend server.", "error");
      }
    } else {
      // Guest local storage logic
      const currentLocal = typeof window !== 'undefined' ? localStorage.getItem('cart') : null;
      let localItems: CartItem[] = currentLocal ? JSON.parse(currentLocal) : [];

      const duplicateIdx = localItems.findIndex(item => item.pro_id === incoming.pro_id && isDuplicateMatch(incoming, item));

      if (duplicateIdx !== -1) {
        // Increment quantity
        localItems[duplicateIdx].quantity += (incoming.quantity || 1);
      } else {
        // Add new guest item with temporary cart_id
        const newGuestItem: CartItem = {
          ...incoming,
          cart_id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          is_custom: incoming.is_custom ? 1 : 0
        };
        localItems.push(newGuestItem);
      }

      localStorage.setItem('cart', JSON.stringify(localItems));
      setCartItems(localItems);
      triggerToast("✓ Product added to cart successfully", "success");
    }
  };

  // Update Quantity
  const updateQuantity = async (cartId: number | string, quantity: number) => {
    const token = getAuthToken();
    if (token && typeof cartId === 'number') {
      try {
        const res = await fetch(`${API_URL}/api/cart/${cartId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ quantity })
        });
        const resData = await res.json();
        if (res.ok && resData.success) {
          await refreshCart();
        } else {
          triggerToast(resData.error || resData.message || "Failed to update quantity.", "error");
        }
      } catch (err) {
        console.error("❌ Update quantity API error:", err);
      }
    } else {
      // LocalStorage update
      const updated = cartItems.map(item => {
        if (item.cart_id === cartId) {
          return { ...item, quantity: Math.max(1, quantity) };
        }
        return item;
      });
      localStorage.setItem('cart', JSON.stringify(updated));
      setCartItems(updated);
    }
  };

  // Remove from Cart
  const removeFromCart = async (cartId: number | string) => {
    const token = getAuthToken();
    if (token && typeof cartId === 'number') {
      try {
        const res = await fetch(`${API_URL}/api/cart/${cartId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        const resData = await res.json();
        if (res.ok && resData.success) {
          await refreshCart();
        }
      } catch (err) {
        console.error("❌ Remove cart item API error:", err);
      }
    } else {
      // LocalStorage remove
      const updated = cartItems.filter(item => item.cart_id !== cartId);
      localStorage.setItem('cart', JSON.stringify(updated));
      setCartItems(updated);
    }
  };

  // Remove Monogram from Cart Item
  const removeMonogramFromCart = async (cartId: number | string) => {
    const token = getAuthToken();
    if (token && typeof cartId === 'number') {
      try {
        const res = await fetch(`${API_URL}/api/cart/${cartId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ monogram: null, monogram_enabled: false })
        });
        const resData = await res.json();
        if (res.ok && resData.success) {
          await refreshCart();
          triggerToast("Monogram removed", "success");
        }
      } catch (err) {
        console.error("❌ Remove monogram API error:", err);
      }
    } else {
      const updated = cartItems.map(item => {
        if (item.cart_id === cartId) {
          return { ...item, monogram: null };
        }
        return item;
      });
      localStorage.setItem('cart', JSON.stringify(updated));
      setCartItems(updated);
      triggerToast("Monogram removed", "success");
    }
  };

  // Merge Guest Cart into database
  const mergeGuestCart = async (suppliedToken?: string) => {
    const token = suppliedToken || getAuthToken();
    if (!token) return;

    const currentLocal = typeof window !== 'undefined' ? localStorage.getItem('cart') : null;
    const localItems: CartItem[] = currentLocal ? JSON.parse(currentLocal) : [];

    if (localItems.length === 0) {
      await refreshCart();
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/cart/merge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ products: localItems })
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        localStorage.removeItem('cart');
        await refreshCart();
      }
    } catch (err) {
      console.error("❌ Merge guest cart error:", err);
      await refreshCart();
    }
  };
  const clearCart = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart');
    }
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      loading,
      toast,
      addToCart,
      updateQuantity,
      removeFromCart,
      removeMonogramFromCart,
      mergeGuestCart,
      refreshCart,
      clearCart
    }}>
      {children}

      {/* Global Premium Toast Notification */}
      {toast.visible && (
        <div className={`fixed top-20 right-4 sm:top-24 sm:right-6 z-100 flex items-center gap-2 sm:gap-3 bg-[#08142c] border ${toast.type === 'error' ? 'border-red-500/50 shadow-red-500/10' : 'border-white/10 shadow-2xl'} px-3 py-2.5 sm:px-5 sm:py-3.5 rounded-lg animate-fade-in transition-all select-none max-w-[280px] sm:max-w-sm`}>
          {toast.type === 'error' ? (
            <span className="text-red-500 font-bold text-sm sm:text-base select-none">!</span>
          ) : (
            <span className="text-emerald-500 font-bold text-sm sm:text-base select-none">✓</span>
          )}
          <div className="flex flex-col gap-0.5">
            <p className="text-[10px] sm:text-xs font-semibold text-white tracking-wide uppercase select-none leading-snug">{toast.message}</p>
            <div className="flex gap-1.5 sm:gap-2.5 items-center mt-1 text-[8px] sm:text-[10px] uppercase font-bold tracking-wider select-none text-Pinball flex-wrap">
              <button 
                type="button" 
                onClick={() => setToast({ visible: false, message: "", type: "success" })} 
                className="hover:text-white transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
              <span className="text-white/15">|</span>
              <a 
                href="/cart" 
                className="text-brown hover:text-brown/80 transition-colors cursor-pointer underline"
              >
                View Cart
              </a>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

// Custom Hook with safe fallback return to avoid build exceptions on static page generator
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    return {
      cartItems: [],
      cartCount: 0,
      loading: false,
      toast: { visible: false, message: "", type: "success" },
      addToCart: async () => {},
      updateQuantity: async () => {},
      removeFromCart: async () => {},
      removeMonogramFromCart: async () => {},
      mergeGuestCart: async () => {},
      refreshCart: async () => {},
      clearCart: () => {}
    };
  }
  return context;
}
