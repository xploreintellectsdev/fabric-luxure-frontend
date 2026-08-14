import React from 'react'
import ShopHero from '../../../pages/shop/ShopHero'
import Shop from '../../../pages/shop/shop'
import { Suspense } from 'react'

function ShopPage() {
  return (
    <>
      <ShopHero />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading shop...</div>}>
        <Shop /> 
      </Suspense>
    </> 
  )
}

export default ShopPage
