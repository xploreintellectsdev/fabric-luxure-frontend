import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Ruler, Heart } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface SizeChartProps {
    isOpen: boolean;
    onClose: () => void;
    selectedSize: string;
    setSelectedSize: (size: string) => void;
    templateImage?: string | null;
    productType?: string | null;
    proTypeId?: number;
    fitStyleId: number | null;
    setFitStyleId?: (styleId: number) => void;
    fitStyles: any[];
    customMeasurements: {
        chest: string;
        length: string;
        shoulder: string;
        sleeve: string;
        waist: string;
        inseam: string;
        hip: string;
        thigh: string;
        knee: string;
        leg_opening: string;
        confirmed: boolean;
    };
    setCustomMeasurements: React.Dispatch<React.SetStateAction<{
        chest: string;
        length: string;
        shoulder: string;
        sleeve: string;
        waist: string;
        inseam: string;
        hip: string;
        thigh: string;
        knee: string;
        leg_opening: string;
        confirmed: boolean;
    }>>;
}

export default function SizeChart({
    isOpen,
    onClose,
    selectedSize,
    setSelectedSize,
    templateImage,
    productType,
    proTypeId,
    fitStyleId,
    setFitStyleId,
    fitStyles,
    customMeasurements,
    setCustomMeasurements
}: SizeChartProps) {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [animate, setAnimate] = useState(false);

    // Dynamic sizes states & selected fit style
    const [sizes, setSizes] = useState<any[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [loadingSizes, setLoadingSizes] = useState(true);

    // Temp custom measurements states for editing/cancel flow
    const [tempChest, setTempChest] = useState('');
    const [tempLength, setTempLength] = useState('');
    const [tempShoulder, setTempShoulder] = useState('');
    const [tempSleeve, setTempSleeve] = useState('');
    const [tempWaist, setTempWaist] = useState('');
    const [tempInseam, setTempInseam] = useState('');
    const [tempHip, setTempHip] = useState('');
    const [tempThigh, setTempThigh] = useState('');
    const [tempKnee, setTempKnee] = useState('');
    const [tempLegOpening, setTempLegOpening] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const timer = setTimeout(() => setAnimate(true), 10);
            return () => clearTimeout(timer);
        } else {
            setAnimate(false);
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setTempChest(customMeasurements.chest);
            setTempLength(customMeasurements.length);
            setTempShoulder(customMeasurements.shoulder);
            setTempSleeve(customMeasurements.sleeve);
            setTempWaist(customMeasurements.waist);
            setTempInseam(customMeasurements.inseam);
            setTempHip(customMeasurements.hip);
            setTempThigh(customMeasurements.thigh);
            setTempKnee(customMeasurements.knee);
            setTempLegOpening(customMeasurements.leg_opening);
            setIsEditing(!customMeasurements.confirmed);
        }
    }, [isOpen, customMeasurements]);

    useEffect(() => {
        if (!isOpen || !proTypeId || !fitStyleId) return;

        const fetchActiveSizes = async () => {
            try {
                setLoadingSizes(true);
                const pType = productType || 'Shirt';
                const res = await fetch(`${API_URL}/api/admin/size-charts/active?product_type=${pType}&pro_type_id=${proTypeId}&fit_style_id=${fitStyleId}`);
                const text = await res.text();
                try {
                    const data = JSON.parse(text);
                    if (res.ok && data.success) {
                        setSizes(data.data || []);
                        setColumns(data.columns || []);
                    }
                } catch (parseErr) {
                    console.error("❌ Failed to parse active sizes from:", `${API_URL}/api/admin/size-charts/active`);
                    console.error("Response text:", text.substring(0, 200));
                }
            } catch (err) {
                console.error("❌ Failed to fetch active sizes:", err);
            } finally {
                setLoadingSizes(false);
            }
        };

        fetchActiveSizes();
    }, [isOpen, proTypeId, fitStyleId]);

    if (!shouldRender) return null;

    const getImageUrl = (path: string) => {
        if (path.startsWith("http")) return path;
        return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
    };

    const handleNumberInputChange = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === "" || /^[0-9]*\.?[0-9]{0,2}$/.test(val)) {
            setter(val);
        }
    };

    const pType = (productType || "").toLowerCase();
    const isShirt = !productType || pType === "shirt" || pType === "shirts";
    const isPant = pType === "pant" || pType === "pants";
    const isShorts = pType === "shorts" || pType === "short";
    const isBlazer = pType === "blazer" || pType === "blazers" || proTypeId === 21;

    const handleConfirm = () => {
        if (isBlazer) {
            if (!tempChest || !tempLength || !tempShoulder || !tempSleeve || !tempWaist) {
                toast.error("Please enter all measurements (Shoulder, Chest, Shirt Length, Sleeve Length, Mid Section).");
                return;
            }
            const values = [tempChest, tempLength, tempShoulder, tempSleeve, tempWaist].map(parseFloat);
            if (values.some(v => isNaN(v) || v <= 0)) {
                toast.error("All measurements must be positive numbers.");
                return;
            }
        } else if (isShirt) {
            if (!tempChest || !tempLength || !tempShoulder || !tempSleeve) {
                toast.error("Please enter all four measurements (Chest, Length, Shoulder, Sleeve).");
                return;
            }
            const chestVal = parseFloat(tempChest);
            const lengthVal = parseFloat(tempLength);
            const shoulderVal = parseFloat(tempShoulder);
            const sleeveVal = parseFloat(tempSleeve);
            if (isNaN(chestVal) || chestVal <= 0 ||
                isNaN(lengthVal) || lengthVal <= 0 ||
                isNaN(shoulderVal) || shoulderVal <= 0 ||
                isNaN(sleeveVal) || sleeveVal <= 0) {
                toast.error("All measurements must be positive numbers.");
                return;
            }
        } else if (isPant || isShorts) {
            if (!tempWaist || !tempInseam || !tempHip || !tempThigh || (!isShorts && !tempKnee) || !tempLegOpening) {
                toast.error("Please enter all measurements.");
                return;
            }
            const values = isShorts 
                ? [tempWaist, tempInseam, tempHip, tempThigh, tempLegOpening].map(parseFloat)
                : [tempWaist, tempInseam, tempHip, tempThigh, tempKnee, tempLegOpening].map(parseFloat);
            if (values.some(v => isNaN(v) || v <= 0)) {
                toast.error("All measurements must be positive numbers.");
                return;
            }
        }

        setCustomMeasurements({
            chest: tempChest,
            length: tempLength,
            shoulder: tempShoulder,
            sleeve: tempSleeve,
            waist: tempWaist,
            inseam: tempInseam,
            hip: tempHip,
            thigh: tempThigh,
            knee: tempKnee,
            leg_opening: tempLegOpening,
            confirmed: true
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        if (customMeasurements.confirmed) {
            setTempChest(customMeasurements.chest);
            setTempLength(customMeasurements.length);
            setTempShoulder(customMeasurements.shoulder);
            setTempSleeve(customMeasurements.sleeve);
            setTempWaist(customMeasurements.waist);
            setTempInseam(customMeasurements.inseam);
            setTempHip(customMeasurements.hip);
            setTempThigh(customMeasurements.thigh);
            setTempKnee(customMeasurements.knee);
            setTempLegOpening(customMeasurements.leg_opening);
            setIsEditing(false);
        } else {
            setTempChest('');
            setTempLength('');
            setTempShoulder('');
            setTempSleeve('');
            setTempWaist('');
            setTempInseam('');
            setTempHip('');
            setTempThigh('');
            setTempKnee('');
            setTempLegOpening('');
            setIsEditing(false);
        }
    };

    return (
        <div 
            className={`fixed inset-0 z-100 flex justify-end bg-black/80 backdrop-blur-[2px] transition-opacity duration-300 ${
                animate ? 'opacity-100' : 'opacity-0'
            }`}
        >
            <div className="absolute inset-0 -z-10" onClick={onClose} />

            <div 
                className={`w-full sm:w-[560px] max-w-[95vw] h-full bg-tertiary p-6 overflow-y-auto flex flex-col justify-start text-light transform transition-transform duration-300 ease-out ${
                    animate ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex justify-between items-center pb-4 mb-6">
                    <h1 className="uppercase font-instrumentserif text-lg md:text-2xl text-light transform scale-y-150 origin-center select-none">
                        ( Size Chart )
                    </h1>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex items-center gap-1 text-xs tracking-wider font-bold uppercase opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                        <span>Close</span>
                    </button>
                </div>

                {(isBlazer || isShirt || isPant || isShorts) && setFitStyleId && fitStyles.length > 0 && (
                    <div className="w-full mb-6 flex justify-between items-center bg-primary p-3 rounded-md border border-white/5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-light/70">Fit Style</label>
                        <select
                            value={fitStyleId || ""}
                            onChange={(e) => setFitStyleId(Number(e.target.value))}
                            className="h-8 px-4 text-xs font-semibold rounded border border-white/10 bg-[#07122a] text-light focus:outline-none focus:border-[#D4AF37] transition-colors cursor-pointer"
                        >
                            {fitStyles.map(f => (
                                <option key={f.fit_style_id} value={f.fit_style_id}>{f.fit_style_name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="w-full aspect-square relative bg-light rounded-xl p-4 mb-6 flex items-center justify-center border border-black/5">
                    {templateImage ? (
                        <img 
                            src={getImageUrl(templateImage)} 
                            alt="Size Chart" 
                            className="max-w-full max-h-full object-contain" 
                        />
                    ) : (
                        <div className="text-black/60 font-semibold text-sm">
                            Size Chart Not Available
                        </div>
                    )}
                </div>

                <div className="w-full flex flex-col gap-3 text-xs font-medium">
                    <div 
                        className="grid items-center py-3 bg-primary rounded-md text-light font-semibold uppercase tracking-tight sm:tracking-wider text-center text-[9px] sm:text-xs md:text-sm"
                        style={{ gridTemplateColumns: `repeat(${columns.length + 1}, minmax(0, 1fr))` }}
                    >
                        <span className="flex justify-center">
                            <Image
                                src="/images/productview/sizechart.svg"
                                alt="Size"
                                width={20}
                                height={20}
                            />
                        </span>
                        {columns.length > 0 ? (
                            columns.map(col => <span key={col}>{col.replace(/_/g, ' ')}</span>)
                        ) : (
                            isBlazer ? (
                                <>
                                    <span>Chest</span>
                                    <span>Mid Section</span>
                                    <span>Shirt Length</span>
                                    <span>Shoulder</span>
                                    <span>Sleeve Length</span>
                                </>
                            ) : isPant || isShorts ? (
                                <>
                                    <span>Waist</span>
                                    <span>Inseam</span>
                                    <span>Hip</span>
                                    <span>Thigh</span>
                                    {!isShorts && <span>Knee</span>}
                                    <span>Leg Opening</span>
                                </>
                            ) : (
                                <>
                                    <span>Chest</span>
                                    <span>Length</span>
                                    <span>Shoulder</span>
                                    <span>Sleeve</span>
                                </>
                            )
                        )}
                    </div>

                    {loadingSizes ? (
                        <div className="text-Pinball/50 italic py-4 text-center">Loading size options...</div>
                    ) : sizes.length === 0 ? (
                        <div className="text-Pinball/50 italic py-4 text-center">No size options available.</div>
                    ) : (
                        sizes.map((row) => {
                            const isSelected = selectedSize === row.size_name;

                            return (
                                <label
                                    key={row.size_chart_id}
                                    className={`
                                        group grid items-center py-3.5 rounded-md cursor-pointer transition-all duration-300
                                        ${isSelected
                                            ? "bg-blue text-light font-bold"
                                            : "bg-primary text-light hover:bg-blue hover:text-light"
                                        }
                                        text-[11px] sm:text-sm
                                    `}
                                    style={{ gridTemplateColumns: `repeat(${columns.length + 1}, minmax(0, 1fr))` }}
                                >
                                    <input
                                        type="radio"
                                        name="size"
                                        value={row.size_name}
                                        checked={isSelected}
                                        onChange={() => setSelectedSize(row.size_name)}
                                        className="sr-only"
                                    />

                                    <div className="flex items-center gap-1.5 sm:gap-3 pl-1.5 sm:pl-3">
                                        <div
                                            className={`
                                                w-4 h-4 rounded-full border flex items-center justify-center transition-colors duration-300 bg-transparent
                                                ${isSelected
                                                    ? "border-light"
                                                    : "border-bg-blue group-hover:border-light"
                                                }
                                            `}
                                        >
                                            <div 
                                                className={`
                                                    w-2 h-2 rounded-full bg-light transition-opacity duration-300
                                                    ${isSelected 
                                                        ? "opacity-100" 
                                                        : "opacity-0 group-hover:opacity-100"
                                                    }
                                                `} 
                                            />
                                        </div>

                                        <span className="font-semibold">{row.size_name}</span>
                                    </div>

                                    {columns.length > 0 ? (
                                        columns.map(col => (
                                            <span key={col} className="text-center">{row[col]}</span>
                                        ))
                                    ) : (
                                        isBlazer ? (
                                            <>
                                                <span className="text-center">{row.chest}</span>
                                                <span className="text-center">{row.mid_section}</span>
                                                <span className="text-center">{row.shirt_length}</span>
                                                <span className="text-center">{row.shoulder}</span>
                                                <span className="text-center">{row.sleeve_length}</span>
                                            </>
                                        ) : isPant || isShorts ? (
                                            <>
                                                <span className="text-center">{row.waist}</span>
                                                <span className="text-center">{row.inseam}</span>
                                                <span className="text-center">{row.hip}</span>
                                                <span className="text-center">{row.thigh}</span>
                                                {!isShorts && <span className="text-center">{row.knee}</span>}
                                                <span className="text-center">{row.leg_opening}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-center">{row.chest}</span>
                                                <span className="text-center">{row.length}</span>
                                                <span className="text-center">{row.shoulder}</span>
                                                <span className="text-center">{row.sleeve}</span>
                                            </>
                                        )
                                    )}
                                </label>
                            );
                        })
                    )}


                    {/* Custom Size Option for Shirts & Pants & Shorts & Blazers */}
                    {(isBlazer || isShirt || isPant || isShorts) && (
                        <div className="flex flex-col gap-2 mt-2">
                            <label
                                className={`
                                    group flex justify-between items-center py-3.5 px-4 rounded-md cursor-pointer transition-all duration-300
                                    ${selectedSize === 'CUSTOM'
                                        ? "bg-blue text-light font-bold"
                                        : "bg-primary text-light hover:bg-blue hover:text-light"
                                    }
                                `}
                            >
                                <input
                                    type="radio"
                                    name="size"
                                    value="CUSTOM"
                                    checked={selectedSize === 'CUSTOM'}
                                    onChange={() => {
                                        setSelectedSize('CUSTOM');
                                        if (!customMeasurements.confirmed) {
                                            setIsEditing(true);
                                        }
                                    }}
                                    className="sr-only"
                                />

                                <div className="flex items-center gap-3">
                                    <div
                                        className={`
                                            w-4 h-4 rounded-full border flex items-center justify-center transition-colors duration-300 bg-transparent
                                            ${selectedSize === 'CUSTOM'
                                                ? "border-light"
                                                : "border-bg-blue group-hover:border-light"
                                            }
                                        `}
                                    >
                                        <div 
                                            className={`
                                                w-2 h-2 rounded-full bg-light transition-opacity duration-300
                                                ${selectedSize === 'CUSTOM' 
                                                    ? "opacity-100" 
                                                    : "opacity-0 group-hover:opacity-100"
                                                }
                                            `} 
                                        />
                                    </div>
                                    <span className="font-semibold text-xs tracking-wider uppercase flex items-center gap-1">
                                        {customMeasurements.confirmed && (
                                            <span className="text-emerald-500 mr-1 font-bold">✓</span>
                                        )}
                                        {customMeasurements.confirmed ? "Custom Size Selected" : "Custom Size"}
                                    </span>
                                </div>

                                {!customMeasurements.confirmed && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setSelectedSize('CUSTOM');
                                            setIsEditing(!isEditing);
                                        }}
                                        className="flex items-center gap-1.5 text-xs text-light/80 hover:text-light font-semibold uppercase focus:outline-none cursor-pointer"
                                    >
                                        <span>Enter Measurements</span>
                                        <span className={`transform transition-transform duration-300 ${isEditing ? 'rotate-90' : ''}`}>&gt;</span>
                                    </button>
                                )}
                            </label>

                            {selectedSize === 'CUSTOM' && (
                                <div className="transition-all duration-300 ease-in-out overflow-hidden mt-1">
                                    {isEditing ? (
                                        <div className="bg-[#07122a] border border-white/5 rounded-md p-4 flex flex-col gap-4 text-left">
                                            <div className="grid grid-cols-2 gap-4">
                                                {(isBlazer ? [
                                                    { label: 'Chest', value: tempChest, setter: setTempChest },
                                                    { label: 'Mid Section', value: tempWaist, setter: setTempWaist },
                                                    { label: 'Shirt Length', value: tempLength, setter: setTempLength },
                                                    { label: 'Shoulder', value: tempShoulder, setter: setTempShoulder },
                                                    { label: 'Sleeve Length', value: tempSleeve, setter: setTempSleeve }
                                                ] : isShirt ? [
                                                    { label: 'Chest', value: tempChest, setter: setTempChest },
                                                    { label: 'Length', value: tempLength, setter: setTempLength },
                                                    { label: 'Shoulder', value: tempShoulder, setter: setTempShoulder },
                                                    { label: 'Sleeve', value: tempSleeve, setter: setTempSleeve }
                                                ] : (
                                                    isShorts ? [
                                                        { label: 'Waist', value: tempWaist, setter: setTempWaist },
                                                        { label: 'Inseam', value: tempInseam, setter: setTempInseam },
                                                        { label: 'Hip', value: tempHip, setter: setTempHip },
                                                        { label: 'Thigh', value: tempThigh, setter: setTempThigh },
                                                        { label: 'Leg Opening', value: tempLegOpening, setter: setTempLegOpening }
                                                    ] : [
                                                        { label: 'Waist', value: tempWaist, setter: setTempWaist },
                                                        { label: 'Inseam', value: tempInseam, setter: setTempInseam },
                                                        { label: 'Hip', value: tempHip, setter: setTempHip },
                                                        { label: 'Thigh', value: tempThigh, setter: setTempThigh },
                                                        { label: 'Knee', value: tempKnee, setter: setTempKnee },
                                                        { label: 'Leg Opening', value: tempLegOpening, setter: setTempLegOpening }
                                                    ]
                                                )).map((field) => (
                                                    <div key={field.label} className="flex flex-col gap-1.5">
                                                        <label className="text-[10px] uppercase tracking-wider text-[#D3D3D3]/60">{field.label} *</label>
                                                        <div className="relative flex items-center">
                                                            <input
                                                                type="text"
                                                                inputMode="decimal"
                                                                value={field.value}
                                                                onChange={handleNumberInputChange(field.setter)}
                                                                placeholder="0.00"
                                                                className="w-full pl-3 pr-14 py-2 h-9 text-xs placeholder:text-[#D3D3D3]/30 text-white rounded border border-white/10 bg-[#08142c] focus:outline-none focus:border-[#D4AF37] transition-colors"
                                                            />
                                                            <span className="absolute right-3 text-[9px] text-[#D3D3D3]/60 font-semibold uppercase select-none">
                                                                Inches
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex gap-2 justify-end text-xs font-semibold uppercase mt-1">
                                                <button
                                                    type="button"
                                                    onClick={handleCancel}
                                                    className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleConfirm}
                                                    className="px-4 py-2 rounded bg-bg-blue hover:bg-bg-blue/90 text-white transition-colors cursor-pointer"
                                                >
                                                    {customMeasurements.confirmed ? "Update Measurements" : "Confirm Measurements"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        customMeasurements.confirmed && (
                                            <div className="bg-[#07122a] border border-emerald-500/20 rounded-md p-4 flex flex-col gap-3 text-left transition-all duration-300">
                                                {isBlazer ? (
                                                    <div className="grid grid-cols-2 gap-2 text-xs font-medium text-Pinball">
                                                        <div>Chest : <span className="text-white font-bold">{customMeasurements.chest}"</span></div>
                                                        <div>Mid Section : <span className="text-white font-bold">{customMeasurements.waist}"</span></div>
                                                        <div>Shirt Length : <span className="text-white font-bold">{customMeasurements.length}"</span></div>
                                                        <div>Shoulder : <span className="text-white font-bold">{customMeasurements.shoulder}"</span></div>
                                                        <div>Sleeve Length : <span className="text-white font-bold">{customMeasurements.sleeve}"</span></div>
                                                    </div>
                                                ) : isShirt ? (
                                                    <div className="grid grid-cols-2 gap-2 text-xs font-medium text-Pinball">
                                                        <div>Chest : <span className="text-white font-bold">{customMeasurements.chest}"</span></div>
                                                        <div>Length : <span className="text-white font-bold">{customMeasurements.length}"</span></div>
                                                        <div>Shoulder : <span className="text-white font-bold">{customMeasurements.shoulder}"</span></div>
                                                        <div>Sleeve : <span className="text-white font-bold">{customMeasurements.sleeve}"</span></div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-2 text-xs font-medium text-Pinball">
                                                        <div>Waist : <span className="text-white font-bold">{customMeasurements.waist}"</span></div>
                                                        <div>Inseam : <span className="text-white font-bold">{customMeasurements.inseam}"</span></div>
                                                        <div>Hip : <span className="text-white font-bold">{customMeasurements.hip}"</span></div>
                                                        <div>Thigh : <span className="text-white font-bold">{customMeasurements.thigh}"</span></div>
                                                        <div>Knee : <span className="text-white font-bold">{customMeasurements.knee}"</span></div>
                                                        <div>Leg Opening : <span className="text-white font-bold">{customMeasurements.leg_opening}"</span></div>
                                                    </div>
                                                )}

                                                <div className="flex justify-end mt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsEditing(true)}
                                                        className="text-xs font-bold text-brown hover:text-brown/90 underline uppercase tracking-wider cursor-pointer"
                                                    >
                                                        Edit Measurements
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
