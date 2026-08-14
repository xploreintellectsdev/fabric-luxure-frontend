"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Search, Eye, X, Trash2, Star, Calendar, MessageSquare } from "lucide-react";
import { confirmAction, showAlert } from '../../../../utils/modalUtils';
import toast from "react-hot-toast";

interface ReviewProduct {
  product_id: number;
  product_name: string;
  product_image: string;
  total_reviews: number;
  average_rating: number;
}

interface Review {
  review_id: number;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  rating: number;
  review_message: string;
  created_at: string;
  user_id: number | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getProductImageUrl = (img: string) => {
  if (!img) return "/images/home/cat-01.webp";
  if (img.startsWith("/uploads")) return `${API_URL}${img}`;
  return img;
};

export default function ReviewsManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ReviewProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(() => searchParams?.get("search") || "");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ReviewProduct | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync search to URL so refresh restores it
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const qs = params.toString();
    router.replace(`/admin/reviews${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/review-products`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setProducts(data || []);
      } else {
        toast.error("Failed to load review products.");
      }
    } catch (error) {
      console.error("Error fetching review products:", error);
      toast.error("Failed to fetch review products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openReviewsModal = async (product: ReviewProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    await fetchReviewsForProduct(product.product_id);
  };

  const fetchReviewsForProduct = async (productId: number) => {
    setLoadingReviews(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/reviews/product/${productId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setReviews(data || []);
      } else {
        toast.error("Failed to load reviews.");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Error fetching reviews.");
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    const confirmed = await confirmAction(
      "Delete Review",
      "Are you sure you want to delete this review? This action cannot be undone.",
      "Delete"
    );
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const res = await fetch(`${API_URL}/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Review deleted successfully.");
        // Refresh modal reviews
        if (selectedProduct) {
          await fetchReviewsForProduct(selectedProduct.product_id);
          // Also refresh main list to update count/rating
          fetchProducts();
        }
      } else {
        toast.error(data.error || "Failed to delete review.");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.product_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden text-white w-full relative">
      <div className="shrink-0 flex flex-col space-y-6 mb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-instrumentserif tracking-wider text-white">Product Reviews</h1>
        </div>

        {/* Filtering */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-[#102554] p-4 rounded-xl border border-[#081A42]/50 text-white">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#081A42] border border-[#102554] rounded-full py-1.5 pl-10 pr-4 text-[15px] text-white placeholder-[#D3D3D3]/40 focus:outline-none focus:border-[#D4AF37]"
            />
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#D3D3D3]/40" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 min-h-0 bg-[#102554] border border-[#081A42]/50 rounded-xl overflow-hidden shadow-sm flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-[#D3D3D3]/60 animate-pulse">
            Loading products...
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 z-10 bg-[#081A42]">
                <tr className="border-b border-[#081A42] text-[13px] uppercase tracking-wider text-[#D3D3D3]/60">
                  <th className="py-4 px-6 font-medium">Product</th>
                  <th className="py-4 px-6 font-medium">Total Reviews</th>
                  <th className="py-4 px-6 font-medium">Average Rating</th>
                  <th className="py-4 px-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#081A42]/50">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((p) => (
                    <tr key={p.product_id} className="hover:bg-[#081A42]/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-[#081A42] overflow-hidden shrink-0 relative">
                            <img
                              src={getProductImageUrl(p.product_image)}
                              alt={p.product_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-white text-[15px]">{p.product_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-white text-[15px]">{p.total_reviews} {p.total_reviews === 1 ? 'Review' : 'Reviews'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-[15px] text-white">
                          <span>{p.average_rating}</span>
                          <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => openReviewsModal(p)}
                          className="px-3 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white rounded-md text-sm transition-colors inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-4 h-4" /> View Reviews
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#D3D3D3]/40">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reviews Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#102554] border border-[#081A42] w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-[#081A42]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#081A42] overflow-hidden shrink-0 relative border border-[#081A42]">
                  <img
                    src={getProductImageUrl(selectedProduct.product_image)}
                    alt={selectedProduct.product_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-instrumentserif tracking-wider text-white">
                    Reviews for {selectedProduct.product_name}
                  </h2>
                  <p className="text-sm text-[#D3D3D3]/60">
                    {selectedProduct.total_reviews} Total Reviews • Avg Rating: {selectedProduct.average_rating}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-[#D3D3D3]/60 hover:text-white bg-[#081A42] hover:bg-red-500 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#081A42]/30">
              {loadingReviews ? (
                <div className="flex items-center justify-center h-48 text-[#D3D3D3]/60 animate-pulse">
                  Loading reviews...
                </div>
              ) : reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-[#D3D3D3]/40 gap-3 bg-[#081A42]/50 rounded-xl">
                  <MessageSquare className="w-8 h-8 opacity-50" />
                  <p>No reviews found for this product.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.review_id} className="bg-[#102554] p-5 rounded-xl border border-[#081A42] flex flex-col gap-3 relative group">
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteReview(review.review_id)}
                        disabled={isDeleting}
                        className="absolute top-4 right-4 p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex justify-between items-start pr-10">
                        <div>
                          <div className="font-medium text-white text-[15px]">{review.customer_name}</div>
                          <div className="text-xs text-[#D3D3D3]/60 mt-1 flex flex-col sm:flex-row gap-1 sm:gap-3">
                            <span>{review.customer_email}</span>
                            {review.customer_mobile && <span className="hidden sm:inline">•</span>}
                            {review.customer_mobile && <span>{review.customer_mobile}</span>}
                          </div>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= review.rating ? "fill-[#D4AF37] text-[#D4AF37]" : "text-[#D3D3D3]/20"}`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-[#D3D3D3]/80 text-sm leading-relaxed bg-[#081A42]/50 p-3 rounded-lg border border-[#081A42] mt-1">
                        {review.review_message}
                      </p>

                      <div className="flex items-center gap-1.5 text-xs text-[#D3D3D3]/40 mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(review.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
