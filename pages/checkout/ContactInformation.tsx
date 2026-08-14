"use client"

import React from 'react'
import Link from 'next/link'
import NewContactForm from './NewContactForm'
import AddressManager from './AddressManager'

function ContactInformation() {
  return (
    <div className="w-full lg:w-[50%] bg-light px-6 sm:px-12 lg:px-16 py-16 md:py-20 text-left">
      
      {/* Header Section */}
      <div className="flex justify-between items-baseline mt-5 mb-8">
        <h2 className="uppercase font-instrumentserif text-lg md:text-2xl lg:text-2xl text-charcoal leading-[1.1] transform scale-y-150 origin-center">
          ( Contact Information )
        </h2>
        <Link 
          href="/signin" 
          className="text-xs text-brown underline font-sans font-medium hover:opacity-80 transition-opacity"
        >
          Sign In/Sign Up
        </Link>
      </div>

      {/* Checkout Step Progress Bar Indicators */}
      <div className="flex items-center gap-3 mb-10 font-sans text-xs">
        <div className="flex items-center gap-2 text-charcoal font-medium">
          <span className="w-5 h-5 rounded-full bg-bg-blue text-light flex items-center justify-center text-[13px] font-semibold">
            1
          </span>
          <span>Contact</span>
        </div>
        <div className="w-12 h-px bg-[#E0D9CF]" />
        <div className="flex items-center gap-2 text-dimgrey">
          <span className="w-5 h-5 rounded-full bg-bg-foggy-pith text-brown flex items-center justify-center text-[13px] font-semibold">
            2
          </span>
          <span>Payment</span>
        </div>
      </div>

      {/* Input Core Form Workspace */}
      {/* <NewContactForm /> */}
      <AddressManager />

      {/* Footer Links Row */}
      <div className="hidden lg:flex flex-wrap justify-between gap-y-2 border-t border-[#E0D9CF]/60 mt-16 pt-6 text-[11px] font-sans text-dimgrey/80">
        <Link href="/refund-policy" className="hover:text-charcoal transition-colors">Refund policy</Link>
        <Link href="/privacy-policy" className="hover:text-charcoal transition-colors">Privacy policy</Link>
        <Link href="/terms-of-service" className="hover:text-charcoal transition-colors">Terms of service</Link>
      </div>

    </div>
  )
}

export default ContactInformation
