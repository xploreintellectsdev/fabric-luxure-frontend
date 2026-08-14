"use client"
import React from 'react'
import Link from 'next/link'
import OrdersList from '../../components/OrdersList'

function YourOrders() {
  return (
    <section className='bg-tertiary min-h-screen px-6 sm:px-12 lg:px-16 py-16 md:py-20 w-full flex justify-center overflow-hidden border-t-2 border-[#E0D9CF]'>
      <div className='w-full max-w-7xl mx-auto'>

        {/* Navigation Breadcrumb Tracker */}
        <div className="text-xs uppercase text-Pinball font-mono tracking-wider text-pinball/70 mb-10 text-left">
          <Link href="/" className="hover:text-light transition-colors">Home</Link>
          <span> &gt; </span>
          <Link href="/profile" className="hover:text-light transition-colors">Profile</Link>
          <span> &gt; Your Orders</span>
        </div>

        {/* Typography Centered Header */}
        <div className='text-center mb-12'>
          <h1 className="font-instrumentserif text-3xl sm:text-4xl lg:text-5xl font-medium text-light leading-[1.1] uppercase transform scale-y-130 tracking-tighter origin-center">
            Your Orders
          </h1>
        </div>

        {/* Reusable Orders component */}
        <OrdersList />

      </div>
    </section>
  )
}

export default YourOrders
