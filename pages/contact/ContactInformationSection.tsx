import React from 'react'
import { MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

function ContactInformationSection({ activeConfig }: { activeConfig: any }) {
    if (!activeConfig) return null;

    return (
        <div className="w-full">
            <h2 className='text-left uppercase font-instrumentserif text-lg md:text-2xl lg:text-2xl text-brown leading-[1.1] transform scale-y-150 origin-center'>
                {activeConfig.small_heading || "CONTACT INFORMATION"}
            </h2>

            <h1 className='mt-2 text-left font-instrumentserif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-light transform scale-y-110 origin-left mb-12 tracking-tight'>
                {activeConfig.main_heading || `Let's Start A Conversation`}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                {[
                    { id: 1, icon: Phone, Name: "PHONE NUMBER", Value: activeConfig.phone_number || "7305015970", hoverText: "Call Us", link: `tel:${activeConfig.phone_number || '7305015970'}` },
                    { id: 2, icon: Mail, Name: "EMAIL ID", Value: activeConfig.email || "support@fabricluxure.com", hoverText: "Send a mail", link: `mailto:${activeConfig.email || 'support@fabricluxure.com'}` },
                    { id: 3, icon: MapPin, Name: "LOCATION", Value: activeConfig.address || "36/11, CHB Colony Street No-04, Tiruchengode, Namakkal-637211 Tamil Nadu.", hoverText: "Get Directions", link: activeConfig.map_url || "https://maps.app.goo.gl/TDbC7gTuZhS57MxS6" }
                ].map((item) => {
                    // Fix Google Maps redirect logic
                    let href = item.link;
                    if (item.id === 3 && !href.startsWith('http://') && !href.startsWith('https://')) {
                        href = `https://${href}`;
                    }

                    return (
                        <Link
                            href={href}
                            key={item.id}
                            className="group relative bg-primary rounded-xl p-6 cursor-pointer border border-white/5 transition-all duration-300 hover:bg-[#0b172a] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:border-white/10 block"
                            {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <item.icon className="w-4 h-4 text-light stroke-[1.5]" />
                                    <span className="text-sm tracking-wider font-semibold uppercase text-light">{item.Name}</span>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-light/80 group-hover:text-light group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 stroke-[1.5]" />
                            </div>
                            <p className="text-sm sm:text-base text-Pinball mt-4 font-normal break-words">{item.Value}</p>
                            <div className='absolute opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none -top-3.5 group-hover:-top-4.5 left-1/2 transform -translate-x-1/2 bg-[#B37E4A] text-light rounded-full px-3 py-1 text-[10px] uppercase font-medium tracking-widest whitespace-nowrap shadow-xs'>
                                {item.hoverText}
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

export default ContactInformationSection
