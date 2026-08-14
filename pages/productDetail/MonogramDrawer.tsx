import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

export interface MonogramConfig {
    enabled: boolean;
    text: string;
    placement_id: number;
    placement_name: string;
    color_id: number;
    color_name: string;
    font_id: number;
    font_name: string;
    extra_price: number;
}

interface MonogramDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: MonogramConfig | null) => void;
    initialConfig: MonogramConfig | null;
    proTypeId?: number | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const resolveImageUrl = (img: string) => {
    if (!img) return "";
    if (img.startsWith("/uploads")) {
        return `${API_URL}${img}`;
    }
    return img;
};

export default function MonogramDrawer({ isOpen, onClose, onSave, initialConfig, proTypeId }: MonogramDrawerProps) {
    const [placements, setPlacements] = useState<any[]>([]);
    const [colors, setColors] = useState<any[]>([]);
    const [fonts, setFonts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [placementId, setPlacementId] = useState<number | null>(null);
    const [text, setText] = useState('');
    const [colorId, setColorId] = useState<number | null>(null);
    const [fontId, setFontId] = useState<number | null>(null);

    // Fetch API Data — re-fetch whenever drawer opens or proTypeId changes
    useEffect(() => {
        if (!isOpen) return;
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const typeParam = proTypeId ? `?pro_type_id=${proTypeId}` : '';
                const [pRes, cRes, fRes] = await Promise.all([
                    fetch(`${API_URL}/api/monogram/placements${typeParam}`),
                    fetch(`${API_URL}/api/monogram/colors${typeParam}`),
                    fetch(`${API_URL}/api/monogram/fonts${typeParam}`)
                ]);

                const pData = await pRes.json();
                const cData = await cRes.json();
                const fData = await fRes.json();

                if (pData.success && cData.success && fData.success) {
                    // Prepend a "None" option to placements manually to match existing flow
                    const fetchedPlacements = [
                        { placement_id: -1, placement_name: 'None', extra_price: 0, placement_image: '/images/monogram/none_monogram.webp' },
                        ...pData.data
                    ];
                    setPlacements(fetchedPlacements);
                    setColors(cData.data);
                    setFonts(fData.data);

                    if (!initialConfig?.enabled) {
                        setPlacementId(-1);
                        if (cData.data.length > 0) setColorId(cData.data[0].color_id);
                        if (fData.data.length > 0) setFontId(fData.data[0].font_id);
                    }
                } else {
                    setError("Failed to fetch monogram options.");
                }
            } catch (err) {
                console.error("Monogram API Error:", err);
                setError("Network error fetching options.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isOpen, proTypeId]);

    // Sync initial state when opened
    useEffect(() => {
        if (isOpen && initialConfig && initialConfig.enabled) {
            setPlacementId(initialConfig.placement_id);
            setText(initialConfig.text);
            setColorId(initialConfig.color_id);
            setFontId(initialConfig.font_id);
        }
    }, [isOpen, initialConfig]);

    // Derived values
    const currentPlacement = placements.find(p => p.placement_id === placementId) || placements[0];
    const isSaveDisabled = placementId !== -1 && text.trim().length === 0;

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9.\s]/g, '');
        if (val.length <= 4) {
            setText(val);
        }
    };

    const handleSave = () => {
        if (placementId === -1) {
            // "Remove Monogram" or None selected
            onSave(null);
            onClose();
            return;
        }

        const selectedColor = colors.find(c => c.color_id === colorId);
        const selectedFont = fonts.find(f => f.font_id === fontId);

        onSave({
            enabled: true,
            text: text.trim(),
            placement_id: currentPlacement.placement_id,
            placement_name: currentPlacement.placement_name,
            color_id: selectedColor?.color_id || 0,
            color_name: selectedColor?.color_name || '',
            font_id: selectedFont?.font_id || 0,
            font_name: selectedFont?.font_name || '',
            extra_price: currentPlacement.extra_price
        });
        
        if (currentPlacement.extra_price > 0) {
            toast.success(`Additional charge Rs. ${currentPlacement.extra_price} will be added for monogram customization.`, {
                duration: 4000,
                position: 'bottom-center'
            });
        }
        
        onClose();
    };

    const handleRemove = () => {
        onSave(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex font-sans">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#0A1633]/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-[420px] bg-[#0A1633] h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-out animate-slide-right ml-auto">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#1A2C5B]">
                    <h2 className="text-[#D4AF37] font-instrumentserif text-2xl sm:text-3xl tracking-wide uppercase">
                        Monogram
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white/60 hover:text-white transition-colors"
                        aria-label="Close Drawer"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-8 custom-scrollbar">
                    {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                            <span className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase">Loading options...</span>
                        </div>
                    ) : error ? (
                        <div className="flex-1 flex items-center justify-center text-red-400 text-sm font-medium">
                            {error}
                        </div>
                    ) : (
                        <>
                            {/* Placement Section */}
                            <div className="flex flex-col gap-4">
                                <label className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase">
                                    Placement
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {placements.map((p) => (
                                        <button
                                            key={p.placement_id}
                                            onClick={() => setPlacementId(p.placement_id)}
                                            className={`flex flex-col items-center p-3 rounded-lg border transition-all duration-200 ${placementId === p.placement_id
                                                ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                                                : 'border-white/10 hover:border-white/30 bg-white/5'
                                                }`}
                                        >
                                            <div className="relative w-full aspect-square mb-2 overflow-hidden rounded">
                                                <Image
                                                    src={resolveImageUrl(p.placement_image)}
                                                    alt={p.placement_name}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                            <span className={`text-[11px] font-semibold tracking-wide ${placementId === p.placement_id ? 'text-[#D4AF37]' : 'text-white/80'}`}>
                                                {p.placement_name}
                                            </span>
                                            <span className="text-[10px] text-white/50 mt-1">
                                                {p.extra_price > 0 ? `+₹${p.extra_price}` : 'Free'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Conditional Sections based on Placement */}
                            <div className={`flex flex-col gap-8 transition-opacity duration-300 ${placementId === -1 || placementId === null ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>

                                {/* Text Section */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase">
                                            Text *
                                        </label>
                                        <span className="text-xs text-white/40 font-mono">
                                            {text.length} / 4
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        value={text}
                                        onChange={handleTextChange}
                                        placeholder="Enter up to 4 letters"
                                        className="w-full h-12 bg-transparent border-b border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors text-lg font-medium uppercase"
                                        tabIndex={placementId === -1 ? -1 : 0}
                                    />
                                    <p className="text-[11px] text-white/50 leading-relaxed">
                                        The monogram will be embroidered exactly as entered.
                                    </p>
                                </div>

                                {/* Color Section */}
                                <div className="flex flex-col gap-4">
                                    <label className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase">
                                        Color
                                    </label>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                        {colors.map((c) => (
                                            <button
                                                key={c.color_id}
                                                onClick={() => setColorId(c.color_id)}
                                                className="flex items-center gap-3 w-full text-left group"
                                                tabIndex={placementId === -1 ? -1 : 0}
                                            >
                                                <div className="flex-shrink-0 flex items-center justify-center w-4 h-4 mb-6">
                                                    {colorId === c.color_id ? (
                                                        <span className="text-[#D4AF37] text-sm font-bold leading-none">✓</span>
                                                    ) : (
                                                        <div className="w-3.5 h-3.5 rounded-full border border-white/40 group-hover:border-white/70 transition-colors" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-1.5 flex-1">
                                                    <div className={`relative w-full h-[60px] border transition-all duration-200 ${colorId === c.color_id ? 'border-[#D4AF37]' : 'border-white/10'}`}>
                                                        <Image
                                                            src={resolveImageUrl(c.color_image)}
                                                            alt={c.color_name}
                                                            fill
                                                            className="object-cover"
                                                            unoptimized
                                                        />
                                                    </div>
                                                    <span className={`text-[11px] tracking-wide ${colorId === c.color_id ? 'text-[#D4AF37] font-semibold' : 'text-white/60 font-medium'}`}>
                                                        {c.color_name}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Font Section */}
                                <div className="flex flex-col gap-4">
                                    <label className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase">
                                        Font
                                    </label>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                        {fonts.map((f) => (
                                            <button
                                                key={f.font_id}
                                                onClick={() => setFontId(f.font_id)}
                                                className="flex items-center gap-3 w-full text-left group"
                                                tabIndex={placementId === -1 ? -1 : 0}
                                            >
                                                <div className="flex-shrink-0 flex items-center justify-center w-4 h-4 mb-6">
                                                    {fontId === f.font_id ? (
                                                        <span className="text-[#D4AF37] text-sm font-bold leading-none">✓</span>
                                                    ) : (
                                                        <div className="w-3.5 h-3.5 rounded-full border border-white/40 group-hover:border-white/70 transition-colors" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-1.5 flex-1">
                                                    <div className={`relative w-full h-[60px] bg-white flex items-center justify-center border transition-all duration-200 ${fontId === f.font_id ? 'border-[#D4AF37]' : 'border-white/10'}`}>
                                                        <div className="relative w-16 h-10">
                                                            <Image
                                                                src={resolveImageUrl(f.font_preview_image)}
                                                                alt={f.font_name}
                                                                fill
                                                                className="object-contain"
                                                                unoptimized
                                                            />
                                                        </div>
                                                    </div>
                                                    <span className={`text-[11px] tracking-wide ${fontId === f.font_id ? 'text-[#D4AF37] font-semibold' : 'text-white/60 font-medium'}`}>
                                                        {f.font_name}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Save Button */}
                <div className="p-6 border-t border-[#1A2C5B] bg-[#0A1633] flex flex-col gap-3">
                    <button
                        onClick={handleSave}
                        disabled={isSaveDisabled || loading || error !== null}
                        className={`w-full h-12 rounded flex items-center justify-center text-sm font-semibold tracking-widest uppercase transition-all duration-200 ${isSaveDisabled || loading || error !== null
                            ? 'bg-white/10 text-white/30 cursor-not-allowed'
                            : 'bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0A1633] shadow-lg shadow-[#D4AF37]/20'
                            }`}
                    >
                        Save {currentPlacement?.extra_price > 0 ? `(+₹${currentPlacement.extra_price})` : ''}
                    </button>
                    {initialConfig?.enabled && (
                        <button
                            onClick={handleRemove}
                            className="w-full h-10 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center justify-center text-xs font-semibold tracking-widest uppercase transition-colors"
                        >
                            Remove Monogram
                        </button>
                    )}
                </div>

            </div>

            {/* Custom Animation Styles */}
            <style jsx>{`
                @keyframes slideRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-right {
                    animation: slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(212, 175, 55, 0.3);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(212, 175, 55, 0.5);
                }
            `}</style>
        </div>
    );
}
