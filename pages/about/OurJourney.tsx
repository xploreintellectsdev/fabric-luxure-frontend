"use client";
import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const journeyData = [
  {
    year: "2021",
    title: "The Beginning",
    image: "/images/about-us/our-journey-img-1.webp",
    description:
      "VL Global begins its journey with a focus on premium linen apparel, driven by a commitment to craftsmanship, comfort, and timeless design.",
  },
  {
    year: "2022",
    title: "Scaling Production",
    image: "/images/about-us/our-journey-img-1.webp",
    description:
      "Expanding our artisan network to collaborate with traditional weavers, integrating heritage craftsmanship into scalable modern designs.",
  },
  {
    year: "2023",
    title: "Global Reach",
    image: "/images/about-us/our-journey-img-1.webp",
    description:
      "Exporting premium linen collections overseas, establishing our footprint across international boutiques and sustainable retail ecosystems.",
  },
  {
    year: "2024",
    title: "Innovation in Blend",
    image: "/images/about-us/our-journey-img-1.webp",
    description:
      "Launching zero-waste collection frameworks and new plant-based organic textile treatments prioritizing complete fiber transparency.",
  },
  {
    year: "2025",
    title: "The Modern Legacy",
    image: "/images/about-us/our-journey-img-1.webp",
    description:
      "Cementing our position as leading visionaries of premium modern linen craftsmanship, operating at absolute sustainable precision.",
  },
];

function OurJourney() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeData = journeyData[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? journeyData.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === journeyData.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="w-full bg-tertiary px-6 sm:px-12 md:px-20 lg:px-32 py-20 md:py-28 select-none">
      <div className="w-full mx-auto flex flex-col items-center">
        <div className="text-center mb-16">
          <h2 className="text-center uppercase font-instrumentserif text-lg md:text-2xl text-light leading-[1.1] transform scale-y-150 origin-center mb-16 md:mb-10">
            ( OUR JOURNEY )
          </h2>
          <h2 className="font-instrumentserif text-4xl sm:text-5xl md:text-6xl text-light font-normal leading-[1.15] tracking-tight max-w-3xl mx-auto ">
            A Journey Woven With Purpose
            <br className="hidden sm:inline" /> And Precision
          </h2>
        </div>
        <div className="w-full bg-primary rounded-xl p-6 sm:p-10 md:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.04)]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="md:col-span-7 -pb-3 w-full relative h-70 rounded-lg overflow-hidden bg-primary">
              <Image
                src={activeData.image}
                alt={activeData.title}
                fill
                sizes="(max-width: 768px) 100vw, 55vw"
                style={{ objectFit: "cover", objectPosition: "center" }}
                className="object-cover object-center w-full h-full"
                priority
              />
            </div>
            <div className="md:col-span-5 flex flex-col justify-center text-left">
              <span className="font-instrumentserif text-3xl sm:text-4xl text-brown font-light leading-none block mb-2 tracking-wide">
                {activeData.year}
              </span>
              <h3 className="font-instrumentserif italic font-medium text-2xl sm:text-3xl text-light mb-5 tracking-wide">
                {activeData.title}
              </h3>
              <p className="text-Pinball font-light text-sm sm:text-[15px] leading-relaxed tracking-wide max-w-sm antialiased">
                {activeData.description}
              </p>
            </div>
          </div>
          <div className="mt-16  flex flex-col sm:flex-row items-start justify-between gap-8">
            <div className="hidden relative w-full lg:flex items-center justify-between">
              <div className="absolute left-6 right-4 h-[1.5px] bg-bg-light-blue top-3.75 z-0" />
              <div
                className="absolute left-6 h-0.5 bg-bg-blue top-3.75 z-0 transition-all duration-500 ease-out hidden sm:block"
                style={{
                  width: `${(currentIndex / (journeyData.length - 1)) * 95}%`,
                }}
              />

              {journeyData.map((item, index) => {
                const isActive = index === currentIndex;
                return (
                  <button
                    key={item.year}
                    onClick={() => setCurrentIndex(index)}
                    className="relative z-10 flex flex-col items-center group focus:outline-none"
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent">
                      <div
                        className={`rounded-full transition-all duration-500 ${
                          isActive
                            ? "w-4 h-4 bg-bg-blue shadow-[0_0_0_6px_var(--color-bg-light-blue),0_0_0_8px_var(--color-bg-blue)]"
                            : "w-3 h-3 bg-bg-blue group-hover:bg-light"
                        }`}
                      />
                    </div>
                    <span
                      className={`font-instrumentserif text-xl sm:text-2xl mt-3 block transition-colors duration-300 ${isActive ? "text-light italic font-medium" : "text-bg-blue group-hover:text-bg-blue/40"}`}
                    >
                      {item.year}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex -mt-2 m-auto items-center gap-3 shrink-0">
              <button
                onClick={handlePrev}
                className="w-11 h-11 rounded-full border border-bg-light-blue flex items-center justify-center bg-white text-scroll-text hover:bg-scroll-text hover:text-light hover:border-scroll-text active:scale-95 transition-all duration-300 cursor-pointer"
                aria-label="Previous Slide"
              >
                <ChevronLeft size={16} strokeWidth={1.5} />
              </button>
              <button
                onClick={handleNext}
                className="w-11 h-11 rounded-full border border-bg-light-blue flex items-center justify-center bg-white text-scroll-text hover:bg-scroll-text hover:text-light hover:border-scroll-text active:scale-95 transition-all duration-300 cursor-pointer"
                aria-label="Next Slide"
              >
                <ChevronRight size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OurJourney;
