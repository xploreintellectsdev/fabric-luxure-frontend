"use client";

import React, { useState, useEffect } from 'react'
import ContactInformationSection from './ContactInformationSection'
import ContactFormSection from './ContactFormSection'
import EveryConversationSection from './EveryConversationSection'

function Contactinfo({ previewConfig, previewMode }: { previewConfig?: any, previewMode?: boolean }) {
    const [dbConfig, setDbConfig] = useState<any>(null);
    const [dbConversationConfig, setDbConversationConfig] = useState<any>(null);
    const [loadingConfig, setLoadingConfig] = useState(!previewMode);

    useEffect(() => {
        const fetchConfig = async () => {
            if (previewMode) return;
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
                
                const [infoRes, conversationRes] = await Promise.all([
                    fetch(`${API_URL}/api/contact-page/info`, { cache: 'no-store' }),
                    fetch(`${API_URL}/api/contact-page/conversation-config`, { cache: 'no-store' })
                ]);
                
                const jsonInfo = await infoRes.json();
                const jsonConversation = await conversationRes.json();

                if (jsonInfo.success && jsonInfo.data) {
                    setDbConfig(jsonInfo.data);
                }
                
                if (jsonConversation.success && jsonConversation.data) {
                    setDbConversationConfig(jsonConversation.data);
                }
            } catch (err) {
                console.error("Failed to fetch contact info:", err);
            } finally {
                setLoadingConfig(false);
            }
        };
        fetchConfig();
    }, [previewMode]);

    const activeConfig = previewConfig || dbConfig;

    if (loadingConfig && !previewMode) {
        return (
            <div className='bg-tertiary px-6 sm:px-12 lg:px-16 py-16 w-full min-h-[400px] flex items-center justify-center'>
                <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const showContactInfo = activeConfig && (previewMode || activeConfig.is_enabled === 1);

    // If it's preview mode, it will just render the wrapper here, but we are supposed to render the separate sections in the admin now.
    // We will just return the full page here for the public view. The admin will import the specific sections directly.

    return (
        <div className='bg-tertiary px-6 sm:px-12 lg:px-16 py-16 w-full font-sans text-charcoal'>
            <div className='w-full mx-auto'>
                {showContactInfo && <ContactInformationSection activeConfig={activeConfig} />}
                
                {/* Form Section - Later we can connect this to a DB config */}
                <ContactFormSection />
                
                {/* Conversation Section */}
                <EveryConversationSection previewConfig={dbConversationConfig} previewMode={false} />
            </div>
        </div>
    )
}

export default Contactinfo
