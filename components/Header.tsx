"use client"
import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, Heart, ShoppingCart, UserRound, Menu, X, Eye, EyeOff, Wallet, User, Package, MapPin, LogOut, CreditCard } from 'lucide-react'
import { useWishlist } from '../context/wishlistContext'
import { useCart } from '../context/cartContext'
import { useWebsitePages } from '../context/websitePagesContext'
import toast from 'react-hot-toast'
import GlobalSearchDrawer from './GlobalSearchDrawer'

function Header() {
    const router = useRouter()
    const { wishlistIds } = useWishlist()
    const { cartCount } = useCart()
    const { pages } = useWebsitePages()
    
    const navItems = pages
      .filter((page) => page.is_enabled === 1 && page.show_in_navbar === 1)
      .map((page) => ({
        id: String(page.page_id),
        navText: page.page_name,
        navLink: page.page_route
      }))

    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [isVisible, setIsVisible] = useState(true)
    const pathname = usePathname()
    const lastScrollY = useRef(0)

    // Auth States
    const [user, setUser] = useState<any>(null)
    
    // Search Drawer State
    const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false)

    // Dropdown States
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Sync auth status on mount and via custom event
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token")
            const cachedUser = localStorage.getItem("user")
            if (token && cachedUser) {
                try {
                    setUser(JSON.parse(cachedUser))
                } catch {
                    setUser(null)
                }
            } else {
                setUser(null)
            }
        }
        checkAuth()

        window.addEventListener("auth-change", checkAuth)
        return () => window.removeEventListener("auth-change", checkAuth)
    }, [])



    // Close dropdown on click outside
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleOutsideClick)
        return () => document.removeEventListener("mousedown", handleOutsideClick)
    }, [isDropdownOpen])

    // Scroll visible navbar toggler
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY

            if (currentScrollY < 50) {
                setIsVisible(true)
                lastScrollY.current = currentScrollY
                return
            }

            if (currentScrollY > lastScrollY.current) {
                setIsVisible(false)
            } else {
                setIsVisible(true)
            }

            lastScrollY.current = currentScrollY
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])



    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUser(null)
        setIsDropdownOpen(false)
        window.dispatchEvent(new Event("auth-change"))
        toast.success("You have logged out successfully.")
        router.push("/")
    }



    return (
        <>
            <header
                className={`w-full fixed top-0 left-0 z-50 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'
                    }`}
            >
                <div className='bg-[#0000004D] backdrop-blur-sm px-6 py-2 sm:py-3 md:px-12 md:py-2.5 lg:py-2.5 lg:px-16 border-b border-white/5'>
                    <div className='mx-auto flex items-center justify-between text-light'>

                        <div className='flex-1 flex justify-start items-center'>
                            <Link href="/">
                                <Image
                                    src="/images/FL New Logo Final.png"
                                    alt="VL Global Logo"
                                    height={120}
                                    width={120}
                                    className='h-12 sm:h-16 md:h-14 lg:h-16 w-auto object-contain brightness-0 invert'
                                    priority
                                    loading="eager"
                                />
                            </Link>
                        </div>

                        <nav className='hidden xl:flex items-center gap-6 xl:gap-8'>
                            {navItems.map((item) => {
                                const isActive = pathname === item.navLink
                                return (
                                    <Link
                                        href={item.navLink}
                                        key={item.id}
                                        className="relative py-1 group overflow-hidden"
                                    >
                                        <span className={`uppercase font-medium text-xs lg:text-sm tracking-[0.2em] transform scale-y-110 block transition-colors duration-300 ${isActive ? 'text-bg-blue' : 'text-light group-hover:text-light/80'}`}>
                                            {item.navText}
                                        </span>
                                        <span className={`absolute bottom-0 left-0 h-[1px] bg-bg-blue transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                                    </Link>
                                )
                            })}
                        </nav>

                        <div className='hidden xl:flex items-center justify-end gap-5 xl:gap-6 flex-1'>
                            <Search 
                                size={20} 
                                className='cursor-pointer hover:text-light/80 transition-colors' 
                                onClick={() => setIsSearchDrawerOpen(true)}
                            />
                            <Link href="/wishlist" className="relative cursor-pointer hover:text-light/80 transition-colors flex items-center">
                                <Heart size={20} />
                                {wishlistIds.length > 0 && (
                                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                                        {wishlistIds.length}
                                    </span>
                                )}
                            </Link>
                            <Link href="/cart" className="relative cursor-pointer hover:text-light/80 transition-colors flex items-center">
                                <ShoppingCart size={20} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                            {user && (
                                <Link href="/wallet" className="relative cursor-pointer hover:text-light/80 transition-colors flex items-center" title="My Wallet">
                                    <Wallet size={20} />
                                </Link>
                            )}
                            {user ? (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="focus:outline-none flex items-center"
                                        aria-label="User dropdown menu"
                                    >
                                        <UserRound size={20} className={`cursor-pointer transition-colors ${isDropdownOpen ? 'text-bg-blue' : 'hover:text-light/80'}`} />
                                    </button>
                                     {isDropdownOpen && (
                                         <div 
                                             className="absolute right-0 mt-3 w-80 bg-[#081529]/95 backdrop-blur-[16px] border border-white/10 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] z-50 origin-top-right text-left flex flex-col gap-4"
                                             style={{ animation: "fadeInDown 220ms ease-out forwards" }}
                                         >
                                             <style>{`
                                                 @keyframes fadeInDown {
                                                     from {
                                                         opacity: 0;
                                                         transform: translateY(-8px) scale(0.98);
                                                     }
                                                     to {
                                                         opacity: 1;
                                                         transform: translateY(0) scale(1);
                                                     }
                                                 }
                                                 @keyframes menuItemFade {
                                                     from {
                                                         opacity: 0;
                                                         transform: translateX(-4px);
                                                     }
                                                     to {
                                                         opacity: 1;
                                                         transform: translateX(0);
                                                     }
                                                 }
                                             `}</style>

                                             {/* Profile Header */}
                                             <div className="flex items-center gap-3.5 pb-4 border-b border-white/10">
                                                 <div className="w-12 h-12 rounded-full border border-[#D4AF37] bg-white/5 flex items-center justify-center font-serif text-lg font-bold text-[#D4AF37] uppercase select-none">
                                                     {user.name ? user.name[0] : "U"}
                                                 </div>
                                                 <div className="flex-1 min-w-0">
                                                     <p className="text-[10px] text-white/50 uppercase font-mono tracking-wider">Welcome back</p>
                                                     <p className="text-sm font-semibold text-white font-sans truncate">{user.name || "User"}</p>
                                                     <p className="text-[10px] text-white/45 font-mono truncate">{user.email || "No Email linked"}</p>
                                                 </div>
                                             </div>

                                             {/* Menu Items */}
                                             <div className="flex flex-col gap-1">
                                                 {[
                                                     { label: "My Profile", href: "/profile", icon: User },
                                                     { label: "Orders", href: "/profile/your-orders", icon: Package },
                                                     { label: "Wishlist", href: "/wishlist", icon: Heart },
                                                     { label: "Addresses", href: "/profile", icon: MapPin },
                                                     { label: "Wallet", href: "/wallet", icon: CreditCard }
                                                 ].map((item, idx) => {
                                                     const IconComp = item.icon;
                                                     return (
                                                         <Link
                                                             key={idx}
                                                             href={item.href}
                                                             onClick={() => setIsDropdownOpen(false)}
                                                             className="group flex items-center gap-3.5 py-3 px-4 rounded-xl text-xs font-medium tracking-[0.3px] text-white/95 hover:bg-white/6 hover:text-[#D4AF37] transition-all duration-250 cursor-pointer"
                                                             style={{
                                                                 animation: "menuItemFade 200ms ease-out forwards",
                                                                 animationDelay: `${idx * 45}ms`,
                                                                 opacity: 0
                                                             }}
                                                         >
                                                             <IconComp size={18} className="text-white/60 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all duration-250 shrink-0" />
                                                             <span>{item.label}</span>
                                                         </Link>
                                                     );
                                                 })}
                                             </div>

                                             <div className="border-t border-white/10" />

                                             {/* Logout Button */}
                                             <button
                                                 onClick={handleLogout}
                                                 className="group flex items-center gap-3.5 w-full text-left py-3 px-4 rounded-xl text-xs font-medium tracking-[0.3px] text-red-400/90 hover:bg-red-500/10 hover:text-red-300 transition-all duration-250 cursor-pointer"
                                                 style={{
                                                     animation: "menuItemFade 200ms ease-out forwards",
                                                     animationDelay: "225ms",
                                                     opacity: 0
                                                 }}
                                             >
                                                 <LogOut size={18} className="text-red-400/70 group-hover:text-red-300 group-hover:translate-x-0.5 transition-all duration-250 shrink-0" />
                                                 <span>Logout</span>
                                             </button>
                                         </div>
                                     )}
                                </div>
                            ) : (
                                <Link
                                    href="/signin"
                                    className="focus:outline-none"
                                    aria-label="Sign in"
                                >
                                    <UserRound size={20} className='cursor-pointer hover:text-light/80 transition-colors' />
                                </Link>
                            )}
                        </div>

                        <div className='flex xl:hidden items-center justify-end gap-5'>
                            <Link href="/cart" className="relative cursor-pointer flex items-center">
                                <ShoppingCart size={20} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                            <button
                                onClick={() => setIsMobileOpen(true)}
                                aria-label="Toggle Full Overlay Navigation Menu"
                                className='p-1'
                            >
                                <Menu size={24} />
                            </button>
                        </div>

                    </div>
                </div>
            </header>

            <div className={`fixed inset-0 bg-tertiary z-[110] xl:hidden px-6 py-4 flex flex-col justify-between transition-all duration-500 ease-in-out ${isMobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
                <div className='flex items-center justify-between w-full pb-4 border-b border-bg-light-blue'>
                    <Image src="/images/FL New Logo Final.png" alt="VL Global Logo" height={80} width={80} className='h-14 w-auto object-contain brightness-0 invert' />
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        aria-label="Dismiss Full Overlay Navigation"
                        className='p-1 text-light flex items-center gap-1.5'
                    >
                        <span className='text-[10px] uppercase font-medium tracking-widest mt-0.5'>Close</span>
                        <X size={20} />
                    </button>
                </div>

                <div className='flex flex-col items-center justify-center grow my-auto gap-4 sm:gap-6 md:gap-3 lg:gap-8 text-center'>
                    <span className='text-[10px] text-light/40 uppercase tracking-[0.3em] font-medium block mb-1 sm:mb-2 md:mb-0 lg:mb-2 select-none'>
                        — INDEX MAP —
                    </span>
                    <nav className='flex flex-col gap-4 sm:gap-6 md:gap-3 lg:gap-6'>
                        {navItems.map((item, index) => {
                            const isActive = pathname === item.navLink
                            return (
                                <Link
                                    href={item.navLink}
                                    key={item.id}
                                    onClick={() => setIsMobileOpen(false)}
                                    className='group flex flex-col items-center'
                                    style={{
                                        transitionDelay: isMobileOpen ? `${index * 75}ms` : '0ms',
                                        transform: isMobileOpen ? 'translateY(0)' : 'translateY(20px)',
                                        opacity: isMobileOpen ? 1 : 0,
                                        transitionProperty: 'transform, opacity',
                                        transitionDuration: '400ms'
                                    }}
                                >
                                    <h2 className={`uppercase font-instrumentserif text-[26px] sm:text-4xl md:text-2xl lg:text-4xl tracking-widest transition-colors duration-300 ${isActive ? 'text-brown font-semibold' : 'text-light'}`}>
                                        {item.navText}
                                    </h2>
                                    <span className='text-[9px] text-brown/40 uppercase tracking-widest font-serif scale-y-75 h-0 opacity-0 group-hover:opacity-100 group-hover:h-auto transition-all duration-300 mt-1 md:mt-0 lg:mt-1'>
                                        ( Discover )
                                    </span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                <div className='w-full pt-6 border-t border-bg-light-blue grid grid-cols-2 items-end gap-4 text-Pinball'>
                    <div className='flex flex-col gap-3 font-medium text-xs tracking-wider uppercase'>
                        <button 
                            onClick={() => {
                                setIsMobileOpen(false);
                                setIsSearchDrawerOpen(true);
                            }} 
                            className='hover:text-brown transition-colors flex items-center gap-2 w-full text-left focus:outline-none'
                        >
                            <Search size={15} /> <span>Search Store</span>
                        </button>
                        <Link href="/wishlist" onClick={() => setIsMobileOpen(false)} className='hover:text-brown transition-colors flex items-center gap-2'>
                            <Heart size={15} /> <span>Saved Items</span>
                        </Link>
                        {user && (
                            <Link href="/wallet" onClick={() => setIsMobileOpen(false)} className='hover:text-brown transition-colors flex items-center gap-2'>
                                <Wallet size={15} /> <span>My Wallet</span>
                            </Link>
                        )}
                        {user ? (
                            <Link href="/profile" onClick={() => setIsMobileOpen(false)} className='hover:text-brown transition-colors flex items-center gap-2'>
                                <UserRound size={15} /> <span>My Account</span>
                            </Link>
                        ) : (
                            <Link
                                href="/signin"
                                onClick={() => setIsMobileOpen(false)}
                                className='hover:text-brown transition-colors flex items-center gap-2 w-full text-left'
                            >
                                <UserRound size={15} /> <span>My Account</span>
                            </Link>
                        )}
                    </div>

                    <div className='flex flex-col gap-1 items-end text-[10px] text-pinball uppercase font-light tracking-widest'>
                        <span className='text-charcoal/30 font-medium mb-1'>CONNECT</span>
                        <Link href="" className='hover:opacity-70 py-0.5'>Instagram</Link>
                        <Link href="" className='hover:opacity-70 py-0.5'>Facebook</Link>
                    </div>
                </div>
            </div>
            
            <GlobalSearchDrawer isOpen={isSearchDrawerOpen} onClose={() => setIsSearchDrawerOpen(false)} />
        </>
    )
}

export default Header
