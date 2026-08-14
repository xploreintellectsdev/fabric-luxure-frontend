"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { ArrowUpRight, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface Review {
    review_id: number;
    customer_name: string;
    rating: number;
    review_message: string;
    created_at: string;
    user_id: number | null;
}

const SLIDE_DURATION = 5000

function useVisibleSlides() {
    const [count, setCount] = useState(3) // Always 3 on server to match initial render
    
    useEffect(() => {
        const getCount = () => {
            if (typeof window === 'undefined') return 3
            if (window.innerWidth < 768) return 1
            if (window.innerWidth < 1024) return 2
            return 3
        }
        
        setCount(getCount())
        
        const handler = () => setCount(getCount())
        window.addEventListener('resize', handler)
        return () => window.removeEventListener('resize', handler)
    }, [])
    return count
}

function WriteReview() {
    const searchParams = useSearchParams()
    const productId = searchParams?.get('id')

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

    // Reviews State
    const [reviews, setReviews] = useState<Review[]>([])
    const [averageRating, setAverageRating] = useState<number>(0)
    const [totalReviews, setTotalReviews] = useState<number>(0)
    const [loadingReviews, setLoadingReviews] = useState<boolean>(true)

    // Form State
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Carousel State
    const visibleSlides = useVisibleSlides()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [progress, setProgress] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const [direction, setDirection] = useState<'next' | 'prev' | null>(null)

    const rafRef = useRef<number | null>(null)
    const startTimeRef = useRef<number>(0)
    const pausedProgRef = useRef<number>(0)
    
    const isCarousel = reviews.length > 5;

    const fetchReviews = async () => {
        if (!productId) return;
        setLoadingReviews(true);
        try {
            const res = await fetch(`${API_URL}/api/reviews/product/${productId}`);
            const data = await res.json();
            if (data.success) {
                setReviews(data.reviews || []);
                setAverageRating(data.average_rating || 0);
                setTotalReviews(data.total_reviews || 0);
            }
        } catch (error) {
            console.error("Failed to load reviews", error);
        } finally {
            setLoadingReviews(false);
        }
    }

    useEffect(() => {
        fetchReviews();
    }, [productId])

    const cancelRaf = useCallback(() => {
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = null
        }
    }, [])

    const goTo = useCallback((next: number, dir: 'next' | 'prev') => {
        cancelRaf()
        setProgress(0)
        pausedProgRef.current = 0
        setDirection(dir)
        setCurrentIndex(next)
    }, [cancelRaf])

    const handlePrev = () => {
        if (!isCarousel) return;
        const nextIndex = (currentIndex - 1 + reviews.length) % reviews.length
        goTo(nextIndex, 'prev')
    }

    const handleNext = () => {
        if (!isCarousel) return;
        const nextIndex = (currentIndex + 1) % reviews.length
        goTo(nextIndex, 'next')
    }

    // Auto-advance loop config
    useEffect(() => {
        if (!isCarousel) return; // No auto slide if <= 5
        if (isHovered) {
            cancelRaf()
            return
        }

        startTimeRef.current = performance.now() - (pausedProgRef.current / 100) * SLIDE_DURATION

        const loop = (now: number) => {
            const elapsed = now - startTimeRef.current
            const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100)

            setProgress(pct)
            pausedProgRef.current = pct

            if (elapsed >= SLIDE_DURATION) {
                pausedProgRef.current = 0
                setDirection('next')
                setCurrentIndex(prev => (prev + 1) % reviews.length)
                return
            }
            rafRef.current = requestAnimationFrame(loop)
        }

        rafRef.current = requestAnimationFrame(loop)
        return cancelRaf
    }, [currentIndex, isHovered, cancelRaf, isCarousel, reviews.length])

    useEffect(() => {
        if (!isHovered) {
            pausedProgRef.current = 0
            setProgress(0)
        }
    }, [currentIndex, isHovered])

    // Generate precisely what needs to be shown using wrapping mathematics
    const getVisibleIndices = () => {
        if (reviews.length === 0) return [];
        
        if (!isCarousel) {
            return Array.from({length: reviews.length}, (_, i) => i);
        }

        const indices: number[] = []
        // Center shift matching calculation
        const offset = Math.floor(visibleSlides / 2); // for 5 slides, offset is 2. For 3, offset is 1. For 1, offset is 0.
        for (let i = -offset; i < visibleSlides - offset; i++) {
            indices.push((currentIndex + i + reviews.length) % reviews.length)
        }
        return indices
    }

    const visibleIndices = getVisibleIndices()
    const slideWidthPct = isCarousel ? (100 / visibleSlides) : (100 / Math.max(reviews.length, 3));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!productId) {
            toast.error("Product ID not found.");
            return;
        }
        if (rating === 0) {
            toast.error("Please select a rating.");
            return;
        }
        if (!name.trim() || !email.trim() || !message.trim()) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product_id: productId,
                    customer_name: name,
                    customer_email: email,
                    customer_mobile: phone,
                    rating: rating,
                    review_message: message
                })
            });
            const data = await res.json();
            
            if (data.success) {
                toast.success("Review submitted successfully!");
                // Clear form
                setRating(0);
                setName('');
                setPhone('');
                setEmail('');
                setMessage('');
                
                // Refresh reviews
                fetchReviews();
            } else {
                toast.error(data.error || "Failed to submit review.");
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            {/* CAROUSEL SECTION */}
            <section className='bg-tertiary px-4 sm:px-8 md:px-12 lg:px-16 py-12 md:py-20 lg:py-24 w-full border-t-2 border-bg-light-blue flex flex-col items-center justify-center font-sans overflow-hidden'>
                <div className='max-w-7xl w-full flex flex-col items-center'>

                    <h2 className='text-center uppercase font-instrumentserif text-2xl md:text-3xl lg:text-4xl text-light leading-[1.1] transform scale-y-150 origin-center mb-16 md:mb-20'>
                        ( Customer Reviews )
                    </h2>

                    {loadingReviews ? (
                        <div className="text-light/60 animate-pulse text-center py-8 min-h-[300px] flex items-center justify-center">Loading reviews...</div>
                    ) : reviews.length === 0 ? (
                        <div className="bg-[#2C2C2C] p-10 rounded-xl text-center shadow-lg border border-white/5 w-full max-w-2xl my-8">
                            <h3 className="text-3xl text-[#A37646] mb-3 font-instrumentserif">No Reviews Yet</h3>
                            <p className="text-light/60 text-lg">Be the first to review this product.</p>
                        </div>
                    ) : (
                        <>
                            {/* Summary Stats Overlay */}
                            <div className="mb-10 text-center flex flex-col items-center gap-2">
                                <div className="text-6xl font-instrumentserif text-[#A37646] leading-none">{averageRating}</div>
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star key={star} className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'fill-[#A37646] text-[#A37646]' : 'text-light/20'}`} />
                                    ))}
                                </div>
                                <span className="text-light/60 text-sm mt-1">{totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}</span>
                            </div>

                            <div className='w-full relative min-h-[300px] sm:min-h-[400px] lg:min-h-[450px] mb-8 md:mb-5'>
                                <div className={`w-full h-full flex ${isCarousel ? 'justify-center' : 'justify-center flex-wrap'} items-center gap-4 relative`}>
                                    {visibleIndices.map((originalIdx, positionIdx) => {
                                        const item = reviews[originalIdx]
                                        
                                        // If static (<=5), all are active. If carousel, only the center is active.
                                        const activeIndex = Math.floor(visibleSlides / 2);
                                        const isActive = isCarousel ? (positionIdx === activeIndex) : true;

                                        return (
                                            <div
                                                key={`carousel-card-${positionIdx}-${originalIdx}`}
                                                onMouseEnter={() => isActive && isCarousel && setIsHovered(true)}
                                                onMouseLeave={() => setIsHovered(false)}
                                                className='shrink-0 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group w-[260px] sm:w-[360px] lg:w-[420px]'
                                                style={{
                                                    animation: (isCarousel && direction) ? `slideFadeIn 600ms ease forwards` : 'none'
                                                }}
                                                aria-hidden={!isActive}
                                            >
                                                <div className={`
                                                    rounded-xl pt-5 sm:pt-8 lg:pt-10 px-0 pb-0
                                                    flex flex-col justify-between relative overflow-hidden
                                                    transition-all ease-in-out duration-500 select-none
                                                    h-[260px] sm:h-[360px] lg:h-[420px] w-full mx-auto
                                                    ${isActive
                                                        ? 'scale-105 opacity-100 z-20 group-hover:-translate-y-2 group-hover:scale-[1.07] group-hover:shadow-[0_8px_20px_rgba(212,175,55,0.3)]'
                                                        : 'scale-95 opacity-50 pointer-events-none'
                                                    }
                                                `}
                                                style={isActive 
                                                    ? { 
                                                        background: 'linear-gradient(135deg, #243B6B, #16244A)',
                                                        border: '2px solid #D4AF37',
                                                        boxShadow: '0 0 15px rgba(212,175,55,0.25)'
                                                      } 
                                                    : { 
                                                        background: '#16244A',
                                                        border: '1px solid rgba(255,255,255,0.1)'
                                                      }
                                                }
                                                >
                                                    <div className='px-5 sm:px-8 lg:px-10 overflow-hidden flex-1 flex flex-col justify-center'>
                                                        <div className='flex items-center gap-1 mb-4 sm:mb-6'>
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <Star key={i} size={16} className={i < item.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-light/20'} strokeWidth={1} />
                                                            ))}
                                                        </div>
                                                        <p className={`text-base sm:text-lg lg:text-xl leading-relaxed tracking-wide font-normal transition-colors duration-200 ${isActive ? 'text-white font-medium' : 'text-white/80'} whitespace-pre-wrap`}>
                                                            "{item.review_message}"
                                                        </p>
                                                    </div>
                                                    <div className='w-full mt-4 sm:mt-6 flex flex-col relative shrink-0'>
                                                        <div className={`w-full h-px transition-colors duration-500 ${isActive ? 'bg-[#D4AF37]/30' : 'bg-white/10'}`} />
                                                        <div className='px-5 sm:px-8 lg:px-10 py-3 sm:py-5 mb-2 flex justify-between items-center'>
                                                            <span className={`text-sm sm:text-base font-semibold tracking-widest uppercase block transition-colors duration-500 ${isActive ? 'text-[#D4AF37]' : 'text-light/70'}`}>
                                                                {item.customer_name}
                                                            </span>
                                                            <span className={`text-[10px] sm:text-xs tracking-wider block transition-colors duration-500 ${isActive ? 'text-light/60' : 'text-light/30'}`}>
                                                                {new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                            </span>
                                                        </div>
                                                        {isCarousel && (
                                                            <div
                                                                className='absolute bottom-0 left-0 h-1 bg-[#D4AF37] rounded-r-xl transition-none'
                                                                style={{ width: isActive ? `${progress}%` : '0%' }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            
                            {isCarousel && (
                                <div className='flex items-center gap-4 mt-2 sm:mt-4'>
                                    <button
                                        type='button'
                                        onClick={handlePrev}
                                        className='w-10 h-10 rounded-md border border-light flex items-center justify-center text-light hover:text-primary hover:bg-light hover:border-light transition-all active:scale-95 cursor-pointer shadow-2xs'
                                        aria-label='Previous review'
                                    >
                                        <ChevronLeft size={16} strokeWidth={2} />
                                    </button>

                                    <div className='flex items-center gap-1.5 flex-wrap justify-center max-w-[200px] sm:max-w-none'>
                                        {reviews.map((_, i) => (
                                            <button
                                                key={i}
                                                type='button'
                                                onClick={() => goTo(i, i > currentIndex ? 'next' : 'prev')}
                                                aria-label={`Go to review ${i + 1}`}
                                                className={`rounded-full transition-all duration-300 ${i === currentIndex
                                                    ? 'w-4 h-1.5 bg-bg-blue/70'
                                                    : 'w-1.5 h-1.5 bg-bg-blue/20 hover:bg-blue/40'
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        type='button'
                                        onClick={handleNext}
                                        className='w-10 h-10 rounded-md border border-light flex items-center justify-center text-light hover:text-primary hover:bg-light hover:border-light transition-all active:scale-95 cursor-pointer shadow-2xs'
                                        aria-label='Next review'
                                    >
                                        <ChevronRight size={16} strokeWidth={2} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <style jsx global>{`
                    @keyframes slideFadeIn {
                        0% { opacity: 0.3; transform: scale(0.96); }
                        100% { opacity: 1; transform: scale(1); }
                    }
                `}</style>
            </section>

            {/* WRITE REVIEW SECTION */}
            <div className="bg-tertiary px-6 sm:px-12 lg:px-16 py-16 w-full border-b-2 border-bg-light-blue font-sans text-light">
                <div className="max-w-7xl mx-auto">
                    <div className='mt-0 bg-[#2C2C2C] rounded-xl p-4 md:p-6 flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch shadow-xl border border-white/5'>

                        {/* Left Frame Side Image Asset Showcase Frame */}
                        <div className="relative w-full lg:w-1/2 min-h-[350px] sm:min-h-[450px] rounded-lg overflow-hidden shrink-0">
                            <Image
                                src="/images/home/breath.webp"
                                alt="Linen Landscape Community Visual"
                                fill
                                priority
                                className="object-cover object-center"
                            />
                        </div>

                        {/* Right Block Form Container Section System */}
                        <div className="w-full flex flex-col justify-center py-4 pr-0 lg:pr-4">
                            <h2 className='font-instrumentserif text-4xl sm:text-5xl lg:text-6xl text-[#E6DDD0] tracking-tight leading-[1.05] mb-8 scale-y-105 origin-left'>
                                Write Your <br />Review
                            </h2>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full text-light">

                                {/* Interactive Star Rating Block */}
                                <div className="flex items-center gap-1.5">
                                    <label htmlFor="rating" className='text-light/80 font-medium text-xs tracking-wide uppercase'>Your Rating :</label>
                                    <div id="rating" className="flex items-center">
                                        {[1, 2, 3, 4, 5].map((star) => {
                                            const isFilled = star <= (hoverRating || rating)
                                            return (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    className="text-light/80 font-medium text-xs tracking-wide transition-colors duration-200 focus:outline-none"
                                                >
                                                    <Star
                                                        className={`w-4 h-4 stroke-2 cursor-pointer mr-2 transition-all duration-150 ${isFilled
                                                                ? 'fill-[#A37646] text-[#A37646] scale-110'
                                                                : 'text-light/40'
                                                            }`}
                                                    />
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Two items shared columns aligned on tablet/desktop views */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="name" className='text-light/80 font-medium text-xs tracking-wide uppercase'>Name *</label>
                                        <input 
                                            type="text" 
                                            placeholder="Enter your name" 
                                            id="name" 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            className="w-full bg-[#3D3D3D] text-sm text-light rounded-md px-4 py-3 border border-transparent outline-none focus:border-white/20 transition-all placeholder:text-light/30" 
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="phone" className='text-light/80 font-medium text-xs tracking-wide uppercase'>Phone Number</label>
                                        <input 
                                            type="tel" 
                                            placeholder="Enter your phone number" 
                                            id="phone" 
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full bg-[#3D3D3D] text-sm text-light rounded-md px-4 py-3 border border-transparent outline-none focus:border-white/20 transition-all placeholder:text-light/30" 
                                        />
                                    </div>
                                </div>

                                {/* Wide block form options inputs */}
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="email" className='text-light/80 font-medium text-xs tracking-wide uppercase'>Email *</label>
                                    <input 
                                        type="email" 
                                        placeholder="Enter your email id" 
                                        id="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full bg-[#3D3D3D] text-sm text-light rounded-md px-4 py-3 border border-transparent outline-none focus:border-white/20 transition-all placeholder:text-light/30" 
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="message" className='text-light/80 font-medium text-xs tracking-wide uppercase'>Message *</label>
                                    <textarea 
                                        placeholder="Type your message here..." 
                                        id="message" 
                                        rows={4} 
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                        className="w-full bg-[#3D3D3D] text-sm text-light rounded-md px-4 py-3 border border-transparent outline-none focus:border-white/20 resize-none transition-all placeholder:text-light/30"
                                    ></textarea>
                                </div>

                                {/* Global Form Submission Interactive Frame Element */}
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full mt-2 bg-[#A37646] hover:bg-[#916537] text-light text-xs font-semibold tracking-widest uppercase py-3.5 px-6 rounded-md flex items-center justify-center gap-2 transition-colors duration-200 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Sending...' : 'Send'} <ArrowUpRight className="w-4 h-4 stroke-2" />
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}

export default WriteReview
