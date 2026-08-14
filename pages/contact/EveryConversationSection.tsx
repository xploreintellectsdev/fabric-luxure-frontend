import React from 'react'
import Image from 'next/image'

function EveryConversationSection({ previewConfig, previewMode }: { previewConfig?: any, previewMode?: boolean }) {
    const defaultTitle = "Every conversation starts here.";
    const defaultContent = "Looking for the right fabric or need help choosing from our collection? Reach out to us. We'll guide you through every step with honest advice and reliable support.";
    
    const activeConfig = previewConfig || { section_title: defaultTitle, section_content: defaultContent, is_enabled: 1 };

    if (!previewMode && activeConfig.is_enabled === 0) {
        return null;
    }

    return (
        <div className='relative mx-auto mt-20 bg-primary w-full max-w-4xl rounded-xl p-8 sm:p-12 md:p-16 flex flex-col items-center justify-center text-center shadow-sm mb-10'>
            <h2 className='mb-10 text-center uppercase font-instrumentserif text-lg md:text-2xl lg:text-2xl text-light leading-[1.1] transform scale-y-150 origin-center'>
                {activeConfig.section_title || defaultTitle}
            </h2>
            <p className='text-Pinball text-sm sm:text-base md:text-lg lg:text-xl font-normal leading-relaxed tracking-wide max-w-3xl pb-6 md:pb-8 select-none'>
                {activeConfig.section_content || defaultContent}
            </p>
            <div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-20 w-24 h-24 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border-[3px] sm:border-[5px] border-[#8A6500] flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer"
                style={{
                    background: "linear-gradient(135deg, #8B5E00 0%, #C89B2B 25%, #F7E08A 50%, #C89B2B 75%, #8B5E00 100%)",
                    boxShadow: "0 10px 25px -5px rgba(200, 155, 43, 0.4), 0 8px 10px -6px rgba(200, 155, 43, 0.4)"
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 35px 5px rgba(247, 224, 138, 0.65), 0 10px 25px -5px rgba(200, 155, 43, 0.5)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(200, 155, 43, 0.4), 0 8px 10px -6px rgba(200, 155, 43, 0.4)";
                }}
            >
                {/* Inner Circular Ring */}
                <div className="absolute inset-1 rounded-full border border-white/25 z-0" />

                <div className="relative w-[84%] h-[84%] z-10 flex items-center justify-center">
                    <Image
                        src="/images/FL New Logo Final.png"
                        alt="VL Global Premium Gold Seal Certification Badge"
                        width={160}
                        height={160}
                        priority
                        className="w-full h-full object-contain select-none pointer-events-none"
                    />
                </div>
            </div>
        </div>
    )
}

export default EveryConversationSection
