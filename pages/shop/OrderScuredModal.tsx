"use client"
import React from 'react'
import Image from 'next/image'

interface OrderSecuredModalProps {
  isOpen: boolean
  onClose: () => void
  orderId?: string
  amount?: string
  paymentMethod?: { type: string; iconUrl: string }
}

function OrderScuredModal({
  isOpen,
  onClose,
  orderId = "#VL-9042-X7B",
  amount = "RS. 11,855/-",
  paymentMethod = { type: "Paid via (UPI)", iconUrl: "/images/upi-icon.svg" }
}: OrderSecuredModalProps) {

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity" onClick={onClose} />

      {/* 
        MAIN CONTAINER: 
        Locked to exactly 356px width and 501px height as shown in Screenshot 2026-06-20 123733_3.png.
      */}
      <div className="relative w-[356px] h-[501px] text-center select-none animate-in fade-in zoom-in-95 duration-200">
        
        {/* Background Ticket Image Asset */}
        <div className="absolute inset-0 z-0 w-full h-full">
          <Image 
            src="/images/coupen1.webp" 
            alt="Ticket Background" 
            fill 
            unoptimized 
            className="object-contain" 
            priority 
          />
        </div>

        {/* --- ABSOLUTE CONTENT LAYERS --- */}

        {/* 1. Header & Typography Group */}
        <div className="absolute top-[38px] left-0 right-0 flex flex-col items-center px-6 z-20">
          {/* Gold Coin */}
          <div className="relative w-11 h-11 mb-2.5 drop-shadow-sm">
            <Image src="/images/home/goldcircle.png" alt="Coin" fill className="object-contain" priority />
          </div>

          <h2 className="font-instrumentserif italic text-[28px] text-[#9C7A53] leading-tight tracking-wide mb-0.9">
            Wonderful.
          </h2>
          <p className="font-sans text-[10px] uppercase tracking-[0.14em] text-[#2C2C2C]/70 font-medium mb-6">
            Your order is secured.
          </p>
          <p className="text-[14px] text-[#2C2C2C] uppercase font-light font-instrumentserif tracking-wider transform scale-y-160 origin-center">
            Welcome to the <span className="italic text-[#9C7A53]">VL Global</span> Society
          </p>
        </div>

        {/* 2. Middle Notch Divider Line */}
        <div className="absolute top-[210px] left-0 right-0 px-[38px] z-20">
          <hr
            className="w-full border-0 h-px"
            style={{
              backgroundImage: 'linear-gradient(to right, #A3A3A3 0%, #A3A3A3 70%, transparent 70%, transparent 100%)',
              backgroundSize: '11px 100%',
              backgroundRepeat: 'repeat-x'
            }}
          />
        </div>
        
        {/* 3. Transaction Metadata (Order ID & Amount) */}
        <div className="absolute top-[236px] left-0 right-0 grid grid-cols-2 px-[42px] text-left font-sans text-[10.5px] z-20">
          <div className="flex flex-col gap-1">
            <span className="text-[#2C2C2C] uppercase tracking-wider font-medium opacity-50">Order Id</span>
            <span className="text-[#3A3A3A] font-semibold tracking-wide">{orderId}</span>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-[#2C2C2C] uppercase tracking-wider font-medium opacity-50">Amount</span>
            <span className="text-[#3A3A3A] font-semibold tracking-wide">{amount}</span>
          </div>
        </div>

        {/* 4. Payment Method Badge Container */}
        <div className="absolute top-[296px] left-1/2 -translate-x-1/2 w-[272px] bg-[#FCF9F5]/80 backdrop-blur-sm border border-[#E3DACF] rounded-md px-3.5 py-2.5 flex items-center justify-between z-20">
          <span className="font-sans text-[11px] text-[#2C2C2C]/85 font-medium">{paymentMethod.type}</span>
          <div className="relative h-4 w-11 flex items-center justify-end">
            <Image src={paymentMethod.iconUrl} alt="Gateway" width={38} height={15} className="object-contain max-h-full" />
          </div>
        </div>

        {/* 5. Lower Separator Divider Line */}
        <div className="absolute top-[360px] left-0 right-0 px-[38px] z-20">
          <div
            className="w-full h-[1.5px]"
            style={{
              backgroundImage: 'linear-gradient(to right, #E2D8CA 0%, #E2D8CA 85%, transparent 85%, transparent 100%)',
              backgroundSize: '13px 100%',
              backgroundRepeat: 'repeat-x'
            }}
          />
        </div>

        {/* 6. Primary Action Interactive Button */}
        <div className="absolute bottom-[70px] left-1/2 -translate-x-1/2 w-[272px] z-20">
          <button 
            onClick={onClose} 
            className="w-full bg-[#9C7A53] hover:bg-[#866643] text-white font-sans text-[10.5px] uppercase tracking-[0.2em] font-semibold py-3 rounded transition-colors duration-200 shadow-sm"
          >
            Continue Shopping
          </button>
        </div>

      </div>
    </div>
  )
}

export default OrderScuredModal
