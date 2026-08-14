import React from 'react'
import Image from 'next/image'

function MarqueeList({lists = []}) {
    const combinedList = [...lists, ...lists, ...lists, ...lists,...lists];
    return (
        <div className="absolute bottom-0 left-0 w-full z-20">
            <div className="flex items-center justify-center gap-10 scroll-container bg-white/10 backdrop-blur-md border-t border-white/20 py-4 w-full overflow-hidden shadow-[0_-8px_32px_rgba(0,0,0,0.1)]">
                {combinedList.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 scroll-text whitespace-nowrap"
                    >
                        <Image src="/images/sparkle.svg" alt="Spark" width={24} height={24} />
                        <p className="text-white font-medium text-lg">{item}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MarqueeList
