"use client"
import React, { useState, useEffect } from 'react'
import { CirclePlus, CircleMinus } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface FAQItem {
    faq_id: number;
    question: string;
    answer: string;
}

interface FAQProps {
    previewConfig?: any;
}

function FAQ({ previewConfig }: FAQProps = {}) {
    const [cmsConfig, setCmsConfig] = useState<any>({
        section_name: "FREQUENTLY ASKED QUESTIONS",
        is_enabled: 1
    });

    const [faqData, setFaqData] = useState<FAQItem[]>([]);
    const [openId, setOpenId] = useState<number | null>(null);

    useEffect(() => {
        const fetchCMSConfig = async () => {
            if (previewConfig) return;
            try {
                const res = await fetch(`${API_URL}/api/home-page/faq`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setCmsConfig(data.data);
                    }
                }
            } catch (error) {
                console.error("Error fetching FAQ CMS config:", error);
            }
        };

        fetchCMSConfig();
    }, [previewConfig]);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const res = await fetch(`${API_URL}/api/faqs`);
                const data = await res.json();
                if (res.ok && data.success) {
                    setFaqData(data.data);
                    if (data.data.length > 0) {
                        setOpenId(data.data[0].faq_id);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch FAQs:", err);
            }
        };
        fetchFaqs();
    }, []);

    const toggleFaq = (id: number) => {
        setOpenId(openId === id ? null : id)
    }

    const activeConfig = previewConfig || cmsConfig;

    if (activeConfig.is_enabled === 0 && !previewConfig) {
        return null;
    }

    return (
        <section className='bg-tertiary px-6 sm:px-12 lg:px-16 py-16 md:py-24 w-full flex flex-col items-center justify-center overflow-hidden'>
            <div className='max-w-4xl w-full flex flex-col items-center'>
                <h2 className='text-center uppercase font-instrumentserif text-2xl md:text-3xl lg:text-4xl text-light leading-[1.1] transform scale-y-150 origin-center'>
                    {activeConfig.section_name}
                </h2>
                <div className='w-full border-t mt-20 border-bg-light-blue flex flex-col'>
                    {faqData.map((faq) => {
                        const isOpen = openId === faq.faq_id
                        return (
                            <div
                                key={faq.faq_id}
                                className='w-full border-b border-bg-light-blue  py-6 md:py-8 flex flex-col select-none'
                            >
                                <div
                                    onClick={() => toggleFaq(faq.faq_id)}
                                    className='w-full flex items-center justify-between gap-6 cursor-pointer'
                                >
                                    <h3 className={`text-lg sm:text-2xl font-medium tracking-wide transition-colors duration-200 ${isOpen ? 'text-brown' : 'text-light'}`}>
                                        {faq.question}
                                    </h3>
                                    <div className='w-6 h-6 rounded-full text-bg-blue shrink-0 transition-transform duration-200'>
                                        {isOpen ? (
                                            <CircleMinus size={24} strokeWidth={1.5} />
                                        ) : (
                                            <CirclePlus size={24} strokeWidth={1.5} />
                                        )}
                                    </div>
                                </div>
                                <div
                                    className={`grid transition-all duration-300 ease-in-out text-[13px] sm:text-base lg:text-lg leading-relaxed tracking-wide max-w-3xl
                                        ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}
                                >
                                    <div className='overflow-hidden'>
                                        <p className='text-Pinball opacity-80 leading-relaxed font-normal'>
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export default FAQ
