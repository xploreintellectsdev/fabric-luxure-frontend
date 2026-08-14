import React from 'react'

function ShippingMethod() {
    return (
        <>
            <div className="space-y-3 pt-2">
                <h3 className="text-sm font-semibold text-charcoal tracking-wide">
                    Shipping Method
                </h3>
                <div className="w-full bg-[#FAF5ED] border border-[#E0D9CF]/80 rounded-xl px-5 py-4 flex justify-between items-center text-sm font-medium">
                    <span className="text-dimgrey">Free shipping</span>
                    <span className="text-charcoal font-semibold tracking-wider text-xs">FREE</span>
                </div>
            </div>

            {/* CTA Form Submission Button */}
            <button
                type="submit"
                className="w-full bg-bg-blue hover:bg-[#835d32] text-light py-4 text-xs font-semibold tracking-widest uppercase rounded-xl transition-colors cursor-pointer text-center block shadow-2xs mt-4"
            >
                Continue to Payment
            </button>
        </>
    )
}

export default ShippingMethod