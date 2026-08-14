import React, { useEffect, useState } from 'react'
import Image from 'next/image'

function CancelOrderModal({ isOpen, onClose, order }) {
    const [shouldRender, setShouldRender] = useState(isOpen)
    const [isVisualOpen, setIsVisualOpen] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true)
            // Frame delay to register mounting before playing the transition
            const frameTimer = setTimeout(() => setIsVisualOpen(true), 10)
            return () => clearTimeout(frameTimer)
        } else {
            setIsVisualOpen(false) // Triggers slide/fade-out state
            // Matches duration-300 before unmounting completely
            const unmountTimer = setTimeout(() => setShouldRender(false), 300)
            return () => clearTimeout(unmountTimer)
        }
    }, [isOpen])

    if (!shouldRender || !order) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* 1. Backdrop Fade (In & Out) */}
            <div 
                className={`absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
                    isVisualOpen ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={onClose}
            />

            {/* 2. Modal Box Slide, Scale & Fade (In & Out) */}
            <div 
                className={`relative w-full max-w-xl bg-tertiary border border-bg-light-blue rounded-xl p-6 md:p-8 shadow-2xl z-10 
                transition-all duration-300 ease-in-out ${
                    isVisualOpen 
                        ? 'opacity-100 translate-y-0 scale-100' 
                        : 'opacity-0 translate-y-10 scale-95'
                }`}
            >
                
                {/* Modal Header Row */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="uppercase font-instrumentserif text-lg md:text-2xl text-light leading-[1.1] transform scale-y-150 origin-center">
                        ( Cancel Order )
                    </h2>
                    <button 
                        type="button"
                        onClick={onClose}
                        className="text-xs font-mono uppercase tracking-widest text-Pinball opacity-70 hover:opacity-100 transition-opacity cursor-pointer font-semibold"
                    >
                        Close
                    </button>
                </div>

                {/* Inner Mini Product Asset Preview Card Layer */}
                <div className="bg-primary border border-bg-light-blue rounded-xl p-5 text-left mb-6">
                    <div className="flex gap-4 items-start relative">
                        <div className="relative w-12 h-12 bg-bg-light-blue rounded-md shrink-0">
                            <Image
                                src={order.image}
                                alt="Product preview asset"
                                fill
                                className="object-cover rounded-md"
                            />
                            <span className="absolute -top-1.5 -right-1.5 bg-bg-blue text-light text-[9px] w-4 h-4 rounded-md flex items-center justify-center font-mono">
                                {order.qty}
                            </span>
                        </div>

                        <div className="grow min-h-12 flex flex-col justify-center">
                            <h3 className="font-instrumentserif text-lg text-light leading-[1.1] tracking-tight transform scale-y-130 origin-left">
                                {order.name}
                            </h3>
                            <p className="text-[11px] text-Pinball mt-1 font-sans">
                                Placed on {order.date}
                            </p>
                        </div>

                        <span className="text-[11px] text-Pinball absolute top-0 right-0 font-sans">
                            Size: {order.size}
                        </span>
                    </div>

                    {/* Dotted Metric Divider Line */}
                    <div className="w-full border-t border-dashed border-light my-4" />

                    {/* Metadata Box Details */}
                    <div className="flex justify-between items-center text-xs ">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] uppercase tracking-wider text-Pinball/80">Order Id</span>
                            <span className="font-sans text-light font-medium text-[11px]">{order.id}</span>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                            <span className="text-[10px] uppercase tracking-wider text-Pinball/80">Amount</span>
                            <span className="text-light font-medium text-xs">{order.amount}</span>
                        </div>
                    </div>
                </div>

                {/* Warning Text Content Layer */}
                <div className="space-y-3 mb-8 text-center">
                    <h4 className="font-instrumentserif text-brown text-lg leading-[1.1] tracking-tight transform scale-y-130 origin-left">
                        Are you sure you want to cancel this order?
                    </h4>
                    <p className="text-xs text-light max-w-md mx-auto leading-relaxed font-sans px-2">
                        <strong className="font-semibold text-light">Note:</strong> Once canceled, the order cannot be reversed. If payment has been made, the refund (if applicable) will be processed within 5—7 business days.
                    </p>
                </div>

                {/* Modal Action Trigger Button */}
                <button
                    type="button"
                    onClick={() => {
                        // Place submission execution logic here
                        onClose();
                    }}
                    className="w-full bg-[#AC2E2E] hover:bg-[#912525] text-light py-3.5 text-xs font-semibold tracking-widest uppercase rounded-lg transition-colors cursor-pointer text-center block shadow-2xs"
                >
                    Cancel Order
                </button>

            </div>
        </div>
    )
}

export default CancelOrderModal