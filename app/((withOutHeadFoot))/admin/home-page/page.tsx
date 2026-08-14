"use client";

import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { ArrowUpRight, Upload, Trash2, ArrowUp, ArrowDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, Variants } from 'framer-motion';

import OurPicks from "../../../../components/OurPicks";
import Shopbycategory from "../../../../pages/home/Shopbycategory";
import ShopbyTexturePatterns from "../../../../pages/home/ShopbyTexturePatterns";
import WhereComfortMeets from "../../../../components/WhereComfortMeets";
import ExclusiveSummerLinens from "../../../../pages/home/ExclusiveSummerLinens";
import WhyLinen from "../../../../pages/home/WhyLinen";
import WhoWeAre from "../../../../pages/home/WhoWeAre";
import OurPSC from "../../../../components/OurPSC";
import CustomersSay from "../../../../components/CustomersSay";
import WeBelieve from "../../../../pages/home/WeBelieve";
import FAQ from "../../../../pages/home/FAQ";
// Force IPv4 for local requests
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_URL = rawApiUrl.replace("localhost", "127.0.0.1");

interface MarqueeItem {
  marquee_id?: number;
  marquee_text: string;
  item_order: number;
  is_enabled: number;
}

const ScaledPreview = ({ children, bg = "bg-transparent" }: { children: React.ReactNode, bg?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(200);
  const [contentWidth, setContentWidth] = useState(1440);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current && contentRef.current) {
        const availableWidth = containerRef.current.clientWidth;
        // If the admin area is wider than 1440, let the component expand naturally 
        // to fill the space (just like it would on a large desktop monitor).
        // If it's smaller, force it to 1440 and scale it down.
        const dynamicTargetWidth = Math.max(1440, availableWidth);
        
        const newScale = availableWidth / dynamicTargetWidth;
        
        setContentWidth(dynamicTargetWidth);
        setScale(newScale);
        setHeight(contentRef.current.offsetHeight * newScale);
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      setTimeout(updateDimensions, 100);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
      Array.from(contentRef.current.children).forEach(child => {
          resizeObserver.observe(child);
      });
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`w-full relative overflow-hidden rounded border border-gray-800 shadow-2xl transition-all duration-300 ${bg}`}
      style={{ height: `${height}px` }}
    >
      <div 
        ref={contentRef}
        className="absolute top-0 left-0 origin-top-left" 
        style={{ 
          width: `${contentWidth}px`, 
          transform: `scale(${scale})` 
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default function HomePageAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savingHero, setSavingHero] = useState(false);
  const [savingBreath, setSavingBreath] = useState(false);
  
  // ===================== HERO STATE =====================
  const [dbHero, setDbHero] = useState<any>({});
  const [dbMarqueeItems, setDbMarqueeItems] = useState<MarqueeItem[]>([]);

  const [hero, setHero] = useState<any>({
    heading: "",
    heading_enabled: 1,
    sub_heading: "",
    sub_heading_enabled: 1,
    description_line_1: "",
    description_line_1_enabled: 1,
    description_line_2: "",
    description_line_2_enabled: 1,
    is_enabled: 1,
    background_image: "",
  });
  const [marqueeItems, setMarqueeItems] = useState<MarqueeItem[]>([]);
  const [heroImagePreview, setHeroImagePreview] = useState<string>("");
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const [heroSelectedFile, setHeroSelectedFile] = useState<File | null>(null);

  const [isHeroEditing, setIsHeroEditing] = useState(false);

  // ===================== BREATH STATE =====================
  const [dbBreath, setDbBreath] = useState<any>({});
  
  const [breath, setBreath] = useState<any>({
    heading_line_1: "",
    heading_line_1_enabled: 1,
    heading_line_2: "",
    heading_line_2_enabled: 1,
    heading_highlight: "",
    heading_highlight_enabled: 1,
    heading_line_3: "",
    heading_line_3_enabled: 1,
    description: "",
    description_enabled: 1,
    image: "",
    is_enabled: 1,
  });
  const [breathImagePreview, setBreathImagePreview] = useState<string>("");
  const breathFileInputRef = useRef<HTMLInputElement>(null);
  const [breathSelectedFile, setBreathSelectedFile] = useState<File | null>(null);

  const [isBreathEditing, setIsBreathEditing] = useState(false);

  // ===================== TOP PICKS STATE =====================
  const [dbTopPicks, setDbTopPicks] = useState<any>({});
  const [topPicks, setTopPicks] = useState<any>({ section_name: "", is_enabled: 1 });
  const [isTopPicksEditing, setIsTopPicksEditing] = useState(false);
  const [savingTopPicks, setSavingTopPicks] = useState(false);

  // ===================== SHOP CATEGORY STATE =====================
  const [dbShopCategory, setDbShopCategory] = useState<any>({});
  const [shopCategory, setShopCategory] = useState<any>({ section_name: "", is_enabled: 1 });
  const [isShopCategoryEditing, setIsShopCategoryEditing] = useState(false);
  const [savingShopCategory, setSavingShopCategory] = useState(false);

  // ===================== SHOP BY STATE =====================
  const [dbShopBy, setDbShopBy] = useState<any>({});
  const [shopBy, setShopBy] = useState<any>({ section_name: "", is_enabled: 1 });
  const [isShopByEditing, setIsShopByEditing] = useState(false);
  const [savingShopBy, setSavingShopBy] = useState(false);

  // ===================== WHERE COMFORT MEETS STATE =====================
  const [dbWhereComfortMeets, setDbWhereComfortMeets] = useState<any>({});
  const [whereComfortMeets, setWhereComfortMeets] = useState<any>({
    heading_line_1: "",
    heading_line_1_enabled: 1,
    heading_highlight: "",
    heading_highlight_enabled: 1,
    heading_line_2: "",
    heading_line_2_enabled: 1,
    description: "",
    description_enabled: 1,
    image: "",
    is_enabled: 1,
  });
  const [isWhereComfortMeetsEditing, setIsWhereComfortMeetsEditing] = useState(false);
  const [savingWhereComfortMeets, setSavingWhereComfortMeets] = useState(false);
  const [whereComfortMeetsImagePreview, setWhereComfortMeetsImagePreview] = useState<string>("");
  const whereComfortMeetsFileInputRef = useRef<HTMLInputElement>(null);
  const [whereComfortMeetsSelectedFile, setWhereComfortMeetsSelectedFile] = useState<File | null>(null);

  // ===================== EXCLUSIVE SUMMER LINENS STATE =====================
  const [dbExclusiveSummer, setDbExclusiveSummer] = useState<any>({});
  const [exclusiveSummer, setExclusiveSummer] = useState<any>({ section_name: "", is_enabled: 1 });
  const [isExclusiveSummerEditing, setIsExclusiveSummerEditing] = useState(false);
  const [savingExclusiveSummer, setSavingExclusiveSummer] = useState(false);

  // ===================== WHY LINEN STATE =====================
  const [dbWhyLinen, setDbWhyLinen] = useState<any>({});
  const [whyLinen, setWhyLinen] = useState<any>({
    section_name: "",
    background_image: "",
    feature_1_title: "", feature_1_description: "",
    feature_2_title: "", feature_2_description: "",
    feature_3_title: "", feature_3_description: "",
    is_enabled: 1
  });
  const [isWhyLinenEditing, setIsWhyLinenEditing] = useState(false);
  const [savingWhyLinen, setSavingWhyLinen] = useState(false);
  const [whyLinenImagePreview, setWhyLinenImagePreview] = useState<string>("");
  const whyLinenFileInputRef = useRef<HTMLInputElement>(null);
  const [whyLinenSelectedFile, setWhyLinenSelectedFile] = useState<File | null>(null);

  // ===================== WHY FABRIC LUXURE STATE =====================
  const [dbWhyFabricLuxure, setDbWhyFabricLuxure] = useState<any>({});
  const [whyFabricLuxure, setWhyFabricLuxure] = useState<any>({
    section_name: "",
    content_1: "", content_1_enabled: 1,
    content_2: "", content_2_enabled: 1,
    is_enabled: 1
  });
  const [isWhyFabricLuxureEditing, setIsWhyFabricLuxureEditing] = useState(false);
  const [savingWhyFabricLuxure, setSavingWhyFabricLuxure] = useState(false);

  // ===================== OUR PSC STATE =====================
  const [dbOurPsc, setDbOurPsc] = useState<any>({});
  const [ourPsc, setOurPsc] = useState<any>({
    section_name: "",
    card_1_title: "", card_1_enabled: 1,
    card_2_title: "", card_2_enabled: 1,
    card_3_title: "", card_3_enabled: 1,
    is_enabled: 1
  });
  const [isOurPscEditing, setIsOurPscEditing] = useState(false);
  const [savingOurPsc, setSavingOurPsc] = useState(false);
  const [ourPscImagePreviews, setOurPscImagePreviews] = useState<{ [key: number]: string }>({});
  const ourPscFileRefs = {
    1: useRef<HTMLInputElement>(null),
    2: useRef<HTMLInputElement>(null),
    3: useRef<HTMLInputElement>(null),
  };
  const [ourPscSelectedFiles, setOurPscSelectedFiles] = useState<{ [key: number]: File | null }>({});

  // ===================== CUSTOMERS SAY STATE =====================
  const [dbCustomersSay, setDbCustomersSay] = useState<any>({});
  const [customersSay, setCustomersSay] = useState<any>({
    section_name: "",
    is_enabled: 1
  });
  const [isCustomersSayEditing, setIsCustomersSayEditing] = useState(false);
  const [savingCustomersSay, setSavingCustomersSay] = useState(false);

  // ===================== WE BELIEVE STATE =====================
  const [dbWeBelieve, setDbWeBelieve] = useState<any>({});
  const [weBelieve, setWeBelieve] = useState<any>({
    section_name: "",
    content_1: "", content_1_enabled: 1,
    content_2: "", content_2_enabled: 1,
    is_enabled: 1
  });
  const [isWeBelieveEditing, setIsWeBelieveEditing] = useState(false);
  const [savingWeBelieve, setSavingWeBelieve] = useState(false);

  // ===================== FAQ STATE =====================
  const [dbFaq, setDbFaq] = useState<any>({});
  const [faq, setFaq] = useState<any>({
    section_name: "",
    is_enabled: 1
  });
  const [isFaqEditing, setIsFaqEditing] = useState(false);
  const [savingFaq, setSavingFaq] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const getImageUrl = (bgImg: string) => {
    if (!bgImg) return "";
    if (bgImg.startsWith("/uploads")) {
      return `${API_URL}${bgImg}`;
    }
    return bgImg;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      if (!token) {
        router.push("/admin/login");
        return;
      }
      
      // Fetch Hero
      const resHero = await fetch(`${API_URL}/api/admin/home-page/hero`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resHero.ok) {
        const dataHero = await resHero.json();
        if (dataHero.success) {
          setDbHero(dataHero.hero);
          setDbMarqueeItems(dataHero.marquee || []);
          setHero(dataHero.hero);
          setHeroImagePreview(getImageUrl(dataHero.hero.background_image));
          setMarqueeItems(dataHero.marquee || []);
        }
      }

      // Fetch Breath
      const resBreath = await fetch(`${API_URL}/api/admin/home-page/breath`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resBreath.ok) {
        const dataBreath = await resBreath.json();
        if (dataBreath.success) {
          setDbBreath(dataBreath.breath);
          setBreath(dataBreath.breath);
          setBreathImagePreview(getImageUrl(dataBreath.breath.image));
        }
      }

      // Fetch Top Picks
      const resTopPicks = await fetch(`${API_URL}/api/admin/home-page/top-picks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resTopPicks.ok) {
        const dataTopPicks = await resTopPicks.json();
        if (dataTopPicks.success) {
          setDbTopPicks(dataTopPicks.data);
          setTopPicks(dataTopPicks.data);
        }
      }

      // Fetch Shop Category
      const resShopCategory = await fetch(`${API_URL}/api/admin/home-page/shop-category`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resShopCategory.ok) {
        const dataShopCategory = await resShopCategory.json();
        if (dataShopCategory.success) {
          setDbShopCategory(dataShopCategory.data);
          setShopCategory(dataShopCategory.data);
        }
      }

      // Fetch Shop By
      const resShopBy = await fetch(`${API_URL}/api/admin/home-page/shop-by`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resShopBy.ok) {
        const dataShopBy = await resShopBy.json();
        if (dataShopBy.success) {
          setDbShopBy(dataShopBy.data);
          setShopBy(dataShopBy.data);
        }
      }

      // Fetch Where Comfort Meets
      const resWhereComfortMeets = await fetch(`${API_URL}/api/admin/home-page/where-comfort-meets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resWhereComfortMeets.ok) {
        const dataWhereComfortMeets = await resWhereComfortMeets.json();
        if (dataWhereComfortMeets.success) {
          setDbWhereComfortMeets(dataWhereComfortMeets.data);
          setWhereComfortMeets(dataWhereComfortMeets.data);
          setWhereComfortMeetsImagePreview(getImageUrl(dataWhereComfortMeets.data.image));
        }
      }

      // Fetch Exclusive Summer
      const resExclusiveSummer = await fetch(`${API_URL}/api/admin/home-page/exclusive-summer`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resExclusiveSummer.ok) {
        const dataExclusiveSummer = await resExclusiveSummer.json();
        if (dataExclusiveSummer.success) {
          setDbExclusiveSummer(dataExclusiveSummer.data);
          setExclusiveSummer(dataExclusiveSummer.data);
        }
      }

      // Fetch Why Linen
      const resWhyLinen = await fetch(`${API_URL}/api/admin/home-page/why-linen`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resWhyLinen.ok) {
        const dataWhyLinen = await resWhyLinen.json();
        if (dataWhyLinen.success) {
          setDbWhyLinen(dataWhyLinen.data);
          setWhyLinen(dataWhyLinen.data);
          setWhyLinenImagePreview(getImageUrl(dataWhyLinen.data.background_image));
        }
      }

      // Fetch Why Fabric Luxure
      const resWhyFabricLuxure = await fetch(`${API_URL}/api/admin/home-page/why-fabric-luxure`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resWhyFabricLuxure.ok) {
        const dataWhyFabricLuxure = await resWhyFabricLuxure.json();
        if (dataWhyFabricLuxure.success) {
          setDbWhyFabricLuxure(dataWhyFabricLuxure.data);
          setWhyFabricLuxure(dataWhyFabricLuxure.data);
        }
      }

      // Fetch Our PSC
      const resOurPsc = await fetch(`${API_URL}/api/admin/home-page/our-psc`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resOurPsc.ok) {
        const dataOurPsc = await resOurPsc.json();
        if (dataOurPsc.success) {
          setDbOurPsc(dataOurPsc.data);
          setOurPsc(dataOurPsc.data);
          setOurPscImagePreviews({
            1: getImageUrl(dataOurPsc.data.card_1_image),
            2: getImageUrl(dataOurPsc.data.card_2_image),
            3: getImageUrl(dataOurPsc.data.card_3_image),
          });
        }
      }

      // Fetch Customers Say
      const resCustomersSay = await fetch(`${API_URL}/api/admin/home-page/customers-say`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resCustomersSay.ok) {
        const dataCustomersSay = await resCustomersSay.json();
        if (dataCustomersSay.success) {
          setDbCustomersSay(dataCustomersSay.data);
          setCustomersSay(dataCustomersSay.data);
        }
      }

      // Fetch We Believe
      const resWeBelieve = await fetch(`${API_URL}/api/admin/home-page/we-believe`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resWeBelieve.ok) {
        const dataWeBelieve = await resWeBelieve.json();
        if (dataWeBelieve.success) {
          setDbWeBelieve(dataWeBelieve.data);
          setWeBelieve(dataWeBelieve.data);
        }
      }

      // Fetch FAQ
      const resFaq = await fetch(`${API_URL}/api/admin/home-page/faq`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resFaq.ok) {
        const dataFaq = await resFaq.json();
        if (dataFaq.success) {
          setDbFaq(dataFaq.data);
          setFaq(dataFaq.data);
        }
      }

    } catch (err: any) {
      toast.error(err.message || "An error occurred fetching CMS data");
    } finally {
      setLoading(false);
    }
  };

  // ===================== HERO HANDLERS =====================
  const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setHero({ ...hero, [name]: checked ? 1 : 0 });
    } else {
      setHero({ ...hero, [name]: value });
    }
  };

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setHeroSelectedFile(file);
      setHeroImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddMarquee = () => {
    setMarqueeItems([...marqueeItems, { marquee_text: "", item_order: marqueeItems.length + 1, is_enabled: 1 }]);
  };

  const handleMarqueeChange = (index: number, field: string, value: any) => {
    const updated = [...marqueeItems];
    updated[index] = { ...updated[index], [field]: value };
    setMarqueeItems(updated);
  };

  const handleMarqueeDelete = (index: number) => {
    const updated = marqueeItems.filter((_, i) => i !== index);
    const reordered = updated.map((item, idx) => ({ ...item, item_order: idx + 1 }));
    setMarqueeItems(reordered);
  };

  const handleMarqueeMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const updated = [...marqueeItems];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      const reordered = updated.map((item, idx) => ({ ...item, item_order: idx + 1 }));
      setMarqueeItems(reordered);
    } else if (direction === 'down' && index < marqueeItems.length - 1) {
      const updated = [...marqueeItems];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      const reordered = updated.map((item, idx) => ({ ...item, item_order: idx + 1 }));
      setMarqueeItems(reordered);
    }
  };

  const handleHeroCancel = () => {
    setHero(dbHero);
    setHeroImagePreview(getImageUrl(dbHero.background_image));
    setMarqueeItems(dbMarqueeItems);
    setHeroSelectedFile(null);
    setIsHeroEditing(false);
  };

  const handleHeroSave = async () => {
    try {
      setSavingHero(true);
      const token = localStorage.getItem("admin_token");
      if (!token) return;

      const formData = new FormData();
      Object.keys(hero).forEach(key => {
        if (key !== 'background_image') {
          formData.append(key, hero[key]);
        }
      });

      if (heroSelectedFile) {
        formData.append("background_image", heroSelectedFile);
      }
      
      formData.append("marquee_items", JSON.stringify(marqueeItems));

      const res = await fetch(`${API_URL}/api/admin/home-page/hero`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update Hero CMS");
      }

      const data = await res.json();
      if (data.success) {
        toast.success("Home Hero updated successfully.");
        await fetchData();
        setIsHeroEditing(false);
      } else {
        toast.error(data.message || "Error saving Hero");
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving Hero");
    } finally {
      setSavingHero(false);
    }
  };

  // ===================== BREATH HANDLERS =====================
  const handleBreathChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setBreath({ ...breath, [name]: checked ? 1 : 0 });
    } else {
      setBreath({ ...breath, [name]: value });
    }
  };

  const handleBreathImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setBreathSelectedFile(file);
      setBreathImagePreview(URL.createObjectURL(file));
    }
  };

  const handleBreathCancel = () => {
    setBreath(dbBreath);
    setBreathImagePreview(getImageUrl(dbBreath.image));
    setBreathSelectedFile(null);
    setIsBreathEditing(false);
  };

  const handleBreathSave = async () => {
    try {
      setSavingBreath(true);
      const token = localStorage.getItem("admin_token");
      if (!token) return;

      const formData = new FormData();
      Object.keys(breath).forEach(key => {
        if (key !== 'image') {
          formData.append(key, breath[key]);
        }
      });

      if (breathSelectedFile) {
        formData.append("image", breathSelectedFile);
      }

      const res = await fetch(`${API_URL}/api/admin/home-page/breath`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update Breath CMS");
      }

      const data = await res.json();
      if (data.success) {
        toast.success("Home Breath updated successfully.");
        await fetchData();
        setIsBreathEditing(false);
      } else {
        toast.error(data.message || "Error saving Breath section");
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving Breath section");
    } finally {
      setSavingBreath(false);
    }
  };

  // ===================== TOP PICKS HANDLERS =====================
  const handleTopPicksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setTopPicks({ ...topPicks, [name]: type === "checkbox" ? (checked ? 1 : 0) : value });
  };

  const handleTopPicksCancel = () => {
    setTopPicks(dbTopPicks);
    setIsTopPicksEditing(false);
  };

  const handleTopPicksSave = async () => {
    try {
      setSavingTopPicks(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/home-page/top-picks`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(topPicks),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Top Picks section updated successfully.");
        await fetchData();
        setIsTopPicksEditing(false);
      } else {
        toast.error(data.message || "Error saving Top Picks");
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving Top Picks");
    } finally {
      setSavingTopPicks(false);
    }
  };

  // ===================== SHOP CATEGORY HANDLERS =====================
  const handleShopCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setShopCategory({ ...shopCategory, [name]: type === "checkbox" ? (checked ? 1 : 0) : value });
  };

  const handleShopCategoryCancel = () => {
    setShopCategory(dbShopCategory);
    setIsShopCategoryEditing(false);
  };

  const handleShopCategorySave = async () => {
    try {
      setSavingShopCategory(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/home-page/shop-category`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(shopCategory),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Shop Category section updated successfully.");
        await fetchData();
        setIsShopCategoryEditing(false);
      } else {
        toast.error(data.message || "Error saving Shop Category");
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving Shop Category");
    } finally {
      setSavingShopCategory(false);
    }
  };

  // ===================== SHOP BY HANDLERS =====================
  const handleShopByChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setShopBy({ ...shopBy, [name]: type === "checkbox" ? (checked ? 1 : 0) : value });
  };

  const handleShopByCancel = () => {
    setShopBy(dbShopBy);
    setIsShopByEditing(false);
  };

  const handleShopBySave = async () => {
    try {
      setSavingShopBy(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/home-page/shop-by`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(shopBy),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Shop By section updated successfully.");
        await fetchData();
        setIsShopByEditing(false);
      } else {
        toast.error(data.message || "Error saving Shop By");
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving Shop By");
    } finally {
      setSavingShopBy(false);
    }
  };

  // ===================== WHERE COMFORT MEETS HANDLERS =====================
  const handleWhereComfortMeetsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let checked = false;
    if (type === "checkbox") {
      checked = (e.target as HTMLInputElement).checked;
    }
    setWhereComfortMeets({ ...whereComfortMeets, [name]: type === "checkbox" ? (checked ? 1 : 0) : value });
  };

  const handleWhereComfortMeetsImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setWhereComfortMeetsSelectedFile(file);
      setWhereComfortMeetsImagePreview(URL.createObjectURL(file));
    }
  };

  const handleWhereComfortMeetsCancel = () => {
    setWhereComfortMeets(dbWhereComfortMeets);
    setWhereComfortMeetsImagePreview(getImageUrl(dbWhereComfortMeets.image));
    setWhereComfortMeetsSelectedFile(null);
    if (whereComfortMeetsFileInputRef.current) whereComfortMeetsFileInputRef.current.value = "";
    setIsWhereComfortMeetsEditing(false);
  };

  const handleWhereComfortMeetsSave = async () => {
    try {
      setSavingWhereComfortMeets(true);
      const token = localStorage.getItem("admin_token");
      if (!token) return;

      const formData = new FormData();
      Object.keys(whereComfortMeets).forEach(key => {
        if (key !== 'image') {
          formData.append(key, whereComfortMeets[key]);
        }
      });

      if (whereComfortMeetsSelectedFile) {
        formData.append("image", whereComfortMeetsSelectedFile);
      }

      const res = await fetch(`${API_URL}/api/admin/home-page/where-comfort-meets`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update Where Comfort Meets CMS");
      }

      const data = await res.json();
      if (data.success) {
        toast.success("Where Comfort Meets section updated successfully.");
        await fetchData();
        setIsWhereComfortMeetsEditing(false);
      } else {
        toast.error(data.message || "Error saving Where Comfort Meets");
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving Where Comfort Meets");
    } finally {
      setSavingWhereComfortMeets(false);
    }
  };

  // ===================== EXCLUSIVE SUMMER LINENS HANDLERS =====================
  const handleExclusiveSummerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setExclusiveSummer({ ...exclusiveSummer, [name]: type === "checkbox" ? (checked ? 1 : 0) : value });
  };

  const handleExclusiveSummerCancel = () => {
    setExclusiveSummer(dbExclusiveSummer);
    setIsExclusiveSummerEditing(false);
  };

  const handleExclusiveSummerSave = async () => {
    try {
      setSavingExclusiveSummer(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/home-page/exclusive-summer`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(exclusiveSummer),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Exclusive Summer section updated successfully.");
        await fetchData();
        setIsExclusiveSummerEditing(false);
      } else {
        toast.error(data.message || "Error saving Exclusive Summer");
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving Exclusive Summer");
    } finally {
      setSavingExclusiveSummer(false);
    }
  };

  // ===================== WHY LINEN HANDLERS =====================
  const handleWhyLinenChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let checked = false;
    if (type === "checkbox") {
      checked = (e.target as HTMLInputElement).checked;
    }
    setWhyLinen({ ...whyLinen, [name]: type === "checkbox" ? (checked ? 1 : 0) : value });
  };

  const handleWhyLinenImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setWhyLinenSelectedFile(file);
      setWhyLinenImagePreview(URL.createObjectURL(file));
    }
  };

  const handleWhyLinenCancel = () => {
    setWhyLinen(dbWhyLinen);
    setWhyLinenImagePreview(getImageUrl(dbWhyLinen.background_image));
    setWhyLinenSelectedFile(null);
    if (whyLinenFileInputRef.current) whyLinenFileInputRef.current.value = "";
    setIsWhyLinenEditing(false);
  };

  const handleWhyLinenSave = async () => {
    try {
      setSavingWhyLinen(true);
      const token = localStorage.getItem("admin_token");
      if (!token) return;

      const formData = new FormData();
      Object.keys(whyLinen).forEach(key => {
        if (key !== 'background_image') {
          formData.append(key, whyLinen[key]);
        }
      });

      if (whyLinenSelectedFile) {
        formData.append("background_image", whyLinenSelectedFile);
      }

      const res = await fetch(`${API_URL}/api/admin/home-page/why-linen`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update Why Linen CMS");
      }

      const data = await res.json();
      if (data.success) {
        toast.success("Why Linen section updated successfully.");
        await fetchData();
        setIsWhyLinenEditing(false);
      } else {
        toast.error(data.message || "Error saving Why Linen");
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving Why Linen");
    } finally {
      setSavingWhyLinen(false);
    }
  };

  // ===================== WHY FABRIC LUXURE HANDLERS =====================
  const handleWhyFabricLuxureChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let checked = false;
    if (type === "checkbox") {
      checked = (e.target as HTMLInputElement).checked;
    }
    setWhyFabricLuxure({ ...whyFabricLuxure, [name]: type === "checkbox" ? (checked ? 1 : 0) : value });
  };

  const handleWhyFabricLuxureCancel = () => {
    setWhyFabricLuxure(dbWhyFabricLuxure);
    setIsWhyFabricLuxureEditing(false);
  };

  const handleWhyFabricLuxureSave = async () => {
    try {
      setSavingWhyFabricLuxure(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/home-page/why-fabric-luxure`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(whyFabricLuxure),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Why Fabric Luxure section updated successfully.");
        await fetchData();
        setIsWhyFabricLuxureEditing(false);
      } else {
        toast.error(data.message || "Error saving Why Fabric Luxure");
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving Why Fabric Luxure");
    } finally {
      setSavingWhyFabricLuxure(false);
    }
  };

  // ===================== OUR PSC HANDLERS =====================
  const handleOurPscChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setOurPsc({ ...ourPsc, [name]: type === "checkbox" ? (checked ? 1 : 0) : value });
  };

  const handleOurPscImageChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOurPscSelectedFiles(prev => ({ ...prev, [id]: file }));
      setOurPscImagePreviews(prev => ({ ...prev, [id]: URL.createObjectURL(file) }));
    }
  };

  const handleOurPscCancel = () => {
    setOurPsc(dbOurPsc);
    setOurPscImagePreviews({
      1: getImageUrl(dbOurPsc.card_1_image),
      2: getImageUrl(dbOurPsc.card_2_image),
      3: getImageUrl(dbOurPsc.card_3_image),
    });
    setOurPscSelectedFiles({});
    Object.values(ourPscFileRefs).forEach(ref => { if (ref.current) ref.current.value = ""; });
    setIsOurPscEditing(false);
  };

  const handleOurPscSave = async () => {
    try {
      setSavingOurPsc(true);
      const token = localStorage.getItem("admin_token");
      if (!token) return;

      const formData = new FormData();
      Object.keys(ourPsc).forEach(key => {
        if (!key.includes('image')) {
          formData.append(key, ourPsc[key]);
        }
      });

      if (ourPscSelectedFiles[1]) formData.append("card_1_image", ourPscSelectedFiles[1]);
      if (ourPscSelectedFiles[2]) formData.append("card_2_image", ourPscSelectedFiles[2]);
      if (ourPscSelectedFiles[3]) formData.append("card_3_image", ourPscSelectedFiles[3]);

      const res = await fetch(`${API_URL}/api/admin/home-page/our-psc`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update Our PSC CMS");
      }

      const data = await res.json();
      if (data.success) {
        toast.success("Our PSC section updated successfully.");
        await fetchData();
        setIsOurPscEditing(false);
      } else {
        toast.error(data.message || "Error saving Our PSC");
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving Our PSC");
    } finally {
      setSavingOurPsc(false);
    }
  };

  // ===================== CUSTOMERS SAY HANDLERS =====================
  const handleCustomersSayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCustomersSay({ ...customersSay, [name]: type === "checkbox" ? (checked ? 1 : 0) : value });
  };

  const handleCustomersSayCancel = () => {
    setCustomersSay(dbCustomersSay);
    setIsCustomersSayEditing(false);
  };

  const handleCustomersSaySave = async () => {
    try {
      setSavingCustomersSay(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/home-page/customers-say`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(customersSay),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Customers Say section updated successfully.");
        await fetchData();
        setIsCustomersSayEditing(false);
      } else {
        toast.error(data.message || "Error saving Customers Say");
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving Customers Say");
    } finally {
      setSavingCustomersSay(false);
    }
  };

  // ===================== WE BELIEVE HANDLERS =====================
  const handleWeBelieveChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let checked = false;
    if (type === "checkbox") {
      checked = (e.target as HTMLInputElement).checked;
    }
    setWeBelieve({ ...weBelieve, [name]: type === "checkbox" ? (checked ? 1 : 0) : value });
  };

  const handleWeBelieveCancel = () => {
    setWeBelieve(dbWeBelieve);
    setIsWeBelieveEditing(false);
  };

  const handleWeBelieveSave = async () => {
    try {
      setSavingWeBelieve(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/home-page/we-believe`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(weBelieve),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("We Believe section updated successfully.");
        await fetchData();
        setIsWeBelieveEditing(false);
      } else {
        toast.error(data.message || "Error saving We Believe");
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving We Believe");
    } finally {
      setSavingWeBelieve(false);
    }
  };

  // ===================== FAQ HANDLERS =====================
  const handleFaqChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFaq({ ...faq, [name]: type === "checkbox" ? (checked ? 1 : 0) : value });
  };

  const handleFaqCancel = () => {
    setFaq(dbFaq);
    setIsFaqEditing(false);
  };

  const handleFaqSave = async () => {
    try {
      setSavingFaq(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/home-page/faq`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(faq),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("FAQ section updated successfully.");
        await fetchData();
        setIsFaqEditing(false);
      } else {
        toast.error(data.message || "Error saving FAQ");
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving FAQ");
    } finally {
      setSavingFaq(false);
    }
  };

  // ===================== RENDERERS =====================

  const HeroPreview = ({ currentHero, currentMarquee, currentImage }: { currentHero: any, currentMarquee: MarqueeItem[], currentImage: string }) => {
    
    const fadeUp: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    };

    const staggerContainer: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
    };

    const enabledMarquees = currentMarquee.filter(m => m.is_enabled === 1).map(m => m.marquee_text);
    const combinedList = enabledMarquees.length > 0 ? [...enabledMarquees, ...enabledMarquees, ...enabledMarquees, ...enabledMarquees, ...enabledMarquees] : [];

    if (currentHero.is_enabled === 0) {
      return (
        <div className="w-full min-h-[60vh] h-[60vh] flex flex-col items-center justify-center bg-gray-900 border border-gray-800 text-gray-500 rounded">
          Hero Section is Currently Disabled
        </div>
      );
    }

    return (
      <div className="relative z-0 w-full min-h-[80vh] h-[80vh] rounded border border-gray-800 overflow-hidden shadow-2xl">
        <div className='relative z-0 w-full h-full flex items-center overflow-hidden px-6 md:px-16 lg:px-24'>
            {currentImage && (
              <img
                  src={currentImage}
                  alt="Hero Background"
                  className='absolute inset-0 w-full h-full object-cover object-center -z-10'
              />
            )}
            <div className="absolute inset-0 bg-black/20 -z-10" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className='relative z-10 flex flex-col items-center text-center gap-4 max-w-lg md:ml-12 lg:ml-24'
            >
                <motion.div variants={fadeUp} className="flex flex-col items-center w-full px-2">
                    {currentHero.heading_enabled === 1 && (
                      <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif tracking-widest text-[#F9F6EE] mb-1 sm:mb-2 uppercase">
                          {currentHero.heading || "HEADING"}
                      </h1>
                    )}
                    {currentHero.sub_heading_enabled === 1 && (
                      <h2 className="text-[13px] sm:text-xl md:text-2xl font-serif tracking-[0.2em] sm:tracking-[0.25em] text-[#F9F6EE] uppercase mb-4 text-center">
                          {currentHero.sub_heading || "SUB HEADING"}
                      </h2>
                    )}
                    
                    {(currentHero.heading_enabled === 1 || currentHero.sub_heading_enabled === 1) && (
                      <div className="w-16 h-[1px] bg-[#F9F6EE]/60 my-3 sm:my-4"></div>
                    )}
                    
                    <div className="flex flex-col items-center mt-2 gap-1 text-center">
                        {currentHero.description_line_1_enabled === 1 && (
                          <p className="text-[9px] sm:text-sm md:text-base tracking-[0.15em] sm:tracking-[0.2em] font-medium text-[#F9F6EE]/90 uppercase">
                              {currentHero.description_line_1 || "DESC LINE 1"}
                          </p>
                        )}
                        {currentHero.description_line_2_enabled === 1 && (
                          <p className="text-[9px] sm:text-sm md:text-base tracking-[0.15em] sm:tracking-[0.2em] font-medium text-[#F9F6EE]/90 uppercase">
                              {currentHero.description_line_2 || "DESC LINE 2"}
                          </p>
                        )}
                    </div>
                </motion.div>
                
                <div className="mt-8">
                    <motion.button
                        variants={fadeUp}
                        type='button'
                        className='group bg-transparent border border-[#F9F6EE] text-[#F9F6EE] rounded-sm px-8 py-3.5 uppercase font-medium tracking-[0.8px] flex items-center gap-2 cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-[2px] hover:bg-[#F9F6EE] hover:text-[#081B46] hover:border-transparent hover:shadow-lg hover:shadow-black/20'
                    >
                        shop now
                        <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </motion.button>
                </div>
            </motion.div>
        </div>

        {/* Marquee */}
        {enabledMarquees.length > 0 && (
          <div className="absolute bottom-0 left-0 w-full z-20">
              <div className="flex items-center justify-center gap-10 scroll-container bg-white/10 backdrop-blur-md border-t border-white/20 py-4 w-full overflow-hidden shadow-[0_-8px_32px_rgba(0,0,0,0.1)]">
                  {combinedList.map((item, index) => (
                      <div
                          key={index}
                          className="flex items-center gap-2 scroll-text whitespace-nowrap animate-pulse"
                      >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="white"/>
                          </svg>
                          <p className="text-white font-medium text-lg">{item}</p>
                      </div>
                  ))}
              </div>
          </div>
        )}
      </div>
    );
  };

  const BreathPreview = ({ currentBreath, currentImage }: { currentBreath: any, currentImage: string }) => {
    if (currentBreath.is_enabled === 0) {
      return (
        <div className="w-full min-h-[40vh] h-[40vh] flex flex-col items-center justify-center bg-gray-900 border border-gray-800 text-gray-500 rounded">
          Breath Section is Currently Disabled
        </div>
      );
    }

    return (
      <div className="w-full rounded border border-gray-800 shadow-2xl overflow-hidden bg-[#081B46]">
        {/* We use #081B46 which maps to bg-primary from the client tailwind config */}
        <div className='px-6 sm:px-12 lg:px-16 py-8 md:py-20 w-full flex justify-center'>
            <div className='flex flex-col md:flex-row gap-8'>
                <div className='w-full md:w-1/2 flex justify-center md:justify-end'>
                    {currentImage && (
                        <img
                            src={currentImage}
                            alt="Breath Image"
                            width={500}
                            height={333}
                            className='rounded-md w-full h-auto object-cover'
                        />
                    )}
                </div>
                <div className='flex flex-col justify-center pb-3 md:w-2/5 text-center md:text-left'>
                    <h2 className='capitalize text-[#F9F6EE] font-serif text-3xl md:text-4xl lg:text-7xl transform scale-y-150 origin-center mb-6 md:mb-10 lg:mb-16'>
                      {currentBreath.heading_line_1_enabled === 1 && <>{currentBreath.heading_line_1 || 'Made'}<br className='hidden md:block' /> </>}
                      {currentBreath.heading_line_2_enabled === 1 && <>{currentBreath.heading_line_2 || 'For'} <br className='block md:hidden' /> </>}
                      {currentBreath.heading_highlight_enabled === 1 && <span className='text-[#D4AF37] italic'>{currentBreath.heading_highlight || 'Men ,'}</span>}
                      {currentBreath.heading_highlight_enabled === 1 && <br className='hidden md:block' />}
                      {currentBreath.heading_line_3_enabled === 1 && <>{currentBreath.heading_line_3 || 'Inspired by Nature'} </>}
                    </h2>
                    {currentBreath.description_enabled === 1 && (
                      <p className='text-[#E6E6E6] text-sm sm:text-base lg:text-lg tracking-wide leading-relaxed mt-4 md:mt-8'>
                        {currentBreath.description || "The right fabric makes every shirt better..."}
                      </p>
                    )}
                </div>
            </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="p-8 text-white">Loading...</div>;
  }

  return (
    <div className="p-6 text-white min-h-screen bg-[#050505]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-serif tracking-widest text-[#D4AF37] uppercase">
          Home Page
        </h1>
      </div>

      <div className="flex flex-col gap-20">
        
        {/* ================================= HERO SECTION ================================= */}
        <section className="flex flex-col gap-10">
          <div className="flex justify-between items-end border-b border-gray-800 pb-2">
            <h2 className="text-xl font-bold tracking-widest text-[#E5E5E5] uppercase">Hero Section</h2>
            {isHeroEditing && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400 font-medium">HERO SECTION ON/OFF:</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="is_enabled" className="sr-only peer" checked={hero.is_enabled === 1} onChange={handleHeroChange} />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                </label>
              </div>
            )}
          </div>

          <div className="w-full">
            <HeroPreview currentHero={hero} currentMarquee={marqueeItems} currentImage={heroImagePreview} />
          </div>

          {!isHeroEditing ? (
            <div className="flex justify-end">
              <button onClick={() => setIsHeroEditing(true)} className="bg-transparent border border-[#D4AF37] text-[#D4AF37] px-10 py-4 rounded font-medium tracking-wide hover:bg-[#D4AF37] hover:text-black transition-colors text-lg">
                EDIT
              </button>
            </div>
          ) : (
            <>
              <div className="bg-[#111111] p-8 rounded border border-gray-800 shadow-xl">
                <h2 className="text-2xl font-bold tracking-widest text-[#E5E5E5] uppercase border-b border-[#D4AF37] pb-3 inline-block mb-8">
                  Hero Editor
                </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Headings & Descriptions */}
              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Main Heading</label>
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                    <input type="text" name="heading" value={hero.heading} onChange={handleHeroChange} className="flex-1 bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                    <label className="flex items-center gap-2 min-w-[140px] shrink-0">
                      <input type="checkbox" name="heading_enabled" checked={hero.heading_enabled === 1} onChange={handleHeroChange} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-[#D4AF37]" />
                      <span className="text-sm text-gray-300">Show Heading</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Sub Heading</label>
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                    <input type="text" name="sub_heading" value={hero.sub_heading} onChange={handleHeroChange} className="flex-1 bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                    <label className="flex items-center gap-2 min-w-[140px] shrink-0">
                      <input type="checkbox" name="sub_heading_enabled" checked={hero.sub_heading_enabled === 1} onChange={handleHeroChange} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-[#D4AF37]" />
                      <span className="text-sm text-gray-300">Show Sub Heading</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Description Line 1</label>
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                    <input type="text" name="description_line_1" value={hero.description_line_1} onChange={handleHeroChange} className="flex-1 bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                    <label className="flex items-center gap-2 min-w-[140px] shrink-0">
                      <input type="checkbox" name="description_line_1_enabled" checked={hero.description_line_1_enabled === 1} onChange={handleHeroChange} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-[#D4AF37]" />
                      <span className="text-sm text-gray-300">Show Line 1</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Description Line 2</label>
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                    <input type="text" name="description_line_2" value={hero.description_line_2} onChange={handleHeroChange} className="flex-1 bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                    <label className="flex items-center gap-2 min-w-[140px] shrink-0">
                      <input type="checkbox" name="description_line_2_enabled" checked={hero.description_line_2_enabled === 1} onChange={handleHeroChange} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-[#D4AF37]" />
                      <span className="text-sm text-gray-300">Show Line 2</span>
                    </label>
                  </div>
                </div>
              </div>
              {/* Right Column: Background Image */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Hero Background Image</label>
                <div className="flex flex-col gap-4">
                  <div className="relative w-full max-w-sm aspect-[16/9] bg-[#1A1A1A] rounded border border-gray-700 overflow-hidden flex items-center justify-center">
                    {heroImagePreview ? (
                      <img src={heroImagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-500 text-sm">No Image</span>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" ref={heroFileInputRef} onChange={handleHeroImageChange} />
                  <button onClick={() => heroFileInputRef.current?.click()} className="flex items-center justify-center gap-2 max-w-sm bg-[#222222] border border-gray-700 px-6 py-3 rounded text-sm hover:bg-[#333333] transition-colors">
                    <Upload className="w-4 h-4" /> REPLACE IMAGE
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#111111] p-8 rounded border border-gray-800 shadow-xl">
            <h2 className="text-2xl font-bold tracking-widest text-[#E5E5E5] uppercase border-b border-[#D4AF37] pb-3 inline-block mb-8">
              Marquee Editor
            </h2>
            <div className="flex flex-col gap-4">
              {marqueeItems.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-center gap-4 bg-[#1A1A1A] p-4 rounded border border-gray-800 transition-colors hover:border-gray-600">
                  <span className="text-gray-500 font-mono w-6 shrink-0">{index + 1}.</span>
                  <input type="text" value={item.marquee_text} onChange={(e) => handleMarqueeChange(index, 'marquee_text', e.target.value)} className="flex-1 w-full bg-transparent border-b border-gray-700 px-2 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-lg" placeholder="Marquee Text" />
                  <div className="flex items-center gap-6 w-full sm:w-auto shrink-0 justify-between sm:justify-end mt-4 sm:mt-0">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={item.is_enabled === 1} onChange={(e) => handleMarqueeChange(index, 'is_enabled', e.target.checked ? 1 : 0)} className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-[#D4AF37]" />
                      <span className="text-sm text-gray-400">ON</span>
                    </label>
                    <div className="flex items-center gap-2 border-l border-gray-700 pl-6 ml-2">
                      <button onClick={() => handleMarqueeMove(index, 'up')} disabled={index === 0} className="text-gray-400 hover:text-white disabled:opacity-30 p-2">
                        <ArrowUp className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleMarqueeMove(index, 'down')} disabled={index === marqueeItems.length - 1} className="text-gray-400 hover:text-white disabled:opacity-30 p-2">
                        <ArrowDown className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleMarqueeDelete(index)} className="text-red-400 hover:text-red-300 p-2 ml-2">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={handleAddMarquee} className="flex items-center justify-center gap-2 bg-[#1A1A1A] border border-dashed border-gray-600 py-4 rounded text-sm hover:bg-[#222] transition-colors mt-4 text-[#D4AF37] hover:border-[#D4AF37]">
                <Plus className="w-5 h-5" /> ADD MARQUEE ITEM
              </button>
            </div>
          </div>

              <div className="flex justify-end items-center gap-6">
                <button onClick={handleHeroCancel} disabled={savingHero} className="bg-transparent border border-gray-600 text-gray-300 px-8 py-4 rounded font-medium tracking-wide hover:bg-gray-800 transition-colors text-lg">
                  CANCEL
                </button>
                <button onClick={handleHeroSave} disabled={savingHero} className="bg-[#D4AF37] text-black px-10 py-4 rounded font-medium tracking-wide hover:bg-[#b0902c] transition-colors shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] text-lg">
                  {savingHero ? "SAVING..." : "SAVE HERO CHANGES"}
                </button>
              </div>
            </>
          )}
        </section>

        {/* ================================= BREATH SECTION ================================= */}
        <section className="flex flex-col gap-10 mt-10">
          <div className="flex justify-between items-end border-b border-gray-800 pb-2">
            <h2 className="text-xl font-bold tracking-widest text-[#E5E5E5] uppercase">Breath Section</h2>
            {isBreathEditing && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400 font-medium">BREATH SECTION ON/OFF:</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="is_enabled" className="sr-only peer" checked={breath.is_enabled === 1} onChange={handleBreathChange} />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                </label>
              </div>
            )}
          </div>

          <div className="w-full">
            <BreathPreview currentBreath={breath} currentImage={breathImagePreview} />
          </div>

          {!isBreathEditing ? (
            <div className="flex justify-end">
              <button onClick={() => setIsBreathEditing(true)} className="bg-transparent border border-[#D4AF37] text-[#D4AF37] px-10 py-4 rounded font-medium tracking-wide hover:bg-[#D4AF37] hover:text-black transition-colors text-lg">
                EDIT
              </button>
            </div>
          ) : (
            <>
              <div className="bg-[#111111] p-8 rounded border border-gray-800 shadow-xl">
                <h2 className="text-2xl font-bold tracking-widest text-[#E5E5E5] uppercase border-b border-[#D4AF37] pb-3 inline-block mb-8">
                  Breath Editor
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Left Column: Headings & Description */}
                  <div className="flex flex-col gap-6">
                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Heading Line 1</label>
                      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                        <input type="text" name="heading_line_1" value={breath.heading_line_1} onChange={handleBreathChange} className="flex-1 bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                        <label className="flex items-center gap-2 min-w-[140px] shrink-0">
                          <input type="checkbox" name="heading_line_1_enabled" checked={breath.heading_line_1_enabled === 1} onChange={handleBreathChange} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-[#D4AF37]" />
                          <span className="text-sm text-gray-300">Show</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Heading Line 2</label>
                      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                        <input type="text" name="heading_line_2" value={breath.heading_line_2} onChange={handleBreathChange} className="flex-1 bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                        <label className="flex items-center gap-2 min-w-[140px] shrink-0">
                          <input type="checkbox" name="heading_line_2_enabled" checked={breath.heading_line_2_enabled === 1} onChange={handleBreathChange} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-[#D4AF37]" />
                          <span className="text-sm text-gray-300">Show</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase text-[#D4AF37]">Heading Highlight (Italic)</label>
                      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                        <input type="text" name="heading_highlight" value={breath.heading_highlight} onChange={handleBreathChange} className="flex-1 bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                        <label className="flex items-center gap-2 min-w-[140px] shrink-0">
                          <input type="checkbox" name="heading_highlight_enabled" checked={breath.heading_highlight_enabled === 1} onChange={handleBreathChange} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-[#D4AF37]" />
                          <span className="text-sm text-gray-300">Show</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Heading Line 3</label>
                      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                        <input type="text" name="heading_line_3" value={breath.heading_line_3} onChange={handleBreathChange} className="flex-1 bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                        <label className="flex items-center gap-2 min-w-[140px] shrink-0">
                          <input type="checkbox" name="heading_line_3_enabled" checked={breath.heading_line_3_enabled === 1} onChange={handleBreathChange} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-[#D4AF37]" />
                          <span className="text-sm text-gray-300">Show</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Description</label>
                      <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
                        <textarea name="description" value={breath.description} onChange={handleBreathChange} rows={4} className="flex-1 bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                        <label className="flex items-center gap-2 min-w-[140px] shrink-0 mt-2">
                          <input type="checkbox" name="description_enabled" checked={breath.description_enabled === 1} onChange={handleBreathChange} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-[#D4AF37]" />
                          <span className="text-sm text-gray-300">Show</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Breath Image */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Breath Image</label>
                    <div className="flex flex-col gap-4">
                      <div className="relative w-full max-w-sm aspect-[4/3] bg-[#1A1A1A] rounded border border-gray-700 overflow-hidden flex items-center justify-center">
                        {breathImagePreview ? (
                          <img src={breathImagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-500 text-sm">No Image</span>
                        )}
                      </div>
                      <input type="file" accept="image/*" className="hidden" ref={breathFileInputRef} onChange={handleBreathImageChange} />
                      <button onClick={() => breathFileInputRef.current?.click()} className="flex items-center justify-center gap-2 max-w-sm bg-[#222222] border border-gray-700 px-6 py-3 rounded text-sm hover:bg-[#333333] transition-colors">
                        <Upload className="w-4 h-4" /> REPLACE IMAGE
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end items-center gap-6 mb-12">
                <button onClick={handleBreathCancel} disabled={savingBreath} className="bg-transparent border border-gray-600 text-gray-300 px-8 py-4 rounded font-medium tracking-wide hover:bg-gray-800 transition-colors text-lg">
                  CANCEL
                </button>
                <button onClick={handleBreathSave} disabled={savingBreath} className="bg-[#D4AF37] text-black px-10 py-4 rounded font-medium tracking-wide hover:bg-[#b0902c] transition-colors shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] text-lg">
                  {savingBreath ? "SAVING..." : "SAVE BREATH CHANGES"}
                </button>
              </div>
            </>
          )}
        </section>

      {/* ======================= TOP PICKS SECTION ======================= */}
      <section className="flex flex-col gap-10 mt-10 border-t border-gray-800 pt-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold tracking-wide text-white">OUR TOP PICKS</h2>
            <div className="flex gap-4">
              {!isTopPicksEditing && (
                <button onClick={() => setIsTopPicksEditing(true)} className="bg-transparent border border-[#D4AF37] text-[#D4AF37] px-8 py-3 rounded font-medium tracking-wide hover:bg-[#D4AF37] hover:text-black transition-colors text-sm">
                  EDIT
                </button>
              )}
            </div>
          </div>
          
          <div className="mb-8">
             <ScaledPreview>
               <OurPicks previewConfig={topPicks} />
             </ScaledPreview>
          </div>

          {isTopPicksEditing && (
            <>
              <div className="bg-[#111] border border-gray-800 p-8 rounded shadow-2xl mb-12">
                <div className="grid grid-cols-1 gap-12">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm text-gray-400 font-medium">SECTION ON/OFF:</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" name="is_enabled" checked={topPicks.is_enabled === 1} onChange={handleTopPicksChange} />
                        <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Section Title</label>
                      <input type="text" name="section_name" value={topPicks.section_name || ""} onChange={handleTopPicksChange} className="w-full bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end items-center gap-6 mb-12">
                <button onClick={handleTopPicksCancel} disabled={savingTopPicks} className="bg-transparent border border-gray-600 text-gray-300 px-8 py-4 rounded font-medium tracking-wide hover:bg-gray-800 transition-colors text-lg">
                  CANCEL
                </button>
                <button onClick={handleTopPicksSave} disabled={savingTopPicks} className="bg-[#D4AF37] text-black px-10 py-4 rounded font-medium tracking-wide hover:bg-[#b0902c] transition-colors shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] text-lg">
                  {savingTopPicks ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </>
          )}
        </section>

      {/* ======================= SHOP CATEGORY SECTION ======================= */}
      <section className="flex flex-col gap-10 mt-10 border-t border-gray-800 pt-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold tracking-wide text-white">SHOP BY CATEGORY</h2>
            <div className="flex gap-4">
              {!isShopCategoryEditing && (
                <button onClick={() => setIsShopCategoryEditing(true)} className="bg-transparent border border-[#D4AF37] text-[#D4AF37] px-8 py-3 rounded font-medium tracking-wide hover:bg-[#D4AF37] hover:text-black transition-colors text-sm">
                  EDIT
                </button>
              )}
            </div>
          </div>
          
          <div className="mb-8">
             <ScaledPreview bg="bg-white">
               <Shopbycategory previewConfig={shopCategory} />
             </ScaledPreview>
          </div>

          {isShopCategoryEditing && (
            <>
              <div className="bg-[#111] border border-gray-800 p-8 rounded shadow-2xl mb-12">
                <div className="grid grid-cols-1 gap-12">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm text-gray-400 font-medium">SECTION ON/OFF:</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" name="is_enabled" checked={shopCategory.is_enabled === 1} onChange={handleShopCategoryChange} />
                        <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Section Title</label>
                      <input type="text" name="section_name" value={shopCategory.section_name || ""} onChange={handleShopCategoryChange} className="w-full bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end items-center gap-6 mb-12">
                <button onClick={handleShopCategoryCancel} disabled={savingShopCategory} className="bg-transparent border border-gray-600 text-gray-300 px-8 py-4 rounded font-medium tracking-wide hover:bg-gray-800 transition-colors text-lg">
                  CANCEL
                </button>
                <button onClick={handleShopCategorySave} disabled={savingShopCategory} className="bg-[#D4AF37] text-black px-10 py-4 rounded font-medium tracking-wide hover:bg-[#b0902c] transition-colors shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] text-lg">
                  {savingShopCategory ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </>
          )}
        </section>

      {/* ======================= SHOP BY SECTION ======================= */}
      <section className="flex flex-col gap-10 mt-10 border-t border-gray-800 pt-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold tracking-wide text-white">SHOP BY</h2>
            <div className="flex gap-4">
              {!isShopByEditing && (
                <button onClick={() => setIsShopByEditing(true)} className="bg-transparent border border-[#D4AF37] text-[#D4AF37] px-8 py-3 rounded font-medium tracking-wide hover:bg-[#D4AF37] hover:text-black transition-colors text-sm">
                  EDIT
                </button>
              )}
            </div>
          </div>
          
          <div className="mb-8">
             <ScaledPreview>
               <ShopbyTexturePatterns previewConfig={shopBy} />
             </ScaledPreview>
          </div>

          {isShopByEditing && (
            <>
              <div className="bg-[#111] border border-gray-800 p-8 rounded shadow-2xl mb-12">
                <div className="grid grid-cols-1 gap-12">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm text-gray-400 font-medium">SECTION ON/OFF:</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" name="is_enabled" checked={shopBy.is_enabled === 1} onChange={handleShopByChange} />
                        <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Section Title</label>
                      <input type="text" name="section_name" value={shopBy.section_name || ""} onChange={handleShopByChange} className="w-full bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end items-center gap-6 mb-12">
                <button onClick={handleShopByCancel} disabled={savingShopBy} className="bg-transparent border border-gray-600 text-gray-300 px-8 py-4 rounded font-medium tracking-wide hover:bg-gray-800 transition-colors text-lg">
                  CANCEL
                </button>
                <button onClick={handleShopBySave} disabled={savingShopBy} className="bg-[#D4AF37] text-black px-10 py-4 rounded font-medium tracking-wide hover:bg-[#b0902c] transition-colors shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] text-lg">
                  {savingShopBy ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </>
          )}
        </section>

      {/* ======================= WHERE COMFORT MEETS SECTION ======================= */}
      <section className="flex flex-col gap-10 mt-10 border-t border-gray-800 pt-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold tracking-wide text-white">WHERE COMFORT MEETS</h2>
            <div className="flex gap-4">
              {!isWhereComfortMeetsEditing && (
                <button onClick={() => setIsWhereComfortMeetsEditing(true)} className="bg-transparent border border-[#D4AF37] text-[#D4AF37] px-8 py-3 rounded font-medium tracking-wide hover:bg-[#D4AF37] hover:text-black transition-colors text-sm">
                  EDIT
                </button>
              )}
            </div>
          </div>
          
          <div className="mb-8">
             <ScaledPreview bg="bg-white">
               <WhereComfortMeets previewConfig={{ ...whereComfortMeets, image: whereComfortMeetsImagePreview || whereComfortMeets.image }} />
             </ScaledPreview>
          </div>

          {isWhereComfortMeetsEditing && (
            <>
              <div className="bg-[#111] border border-gray-800 p-8 rounded shadow-2xl mb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm text-gray-400 font-medium">SECTION ON/OFF:</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" name="is_enabled" checked={whereComfortMeets.is_enabled === 1} onChange={handleWhereComfortMeetsChange} />
                        <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                      </label>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium tracking-wide text-gray-300 uppercase">Heading Line 1</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" name="heading_line_1_enabled" checked={whereComfortMeets.heading_line_1_enabled === 1} onChange={handleWhereComfortMeetsChange} />
                          <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                        </label>
                      </div>
                      <input type="text" name="heading_line_1" value={whereComfortMeets.heading_line_1 || ""} onChange={handleWhereComfortMeetsChange} className="w-full bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium tracking-wide text-gray-300 uppercase">Highlight Text</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" name="heading_highlight_enabled" checked={whereComfortMeets.heading_highlight_enabled === 1} onChange={handleWhereComfortMeetsChange} />
                          <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                        </label>
                      </div>
                      <input type="text" name="heading_highlight" value={whereComfortMeets.heading_highlight || ""} onChange={handleWhereComfortMeetsChange} className="w-full bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium tracking-wide text-gray-300 uppercase">Heading Line 2</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" name="heading_line_2_enabled" checked={whereComfortMeets.heading_line_2_enabled === 1} onChange={handleWhereComfortMeetsChange} />
                          <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                        </label>
                      </div>
                      <input type="text" name="heading_line_2" value={whereComfortMeets.heading_line_2 || ""} onChange={handleWhereComfortMeetsChange} className="w-full bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium tracking-wide text-gray-300 uppercase">Description</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" name="description_enabled" checked={whereComfortMeets.description_enabled === 1} onChange={handleWhereComfortMeetsChange} />
                          <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                        </label>
                      </div>
                      <textarea name="description" value={whereComfortMeets.description || ""} onChange={handleWhereComfortMeetsChange} rows={3} className="w-full bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37] resize-y" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Background Image</label>
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center bg-[#1A1A1A] hover:bg-[#222] transition-colors relative min-h-[300px]">
                      {whereComfortMeetsImagePreview ? (
                        <div className="relative w-full h-full min-h-[250px]">
                          <Image src={whereComfortMeetsImagePreview} alt="Where Comfort Meets Preview" fill className="object-contain rounded" unoptimized />
                          <button type="button" onClick={() => document.getElementById('whereComfortMeetsUpload')?.click()} className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-2 rounded-full transition-colors">
                            <Upload className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center cursor-pointer" onClick={() => document.getElementById('whereComfortMeetsUpload')?.click()}>
                          <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                          <p className="text-gray-400">Click to upload background image</p>
                        </div>
                      )}
                      <input id="whereComfortMeetsUpload" type="file" ref={whereComfortMeetsFileInputRef} onChange={handleWhereComfortMeetsImageChange} accept="image/*" className="hidden" />
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Accepted formats: JPG, PNG, WEBP</p>
                      {whereComfortMeetsSelectedFile && (
                        <span className="text-sm text-[#D4AF37]">New file selected</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end items-center gap-6 mb-12">
                <button onClick={handleWhereComfortMeetsCancel} disabled={savingWhereComfortMeets} className="bg-transparent border border-gray-600 text-gray-300 px-8 py-4 rounded font-medium tracking-wide hover:bg-gray-800 transition-colors text-lg">
                  CANCEL
                </button>
                <button onClick={handleWhereComfortMeetsSave} disabled={savingWhereComfortMeets} className="bg-[#D4AF37] text-black px-10 py-4 rounded font-medium tracking-wide hover:bg-[#b0902c] transition-colors shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] text-lg">
                  {savingWhereComfortMeets ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </>
          )}
        </section>
        {/* ======================= EXCLUSIVE SUMMER LINENS SECTION ======================= */}
        <section className="flex flex-col gap-10 mt-10 border-t border-gray-800 pt-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold tracking-wide text-white uppercase">{exclusiveSummer.section_name || "EXCLUSIVE SUMMER LINENS"}</h2>
            <div className="flex gap-4">
              {!isExclusiveSummerEditing && (
                <button onClick={() => setIsExclusiveSummerEditing(true)} className="bg-transparent border border-[#D4AF37] text-[#D4AF37] px-8 py-3 rounded font-medium tracking-wide hover:bg-[#D4AF37] hover:text-black transition-colors text-sm">
                  EDIT
                </button>
              )}
            </div>
          </div>
          
          <div className="mb-8">
             <ScaledPreview bg="bg-white">
               <ExclusiveSummerLinens previewConfig={exclusiveSummer} />
             </ScaledPreview>
          </div>

          {isExclusiveSummerEditing && (
            <>
              <div className="bg-[#111] border border-gray-800 p-8 rounded shadow-2xl mb-12">
                <div className="grid grid-cols-1 gap-12">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm text-gray-400 font-medium">SECTION ON/OFF:</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" name="is_enabled" checked={exclusiveSummer.is_enabled === 1} onChange={handleExclusiveSummerChange} />
                        <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Section Title</label>
                      <input type="text" name="section_name" value={exclusiveSummer.section_name || ""} onChange={handleExclusiveSummerChange} className="w-full bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end items-center gap-6 mb-12">
                <button onClick={handleExclusiveSummerCancel} disabled={savingExclusiveSummer} className="bg-transparent border border-gray-600 text-gray-300 px-8 py-4 rounded font-medium tracking-wide hover:bg-gray-800 transition-colors text-lg">
                  CANCEL
                </button>
                <button onClick={handleExclusiveSummerSave} disabled={savingExclusiveSummer} className="bg-[#D4AF37] text-black px-10 py-4 rounded font-medium tracking-wide hover:bg-[#b0902c] transition-colors shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] text-lg">
                  {savingExclusiveSummer ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </>
          )}
        </section>

        {/* ======================= WHY LINEN SECTION ======================= */}
        <section className="flex flex-col gap-10 mt-10 border-t border-gray-800 pt-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold tracking-wide text-white uppercase">{whyLinen.section_name || "WHY LINEN"}</h2>
            <div className="flex gap-4">
              {!isWhyLinenEditing && (
                <button onClick={() => setIsWhyLinenEditing(true)} className="bg-transparent border border-[#D4AF37] text-[#D4AF37] px-8 py-3 rounded font-medium tracking-wide hover:bg-[#D4AF37] hover:text-black transition-colors text-sm">
                  EDIT
                </button>
              )}
            </div>
          </div>
          
          <div className="mb-8">
             <ScaledPreview bg="bg-white">
               <WhyLinen previewConfig={{ ...whyLinen, background_image: whyLinenImagePreview || whyLinen.background_image }} />
             </ScaledPreview>
          </div>

          {isWhyLinenEditing && (
            <>
              <div className="bg-[#111] border border-gray-800 p-8 rounded shadow-2xl mb-12">
                <div className="grid grid-cols-1 gap-12">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm text-gray-400 font-medium">SECTION ON/OFF:</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" name="is_enabled" checked={whyLinen.is_enabled === 1} onChange={handleWhyLinenChange} />
                        <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Section Title</label>
                      <input type="text" name="section_name" value={whyLinen.section_name || ""} onChange={handleWhyLinenChange} className="w-full bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-4 uppercase border-b border-gray-800 pb-2">Background Image</label>
                      <div className="flex flex-col gap-4">
                        {whyLinenImagePreview ? (
                          <div className="relative w-full aspect-[21/9] bg-black rounded border border-gray-800 overflow-hidden">
                            <Image src={whyLinenImagePreview} alt="Why Linen Preview" fill className="object-cover" unoptimized />
                            <button type="button" onClick={() => document.getElementById('whyLinenUpload')?.click()} className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white p-3 rounded-full transition-colors border border-gray-600">
                              <Upload className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-full aspect-[21/9] bg-[#1A1A1A] border-2 border-dashed border-gray-700 rounded flex flex-col items-center justify-center hover:border-[#D4AF37] transition-colors">
                            <div className="text-center cursor-pointer p-10" onClick={() => document.getElementById('whyLinenUpload')?.click()}>
                              <Upload className="w-10 h-10 text-gray-500 mx-auto mb-4" />
                              <p className="text-gray-400 font-medium">Click to upload background image</p>
                            </div>
                          </div>
                        )}
                        <input id="whyLinenUpload" type="file" ref={whyLinenFileInputRef} onChange={handleWhyLinenImageChange} accept="image/*" className="hidden" />
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Accepted formats: JPG, PNG, WEBP</p>
                          {whyLinenSelectedFile && <span className="text-sm text-[#D4AF37]">New file selected</span>}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <label className="block text-sm font-medium tracking-wide text-[#D4AF37] mb-6 uppercase border-b border-gray-800 pb-2">Feature 1 (Wind)</label>
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase">Title</label>
                          <input type="text" name="feature_1_title" value={whyLinen.feature_1_title || ""} onChange={handleWhyLinenChange} className="w-full bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase">Description</label>
                          <textarea name="feature_1_description" value={whyLinen.feature_1_description || ""} onChange={handleWhyLinenChange} rows={3} className="w-full bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37] resize-y" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium tracking-wide text-[#D4AF37] mb-6 uppercase border-b border-gray-800 pb-2">Feature 2 (Feather)</label>
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase">Title</label>
                          <input type="text" name="feature_2_title" value={whyLinen.feature_2_title || ""} onChange={handleWhyLinenChange} className="w-full bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase">Description</label>
                          <textarea name="feature_2_description" value={whyLinen.feature_2_description || ""} onChange={handleWhyLinenChange} rows={3} className="w-full bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37] resize-y" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium tracking-wide text-[#D4AF37] mb-6 uppercase border-b border-gray-800 pb-2">Feature 3 (Leaf)</label>
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase">Title</label>
                          <input type="text" name="feature_3_title" value={whyLinen.feature_3_title || ""} onChange={handleWhyLinenChange} className="w-full bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase">Description</label>
                          <textarea name="feature_3_description" value={whyLinen.feature_3_description || ""} onChange={handleWhyLinenChange} rows={3} className="w-full bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37] resize-y" />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
              <div className="flex justify-end items-center gap-6 mb-12">
                <button onClick={handleWhyLinenCancel} disabled={savingWhyLinen} className="bg-transparent border border-gray-600 text-gray-300 px-8 py-4 rounded font-medium tracking-wide hover:bg-gray-800 transition-colors text-lg">
                  CANCEL
                </button>
                <button onClick={handleWhyLinenSave} disabled={savingWhyLinen} className="bg-[#D4AF37] text-black px-10 py-4 rounded font-medium tracking-wide hover:bg-[#b0902c] transition-colors shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] text-lg">
                  {savingWhyLinen ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </>
          )}
        </section>

        {/* ======================= WHY FABRIC LUXURE SECTION ======================= */}
        <section className="flex flex-col gap-10 mt-10 border-t border-gray-800 pt-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold tracking-wide text-white uppercase">{whyFabricLuxure.section_name || "WHY FABRIC LUXURE ?"}</h2>
            <div className="flex gap-4">
              {!isWhyFabricLuxureEditing && (
                <button onClick={() => setIsWhyFabricLuxureEditing(true)} className="bg-transparent border border-[#D4AF37] text-[#D4AF37] px-8 py-3 rounded font-medium tracking-wide hover:bg-[#D4AF37] hover:text-black transition-colors text-sm">
                  EDIT
                </button>
              )}
            </div>
          </div>
          
          <div className="mb-8">
             <ScaledPreview bg="bg-white">
               <WhoWeAre previewConfig={whyFabricLuxure} />
             </ScaledPreview>
          </div>

          {isWhyFabricLuxureEditing && (
            <>
              <div className="bg-[#111] border border-gray-800 p-8 rounded shadow-2xl mb-12">
                <div className="grid grid-cols-1 gap-12">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm text-gray-400 font-medium">SECTION ON/OFF:</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" name="is_enabled" checked={whyFabricLuxure.is_enabled === 1} onChange={handleWhyFabricLuxureChange} />
                        <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Section Title</label>
                      <input type="text" name="section_name" value={whyFabricLuxure.section_name || ""} onChange={handleWhyFabricLuxureChange} className="w-full bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium tracking-wide text-gray-300 uppercase">Content 1</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" name="content_1_enabled" checked={whyFabricLuxure.content_1_enabled === 1} onChange={handleWhyFabricLuxureChange} />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                        </label>
                      </div>
                      <textarea name="content_1" value={whyFabricLuxure.content_1 || ""} onChange={handleWhyFabricLuxureChange} rows={4} className="w-full bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37] resize-y" />
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium tracking-wide text-gray-300 uppercase">Content 2</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" name="content_2_enabled" checked={whyFabricLuxure.content_2_enabled === 1} onChange={handleWhyFabricLuxureChange} />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                        </label>
                      </div>
                      <textarea name="content_2" value={whyFabricLuxure.content_2 || ""} onChange={handleWhyFabricLuxureChange} rows={4} className="w-full bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37] resize-y" />
                    </div>

                  </div>
                </div>
              </div>
              <div className="flex justify-end items-center gap-6 mb-12">
                <button onClick={handleWhyFabricLuxureCancel} disabled={savingWhyFabricLuxure} className="bg-transparent border border-gray-600 text-gray-300 px-8 py-4 rounded font-medium tracking-wide hover:bg-gray-800 transition-colors text-lg">
                  CANCEL
                </button>
                <button onClick={handleWhyFabricLuxureSave} disabled={savingWhyFabricLuxure} className="bg-[#D4AF37] text-black px-10 py-4 rounded font-medium tracking-wide hover:bg-[#b0902c] transition-colors shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] text-lg">
                  {savingWhyFabricLuxure ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </>
          )}
        </section>

        {/* ======================= OUR PSC SECTION ======================= */}
        <section className="flex flex-col gap-10 mt-10 border-t border-gray-800 pt-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold tracking-wide text-white uppercase">{ourPsc.section_name || "OUR PRODUCTS / OUR STORY / OUR COMMUNITY"}</h2>
            <div className="flex gap-4">
              {!isOurPscEditing && (
                <button onClick={() => setIsOurPscEditing(true)} className="bg-transparent border border-[#D4AF37] text-[#D4AF37] px-8 py-3 rounded font-medium tracking-wide hover:bg-[#D4AF37] hover:text-black transition-colors text-sm">
                  EDIT
                </button>
              )}
            </div>
          </div>
          
          <div className="mb-8">
             <ScaledPreview bg="bg-white">
               <OurPSC previewConfig={{
                 ...ourPsc,
                 card_1_image: ourPscImagePreviews[1] || ourPsc.card_1_image,
                 card_2_image: ourPscImagePreviews[2] || ourPsc.card_2_image,
                 card_3_image: ourPscImagePreviews[3] || ourPsc.card_3_image,
               }} />
             </ScaledPreview>
          </div>

          {isOurPscEditing && (
            <>
              <div className="bg-[#111] border border-gray-800 p-8 rounded shadow-2xl mb-12">
                <div className="grid grid-cols-1 gap-12">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm text-gray-400 font-medium">SECTION ON/OFF:</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" name="is_enabled" checked={ourPsc.is_enabled === 1} onChange={handleOurPscChange} />
                        <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Section Title</label>
                      <input type="text" name="section_name" value={ourPsc.section_name || ""} onChange={handleOurPscChange} className="w-full bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                    </div>

                    {[1, 2, 3].map((num) => (
                      <div key={num} className="mt-8 border-t border-gray-800 pt-6">
                        <div className="flex justify-between items-center mb-6">
                          <label className="block text-sm font-medium tracking-wide text-[#D4AF37] uppercase">Card {num}</label>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" name={`card_${num}_enabled`} checked={ourPsc[`card_${num}_enabled`] === 1} onChange={handleOurPscChange} />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                          </label>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-6">
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase">Title</label>
                            <input type="text" name={`card_${num}_title`} value={ourPsc[`card_${num}_title`] || ""} onChange={handleOurPscChange} className="w-full bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase">Image</label>
                            <div className="flex flex-col gap-4 max-w-sm">
                              {ourPscImagePreviews[num as keyof typeof ourPscImagePreviews] ? (
                                <div className="relative w-full aspect-4/5 bg-black rounded border border-gray-800 overflow-hidden">
                                  <Image src={ourPscImagePreviews[num as keyof typeof ourPscImagePreviews]} alt={`Card ${num} Preview`} fill className="object-cover" unoptimized />
                                  <button type="button" onClick={() => document.getElementById(`ourPscUpload${num}`)?.click()} className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white p-3 rounded-full transition-colors border border-gray-600">
                                    <Upload className="w-5 h-5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="w-full aspect-4/5 bg-[#1A1A1A] border-2 border-dashed border-gray-700 rounded flex flex-col items-center justify-center hover:border-[#D4AF37] transition-colors">
                                  <div className="text-center cursor-pointer p-6" onClick={() => document.getElementById(`ourPscUpload${num}`)?.click()}>
                                    <Upload className="w-8 h-8 text-gray-500 mx-auto mb-4" />
                                    <p className="text-gray-400 font-medium text-sm">Upload image</p>
                                  </div>
                                </div>
                              )}
                              <input id={`ourPscUpload${num}`} type="file" ref={ourPscFileRefs[num as keyof typeof ourPscFileRefs]} onChange={(e) => handleOurPscImageChange(e, num)} accept="image/*" className="hidden" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                  </div>
                </div>
              </div>
              <div className="flex justify-end items-center gap-6 mb-12">
                <button onClick={handleOurPscCancel} disabled={savingOurPsc} className="bg-transparent border border-gray-600 text-gray-300 px-8 py-4 rounded font-medium tracking-wide hover:bg-gray-800 transition-colors text-lg">
                  CANCEL
                </button>
                <button onClick={handleOurPscSave} disabled={savingOurPsc} className="bg-[#D4AF37] text-black px-10 py-4 rounded font-medium tracking-wide hover:bg-[#b0902c] transition-colors shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] text-lg">
                  {savingOurPsc ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </>
          )}
        </section>

        {/* ======================= CUSTOMERS SAY SECTION ======================= */}
        <section className="flex flex-col gap-10 mt-10 border-t border-gray-800 pt-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold tracking-wide text-white uppercase">{customersSay.section_name || "WHAT OUR CUSTOMERS SAY ?"}</h2>
            <div className="flex gap-4">
              {!isCustomersSayEditing && (
                <button onClick={() => setIsCustomersSayEditing(true)} className="bg-transparent border border-[#D4AF37] text-[#D4AF37] px-8 py-3 rounded font-medium tracking-wide hover:bg-[#D4AF37] hover:text-black transition-colors text-sm">
                  EDIT
                </button>
              )}
            </div>
          </div>
          
          <div className="mb-8">
             <ScaledPreview bg="bg-white">
               <CustomersSay previewConfig={customersSay} />
             </ScaledPreview>
          </div>

          {isCustomersSayEditing && (
            <>
              <div className="bg-[#111] border border-gray-800 p-8 rounded shadow-2xl mb-12">
                <div className="grid grid-cols-1 gap-12">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm text-gray-400 font-medium">SECTION ON/OFF:</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" name="is_enabled" checked={customersSay.is_enabled === 1} onChange={handleCustomersSayChange} />
                        <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Section Title</label>
                      <input type="text" name="section_name" value={customersSay.section_name || ""} onChange={handleCustomersSayChange} className="w-full bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                    </div>

                  </div>
                </div>
              </div>
              <div className="flex justify-end items-center gap-6 mb-12">
                <button onClick={handleCustomersSayCancel} disabled={savingCustomersSay} className="bg-transparent border border-gray-600 text-gray-300 px-8 py-4 rounded font-medium tracking-wide hover:bg-gray-800 transition-colors text-lg">
                  CANCEL
                </button>
                <button onClick={handleCustomersSaySave} disabled={savingCustomersSay} className="bg-[#D4AF37] text-black px-10 py-4 rounded font-medium tracking-wide hover:bg-[#b0902c] transition-colors shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] text-lg">
                  {savingCustomersSay ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </>
          )}
        </section>

        {/* ======================= WE BELIEVE SECTION ======================= */}
        <section className="flex flex-col gap-10 mt-10 border-t border-gray-800 pt-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold tracking-wide text-white uppercase">{weBelieve.section_name || "WE BELIEVE"}</h2>
            <div className="flex gap-4">
              {!isWeBelieveEditing && (
                <button onClick={() => setIsWeBelieveEditing(true)} className="bg-transparent border border-[#D4AF37] text-[#D4AF37] px-8 py-3 rounded font-medium tracking-wide hover:bg-[#D4AF37] hover:text-black transition-colors text-sm">
                  EDIT
                </button>
              )}
            </div>
          </div>
          
          <div className="mb-8">
             <ScaledPreview bg="bg-white">
               <WeBelieve previewConfig={weBelieve} />
             </ScaledPreview>
          </div>

          {isWeBelieveEditing && (
            <>
              <div className="bg-[#111] border border-gray-800 p-8 rounded shadow-2xl mb-12">
                <div className="grid grid-cols-1 gap-12">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm text-gray-400 font-medium">SECTION ON/OFF:</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" name="is_enabled" checked={weBelieve.is_enabled === 1} onChange={handleWeBelieveChange} />
                        <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Section Title</label>
                      <input type="text" name="section_name" value={weBelieve.section_name || ""} onChange={handleWeBelieveChange} className="w-full bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium tracking-wide text-gray-300 uppercase">Content 1</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" name="content_1_enabled" checked={weBelieve.content_1_enabled === 1} onChange={handleWeBelieveChange} />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                        </label>
                      </div>
                      <textarea name="content_1" value={weBelieve.content_1 || ""} onChange={handleWeBelieveChange} rows={4} className="w-full bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37] resize-y" />
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium tracking-wide text-gray-300 uppercase">Content 2</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" name="content_2_enabled" checked={weBelieve.content_2_enabled === 1} onChange={handleWeBelieveChange} />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                        </label>
                      </div>
                      <textarea name="content_2" value={weBelieve.content_2 || ""} onChange={handleWeBelieveChange} rows={4} className="w-full bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37] resize-y" />
                    </div>

                  </div>
                </div>
              </div>
              <div className="flex justify-end items-center gap-6 mb-12">
                <button onClick={handleWeBelieveCancel} disabled={savingWeBelieve} className="bg-transparent border border-gray-600 text-gray-300 px-8 py-4 rounded font-medium tracking-wide hover:bg-gray-800 transition-colors text-lg">
                  CANCEL
                </button>
                <button onClick={handleWeBelieveSave} disabled={savingWeBelieve} className="bg-[#D4AF37] text-black px-10 py-4 rounded font-medium tracking-wide hover:bg-[#b0902c] transition-colors shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] text-lg">
                  {savingWeBelieve ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </>
          )}
        </section>

        {/* ======================= FAQ SECTION ======================= */}
        <section className="flex flex-col gap-10 mt-10 border-t border-gray-800 pt-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold tracking-wide text-white uppercase">{faq.section_name || "FREQUENTLY ASKED QUESTIONS"}</h2>
            <div className="flex gap-4">
              {!isFaqEditing && (
                <button onClick={() => setIsFaqEditing(true)} className="bg-transparent border border-[#D4AF37] text-[#D4AF37] px-8 py-3 rounded font-medium tracking-wide hover:bg-[#D4AF37] hover:text-black transition-colors text-sm">
                  EDIT
                </button>
              )}
            </div>
          </div>
          
          <div className="mb-8">
             <ScaledPreview bg="bg-white">
               <FAQ previewConfig={faq} />
             </ScaledPreview>
          </div>

          {isFaqEditing && (
            <>
              <div className="bg-[#111] border border-gray-800 p-8 rounded shadow-2xl mb-12">
                <div className="grid grid-cols-1 gap-12">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm text-gray-400 font-medium">SECTION ON/OFF:</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" name="is_enabled" checked={faq.is_enabled === 1} onChange={handleFaqChange} />
                        <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Section Title</label>
                      <input type="text" name="section_name" value={faq.section_name || ""} onChange={handleFaqChange} className="w-full bg-[#1A1A1A] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                    </div>

                  </div>
                </div>
              </div>
              <div className="flex justify-end items-center gap-6 mb-12">
                <button onClick={handleFaqCancel} disabled={savingFaq} className="bg-transparent border border-gray-600 text-gray-300 px-8 py-4 rounded font-medium tracking-wide hover:bg-gray-800 transition-colors text-lg">
                  CANCEL
                </button>
                <button onClick={handleFaqSave} disabled={savingFaq} className="bg-[#D4AF37] text-black px-10 py-4 rounded font-medium tracking-wide hover:bg-[#b0902c] transition-colors shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] text-lg">
                  {savingFaq ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </>
          )}
        </section>

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .scroll-container {
          display: flex;
          width: 200%;
          animation: scroll 20s linear infinite;
        }
        .scroll-text {
          flex-shrink: 0;
        }
      `}} />
    </div>
  );
}
