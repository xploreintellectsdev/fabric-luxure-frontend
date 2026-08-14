import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';
import ProductViewHero from '../../../pages/productDetail/ProductViewHero';
import WhyChooseFabricLuxure from '../../../components/product/WhyChooseFabricLuxure';

const WriteReview = dynamic(() => import('../../../pages/productDetail/WriteReview'));
const SimilarProducts = dynamic(() => import('../../../pages/productDetail/SimilarProducts'));
const Description = dynamic(() => import('../../../pages/productDetail/Description'));

function ProductDetailView() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white/50">Loading...</div>}>
      <Suspense fallback={
        <section className="w-full min-h-screen bg-tertiary text-Pinball flex items-center justify-center font-sans">
          <div className="text-light/60 font-sans text-sm animate-pulse tracking-widest uppercase">
            Loading Product Details...
          </div>
        </section>
      }>
        <ProductViewHero />
      </Suspense>
      <Suspense fallback={
        <div className="bg-primary py-12 md:py-16 w-full flex flex-col items-center justify-center text-center font-sans text-light/50 text-sm">
          Loading description details...
        </div>
      }>
        <Description />
      </Suspense>
      <WhyChooseFabricLuxure />
      <WriteReview />
      <SimilarProducts />
    </Suspense>
  )
}

export default ProductDetailView;
