import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCart } from '../context/cartContext';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? `http://${window.location.hostname}:5000` : "http://localhost:5000");

interface Product {
    pro_id: number;
    cat_id?: number;
    pro_name: string;
    price: number;
    pro_img: string;
    cover_description?: string;
    category_name?: string;
    product_type_name?: string;
    productTypeId?: number;
    standard_size?: string;
    stitching_price?: number | string;
}

interface QuickAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

export default function QuickAddModal({ isOpen, onClose, product }: QuickAddModalProps) {
    const { addToCart } = useCart();

    const pType = (product?.product_type_name || "").toLowerCase();
    const isShirt = !product?.product_type_name || pType === "shirt" || pType === "shirts" || Number(product?.productTypeId) === 1;
    const isPant = pType === "pant" || pType === "pants";
    const isShorts = pType === "shorts" || pType === "short";
    const isBlazer = pType === "blazer" || pType === "blazers" || Number(product?.productTypeId) === 21;
    const isFabric = pType === "fabric" || pType === "fabrics";

    const [fitStyle, setFitStyle] = useState("");
    const [fitStyles, setFitStyles] = useState<any[]>([]);

    const [selectedSize, setSelectedSize] = useState('S');
    const [standardSizes, setStandardSizes] = useState<any[]>([]);

    const [selectedSleeve, setSelectedSleeve] = useState("");
    const [sleeves, setSleeves] = useState<any[]>([]);

    const [selectedMeter, setSelectedMeter] = useState("1.5");
    const [customMeter, setCustomMeter] = useState("");

    // Custom Measurements
    const [customMeasurements, setCustomMeasurements] = useState({
        chest: '', length: '', shoulder: '', sleeve: '',
        waist: '', inseam: '', hip: '', thigh: '', knee: '', leg_opening: ''
    });

    const handleNumberInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === "" || /^[0-9]*\.?[0-9]{0,2}$/.test(val)) {
            setCustomMeasurements(prev => ({ ...prev, [field]: val }));
        }
    };

    const handleMeterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === "" || /^[0-9]*\.?[0-9]{0,2}$/.test(val)) {
            setCustomMeter(val);
        }
    };

    // Reset state when product changes
    useEffect(() => {
        if (isOpen) {
            setCustomMeasurements({
                chest: '', length: '', shoulder: '', sleeve: '',
                waist: '', inseam: '', hip: '', thigh: '', knee: '', leg_opening: ''
            });
            setCustomMeter('');
            setSelectedMeter("1.5");
            setSelectedSize('S');
            setFitStyle("");
            setSelectedSleeve("");
        }
    }, [isOpen, product]);

    // Fetch Fit Styles
    useEffect(() => {
        if (!isOpen || !product || isFabric) return;

        let active = true;
        const fetchFitStyles = async () => {
            try {
                const typeName = isBlazer ? 'Blazers' : isShorts ? 'Shorts' : (isPant ? 'Pant' : 'Shirt');
                const res = await fetch(`${API_URL}/api/admin/fit-styles/active?product_type=${typeName}`);
                const data = await res.json();
                if (active && res.ok && data.success && data.fitStyles) {
                    setFitStyles(data.fitStyles);
                    if (data.fitStyles.length > 0) {
                        setFitStyle(data.fitStyles[0].fit_style_name);
                    }
                }
            } catch (err) {
                console.error("Error fetching fit styles:", err);
            }
        };
        fetchFitStyles();
        return () => { active = false; };
    }, [isOpen, product, isBlazer, isShorts, isPant, isShirt]);

    // Fetch Sleeves (for Shirts only)
    useEffect(() => {
        if (!isOpen || !product || !isShirt) return;

        let active = true;
        const fetchSleeves = async () => {
            try {
                const res = await fetch(`${API_URL}/api/admin/sleeves/active/1`);
                const data = await res.json();
                if (active && res.ok && data.success && data.sleeves) {
                    setSleeves(data.sleeves);
                    if (data.sleeves.length > 0) {
                        setSelectedSleeve(data.sleeves[0].sleeve_name);
                    }
                }
            } catch (err) {
                console.error("Error fetching sleeves:", err);
            }
        };
        fetchSleeves();
        return () => { active = false; };
    }, [isOpen, product, isShirt]);

    // Fetch Sizes
    useEffect(() => {
        if (!isOpen || !product || isFabric || !fitStyle) return;

        let active = true;
        const fetchSizesForFit = async () => {
            try {
                const typeName = isBlazer ? 'Blazers' : isShorts ? 'Shorts' : (isPant ? 'Pant' : 'Shirt');
                const res = await fetch(`${API_URL}/api/admin/size-charts/active?product_type=${typeName}&fitStyle=${fitStyle}`);
                const data = await res.json();
                if (active && res.ok && data.success && data.data?.length > 0) {
                    setStandardSizes(data.data);
                    setSelectedSize(data.data[0].size_name);
                } else if (active) {
                    setStandardSizes([
                        { size_chart_id: 1, size_name: 'S' },
                        { size_chart_id: 2, size_name: 'M' },
                        { size_chart_id: 3, size_name: 'L' },
                        { size_chart_id: 4, size_name: 'XL' }
                    ]);
                    setSelectedSize('S');
                }
            } catch (err) {
                console.error("Failed to fetch sizes:", err);
                if (active) {
                    setStandardSizes([
                        { size_chart_id: 1, size_name: 'S' },
                        { size_chart_id: 2, size_name: 'M' },
                        { size_chart_id: 3, size_name: 'L' },
                        { size_chart_id: 4, size_name: 'XL' }
                    ]);
                    setSelectedSize('S');
                }
            }
        };
        fetchSizesForFit();
        return () => { active = false; };
    }, [isOpen, product, fitStyle, isBlazer, isShorts, isPant, isShirt, isFabric]);


    const confirmCart = async () => {
        if (!product) return;

        const cartData: any = {
            pro_id: product.pro_id,
            quantity: 1,
            pro_name: product.pro_name,
            price: product.price,
            pro_img: product.pro_img,
            cover_description: product.cover_description,
            pro_type_name: product.product_type_name,
      stitching_price: product.stitching_price || (isShirt ? "Shirt" : "")
        };

        if (isFabric) {
            cartData.selected_meter = customMeter ? Number(customMeter) : Number(selectedMeter);
            if (!cartData.selected_meter || cartData.selected_meter <= 0) {
                toast.error("Please select or enter a valid meter.");
                return;
            }
            cartData.is_custom = 0;
        } else {
            cartData.fit_style = fitStyle;
            if (isShirt) {
                cartData.selected_sleeve = selectedSleeve;
            }

            if (selectedSize === 'CUSTOM') {
                const reqFields = isBlazer ? ['shoulder', 'chest', 'length', 'sleeve', 'waist'] :
                    isShirt ? ['chest', 'length', 'shoulder', 'sleeve'] :
                        isShorts ? ['waist', 'inseam', 'hip', 'thigh', 'leg_opening'] :
                            ['waist', 'inseam', 'hip', 'thigh', 'knee', 'leg_opening'];

                const missing = reqFields.find(f => !customMeasurements[f as keyof typeof customMeasurements] || parseFloat(customMeasurements[f as keyof typeof customMeasurements]) <= 0);

                if (missing) {
                    toast.error(`Please enter valid positive measurements for all custom fields.`);
                    return;
                }

                cartData.selected_size = 'CUSTOM';
                cartData.is_custom = 1;

                if (isBlazer) {
                    cartData.custom_shoulder = customMeasurements.shoulder;
                    cartData.custom_chest = customMeasurements.chest;
                    cartData.custom_length = customMeasurements.length;
                    cartData.custom_sleeve = customMeasurements.sleeve;
                    cartData.custom_waist = customMeasurements.waist;
                } else if (isShirt) {
                    cartData.custom_chest = customMeasurements.chest;
                    cartData.custom_length = customMeasurements.length;
                    cartData.custom_shoulder = customMeasurements.shoulder;
                    cartData.custom_sleeve = customMeasurements.sleeve;
                } else if (isShorts) {
                    cartData.custom_waist = customMeasurements.waist;
                    cartData.custom_inseam = customMeasurements.inseam;
                    cartData.custom_hip = customMeasurements.hip;
                    cartData.custom_thigh = customMeasurements.thigh;
                    cartData.custom_leg_opening = customMeasurements.leg_opening;
                } else {
                    cartData.custom_waist = customMeasurements.waist;
                    cartData.custom_inseam = customMeasurements.inseam;
                    cartData.custom_hip = customMeasurements.hip;
                    cartData.custom_thigh = customMeasurements.thigh;
                    cartData.custom_knee = customMeasurements.knee;
                    cartData.custom_leg_opening = customMeasurements.leg_opening;
                }
            } else {
                cartData.selected_size = selectedSize;
                cartData.is_custom = 0;
            }
        }

        await addToCart(cartData);
        onClose();
    };

    if (!isOpen || !product) return null;

    const renderCustomFields = () => {
        let fields: { label: string, key: keyof typeof customMeasurements }[] = [];
        if (isBlazer) {
            fields = [
                { label: 'Chest', key: 'chest' },
                { label: 'Mid Section', key: 'waist' },
                { label: 'Shirt Length', key: 'length' },
                { label: 'Shoulder', key: 'shoulder' },
                { label: 'Sleeve Length', key: 'sleeve' }
            ];
        } else if (isShirt) {
            fields = [
                { label: 'Chest', key: 'chest' },
                { label: 'Length', key: 'length' },
                { label: 'Shoulder', key: 'shoulder' },
                { label: 'Sleeve', key: 'sleeve' }
            ];
        } else if (isShorts) {
            fields = [
                { label: 'Waist', key: 'waist' },
                { label: 'Inseam', key: 'inseam' },
                { label: 'Hip', key: 'hip' },
                { label: 'Thigh', key: 'thigh' },
                { label: 'Leg Opening', key: 'leg_opening' }
            ];
        } else {
            fields = [
                { label: 'Waist', key: 'waist' },
                { label: 'Inseam', key: 'inseam' },
                { label: 'Hip', key: 'hip' },
                { label: 'Thigh', key: 'thigh' },
                { label: 'Knee', key: 'knee' },
                { label: 'Leg Opening', key: 'leg_opening' }
            ];
        }

        return (
            <div className="bg-[#07122a] border border-white/5 rounded-md p-4 grid grid-cols-2 gap-3 mb-6">
                {fields.map((field) => (
                    <div key={field.key} className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-wider text-[#D3D3D3]/60">{field.label} *</label>
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                inputMode="decimal"
                                value={customMeasurements[field.key]}
                                onChange={handleNumberInputChange(field.key)}
                                placeholder="0.0"
                                className="w-full pl-2 pr-10 py-1 h-8 text-xs placeholder:text-[#D3D3D3]/30 text-white rounded border border-white/10 bg-[#08142c] focus:outline-none focus:border-[#D4AF37] transition-colors"
                            />
                            <span className="absolute right-2 text-[8px] text-[#D3D3D3]/55 font-semibold select-none">
                                In
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal Content */}
            <div className="relative w-full max-w-sm mx-4 bg-[#0A192F] border border-white/10 shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-Pinball hover:text-white transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="mb-4">
                        <h2 className="text-sm font-semibold tracking-wider text-Pinball uppercase flex items-center justify-between">
                            Select {isBlazer ? "Blazer" : isShirt ? "Shirt" : isPant ? "Pant" : isShorts ? "Shorts" : "Fabric"} Options
                        </h2>
                    </div>
                    <p className="text-xs text-Pinball mb-4 truncate">{product.pro_name}</p>

                    {isFabric ? (
                        <>
                            <div className="flex flex-col gap-1.5 mb-2">
                                <label className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold font-mono">Select Meters</label>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {["1", "1.5", "2", "3"].map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => { setSelectedMeter(m); setCustomMeter(""); }}
                                        className={`px-4 h-10 text-xs font-semibold rounded-md border transition-all flex items-center justify-center cursor-pointer ${selectedMeter === m && !customMeter
                                            ? 'bg-[#EBE3D5] border-transparent text-black font-bold'
                                            : 'border-white/10 bg-[#08142c] text-light hover:border-white/30'
                                            }`}
                                    >
                                        {m} METER
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-col gap-1.5 mb-6">
                                <label className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold font-mono">Custom Length</label>
                                <div className="relative flex items-center max-w-[120px]">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={customMeter}
                                        onChange={handleMeterChange}
                                        placeholder="Enter length"
                                        className="w-full pl-3 pr-10 py-2 h-10 text-xs placeholder:text-[#D3D3D3]/30 text-white rounded border border-white/10 bg-[#08142c] focus:outline-none focus:border-[#D4AF37] transition-colors"
                                    />
                                    <span className="absolute right-3 text-[9px] text-[#D3D3D3]/55 font-semibold select-none">METER</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Fit Style */}
                            <div className="flex flex-col gap-1.5 mb-4">
                                <label className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">Select Fit Style</label>
                                <select
                                    value={fitStyle}
                                    onChange={(e) => setFitStyle(e.target.value)}
                                    className="w-full h-10 px-3 text-xs font-semibold rounded-md border border-white/10 bg-[#08142c] text-light focus:outline-none focus:border-[#2b6cb0] transition-colors cursor-pointer"
                                >
                                    {fitStyles.map(fit => (
                                        <option key={fit.fit_style_id} value={fit.fit_style_name}>{fit.fit_style_name}</option>
                                    ))}
                                    {fitStyles.length === 0 && (
                                        <>
                                            <option value="Classic">Classic</option>
                                            <option value="Slim">Slim</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            {/* Sleeves (Shirts Only) */}
                            {isShirt && (
                                <div className="flex flex-col gap-1.5 mb-4">
                                    <label className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">Select Sleeve</label>
                                    <div className="flex flex-wrap gap-2">
                                        {sleeves.map((sleeve) => (
                                            <button
                                                key={sleeve.sleeve_id}
                                                type="button"
                                                onClick={() => setSelectedSleeve(sleeve.sleeve_name)}
                                                className={`px-4 h-10 text-xs font-semibold rounded-md border transition-all uppercase flex items-center justify-center cursor-pointer ${selectedSleeve === sleeve.sleeve_name
                                                    ? 'bg-[#EBE3D5] border-transparent text-black font-bold'
                                                    : 'border-white/10 bg-[#08142c] text-light hover:border-white/30'
                                                    }`}
                                            >
                                                {sleeve.sleeve_name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Size */}
                            <div className="flex flex-col gap-1.5 mb-2">
                                <label className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold font-mono">Select Size</label>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {standardSizes.map((sizeObj, idx) => (
                                    <button
                                        key={sizeObj.size_chart_id || idx}
                                        type="button"
                                        onClick={() => setSelectedSize(sizeObj.size_name)}
                                        className={`w-12 h-10 text-xs font-semibold rounded-md border transition-all uppercase flex items-center justify-center cursor-pointer ${selectedSize === sizeObj.size_name
                                            ? 'bg-[#EBE3D5] border-transparent text-black font-bold'
                                            : 'border-white/10 bg-[#08142c] text-light hover:border-white/30'
                                            }`}
                                    >
                                        {sizeObj.size_name}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setSelectedSize('CUSTOM')}
                                    className={`px-4 h-10 text-xs font-semibold rounded-md border transition-all uppercase flex items-center justify-center cursor-pointer ${selectedSize === 'CUSTOM'
                                        ? 'bg-[#EBE3D5] border-transparent text-black font-bold'
                                        : 'border-white/10 bg-[#08142c] text-light hover:border-white/30'
                                        }`}
                                >
                                    Custom
                                </button>
                            </div>

                            {/* Custom Measurements */}
                            {selectedSize === 'CUSTOM' && renderCustomFields()}
                        </>
                    )}

                    <button
                        onClick={confirmCart}
                        className="w-full bg-[#3b5998] hover:bg-[#2b4478] text-white font-bold py-3.5 px-4 rounded-md transition-all flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer"
                    >
                        CONFIRM & ADD
                    </button>
                </div>
            </div>
        </div>
    );
}
