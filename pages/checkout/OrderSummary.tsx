import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const checkoutProducts = [
  {
    id: 1,
    name: "OLIVE GREEN LINEN FABRIC SHIRT",
    size: "S",
    qty: 1,
    price: "Rs. 2999/-",
    image: "/images/profile/profile-img.webp"
  },
  {
    id: 2,
    name: "SKY BLUE LINEN FABRIC SHIRT",
    size: "S",
    qty: 1,
    price: "Rs. 2999/-",
    image: "/images/profile/profile-img.webp" // swap to your unique layout paths later
  },
  {
    id: 3,
    name: "BEIGE LINEN FABRIC PANT",
    size: "S",
    qty: 1,
    price: "Rs. 2999/-",
    image: "/images/profile/profile-img.webp"
  }
]

function OrderSummary() {
  return (
    <div className="w-full lg:w-[50%] bg-[#FBF5ED]  py-16 md:py-20 text-left">
      <div className='px-6 sm:px-12 lg:px-16'>
      {/* Title Metrics Layout Headings Row */}
      <div className="flex justify-between items-baseline mt-5 mb-8 pb-4">
        <h2 className="uppercase font-instrumentserif text-lg md:text-2xl lg:text-2xl text-charcoal leading-[1.1] transform scale-y-150 origin-center">
          ( Order Summary )
        </h2>
        <span className="text-xs font-sans text-dimgrey font-medium">
          Total {checkoutProducts.length} Products
        </span>
      </div>

      {/* Mapping Virtual Basket Items Stack */}
      <div className="space-y-5 mb-8 max-h-[380px] overflow-y-auto pr-1">
        {checkoutProducts.map((product,i) => (
          <div key={product.id} className={`${i==0 ? "" : "border-t-[1.5]"} pt-5 border-[#E0D9CF] flex justify-between items-center gap-4 relative`}>
            
            {/* Asset Image Box Wrapper with Badge counts */}
            <div className="relative w-16 h-16 bg-[#EAE3D8] rounded-xl shrink-0 border border-[#E0D9CF]/40">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover rounded-xl"
              />
              <span className="absolute -top-1.5 -right-1.5 bg-charcoal text-light text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-mono z-10 font-semibold shadow-xs">
                {product.qty}
              </span>
            </div>

            {/* Core Item Information Labels */}
            <div className="grow min-h-[50px] flex flex-col justify-center">
              <h3 className="font-instrumentserif text-lg text-charcoal leading-[1.1] tracking-tight transform scale-y-120 origin-left max-w-[220px]">
                {product.name}
              </h3>
              <p className="text-[11px] text-pinball mt-1 font-sans font-medium">
                Size: {product.size}
              </p>
            </div>

            {/* Calculated Local Currency Pricing Label */}
            <span className="text-sm font-sans text-charcoal font-medium whitespace-nowrap">
              {product.price}
            </span>

          </div>
        ))}
      </div>

      {/* Coupon Discount Entry Execution Module */}
      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <input
          type="text"
          placeholder="Discount Code"
          className="grow bg-[#FAF5ED] border border-[#E0D9CF]/80 rounded-xl px-5 py-3.5 text-sm text-charcoal font-medium placeholder:text-dimgrey/40 focus:outline-hidden focus:border-brown transition-colors"
        />
        <button
          type="button"
          className="bg-bg-blue hover:bg-[#835d32] text-light px-6 py-3.5 text-xs font-semibold tracking-widest uppercase rounded-xl transition-colors cursor-pointer text-center whitespace-nowrap shadow-3xs"
        >
          Apply
        </button>
      </div>
      </div>

      {/* Divider Separator Line */}
      <div className="w-full border-t-2 border-[#E0D9CF]/60 my-6" />

      {/* Pricing Fee Invoices Recapitulations Structure */}
      <div className="space-y-3.5 text-xs font-sans font-medium px-6 sm:px-12 lg:px-16 text-pinball">
        <div className="flex justify-between items-center">
          <span>Total MRP</span>
          <span className="">RS. 9997/-</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1">
            Shipping Fee 
            <span className="w-3.5 h-3.5 rounded-full border border-pinball/50 text-[9px] flex justify-center cursor-help select-none">?</span>
          </span>
          <span className="">RS. 50.00/-</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span>GST</span>
          <span className="text-[#A37646] font-bold">Included</span>
        </div>

        {/* Divider Separator Line */}
        <div className="w-full border-t border-[#E0D9CF]/40 my-4 pt-2" />

        {/* Total Aggregated Checkout Amount Label row */}
        <div className="flex justify-between items-center text-sm font-semibold">
          <span className="text-brown">Total Amount</span>
          <span className="text-brown text-base tracking-wide">RS. 11,856/-</span>
        </div>
      </div>
      <div className="flex lg:hidden px-6 sm:px-12 lg:px-16 flex-wrap justify-between gap-y-2 border-t border-[#E0D9CF]/60 mt-16 pt-6 text-[11px] font-sans text-dimgrey/80">
        <Link href="/refund-policy" className="hover:text-charcoal transition-colors">Refund policy</Link>
        <Link href="/privacy-policy" className="hover:text-charcoal transition-colors">Privacy policy</Link>
        <Link href="/terms-of-service" className="hover:text-charcoal transition-colors">Terms of service</Link>
      </div>

    </div>
  )
}

export default OrderSummary
