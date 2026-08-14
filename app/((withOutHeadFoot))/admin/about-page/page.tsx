"use client";

import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Camera } from "lucide-react";
import Image from "next/image";
import AboutHero from "../../../../pages/about/AboutHero";
import WhereItBegin from "../../../../pages/about/WhereItBegin";
import Whatwestandfor from "../../../../pages/about/Whatwestandfor";
import TheMaking from "../../../../pages/about/TheMaking";
import ThePeople from "../../../../pages/about/ThePeople";
import ExperienceTheLinen from "../../../../pages/about/ExperienceTheLinen";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_URL = rawApiUrl.replace("localhost", "127.0.0.1");

const ScaledPreview = ({ children, bg = "bg-[#111111]", aspectRatio, interactive = false }: { children: React.ReactNode, bg?: string, aspectRatio?: string, interactive?: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(200);
  const [contentWidth, setContentWidth] = useState(1440);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current && contentRef.current) {
        const availableWidth = containerRef.current.clientWidth;
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

    const mutationObserver = new MutationObserver(() => {
      setTimeout(updateDimensions, 100);
      if (contentRef.current) {
        Array.from(contentRef.current.children).forEach(child => {
            resizeObserver.observe(child);
        });
      }
    });

    if (contentRef.current) {
      mutationObserver.observe(contentRef.current, { childList: true, subtree: true, characterData: true });
    }

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`w-full relative overflow-hidden rounded border border-gray-800 shadow-2xl transition-all duration-300 ${bg}`}
      style={{ height: `${height}px` }}
    >
      <div 
        ref={contentRef}
        className={`absolute top-0 left-0 origin-top-left ${interactive ? 'pointer-events-auto' : 'pointer-events-none'}`} 
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

export default function AboutPageAdmin() {
  const [loading, setLoading] = useState(true);

  // About Hero
  const [dbAboutHero, setDbAboutHero] = useState<any>({});
  const [aboutHero, setAboutHero] = useState<any>({
    section_name: "ABOUT HERO SECTION",
    is_enabled: 1,
    hero_image: "/images/about-us/about1.webp",
    title_line_1: "Made To Be Worn, Remembered,",
    title_line_2: "And Chosen Again",
    section_description: "A well-chosen fabric stays with you through countless moments. Our collections are thoughtfully selected for men who appreciate refined dressing and lasting value in every wardrobe.",
  });
  const [aboutHeroImage, setAboutHeroImage] = useState<File | null>(null);
  const [isAboutHeroEditing, setIsAboutHeroEditing] = useState(false);
  const [savingAboutHero, setSavingAboutHero] = useState(false);

  // Where It Began
  const [dbWhereItBegan, setDbWhereItBegan] = useState<any>({});
  const [whereItBegan, setWhereItBegan] = useState<any>({
    section_name: "WHERE IT BEGAN",
    is_enabled: 1,
    image_path: "/images/about-us/where-it-begin.webp",
    heading: "",
    heading_enabled: 1,
    title: "",
    title_enabled: 1,
    quote: "",
    quote_enabled: 1,
    paragraph_1: "",
    paragraph_1_enabled: 1,
    paragraph_2: "",
    paragraph_2_enabled: 1,
    paragraph_3: "",
    paragraph_3_enabled: 1,
  });
  const [whereItBeganImage, setWhereItBeganImage] = useState<File | null>(null);
  const [isWhereItBeganEditing, setIsWhereItBeganEditing] = useState(false);
  const [savingWhereItBegan, setSavingWhereItBegan] = useState(false);

  // What We Stand For
  const [dbWhatWeStandFor, setDbWhatWeStandFor] = useState<any>({});
  const [whatWeStandFor, setWhatWeStandFor] = useState<any>({
    section_name: "WHAT WE STAND FOR",
    section_enabled: 1,
    heading_line_1: "WHAT WE STAND FOR",
    heading_line_1_enabled: 1,
    heading_line_2: "Six Things We Will Never Compromise On",
    heading_line_2_enabled: 1,
    card_1_enabled: 1,
    card_1_title: "Carefully Chosen Fabrics",
    card_1_content: "We believe a great shirt starts with the right fabric . Every collection is selected for its look , feel , and everyday performance , helping you choose with confidence .",
    card_2_enabled: 1,
    card_2_title: "Timeless Style",
    card_2_content: "Trends come and go , but good style always stays . Our fabrics are chosen to suit every occasion , making them easy to wear today and for years to come .",
    card_3_enabled: 1,
    card_3_title: "Attention To Every Detail",
    card_3_content: "From fabric selection to the final finish , every detail matters . We believe small details create a better experience every time you wear our fabrics .",
    card_4_enabled: 1,
    card_4_title: "Made For Everyday Wear",
    card_4_content: "Your shirt should never stay in the wardrobe . Our fabrics are selected to suit everyday life , offering a balance of appearance , ease , and reliability .",
    card_5_enabled: 1,
    card_5_title: "Honest Fabric Selection",
    card_5_content: "We don't believe in confusing choices or unnecessary claims . We focus on offering fabrics that are carefully selected , clearly presented , and worth your trust .",
    card_6_enabled: 1,
    card_6_title: "Relationships Before Sales",
    card_6_content: "Every order is the beginning of a relationship . We value every customer by offering honest guidance , dependable service , and fabrics you can confidently choose again .",
  });
  const [isWhatWeStandForEditing, setIsWhatWeStandForEditing] = useState(false);
  const [savingWhatWeStandFor, setSavingWhatWeStandFor] = useState(false);

  // The Making
  const [dbTheMaking, setDbTheMaking] = useState<any>({});
  const [theMaking, setTheMaking] = useState<any>({
    section_name: "THE MAKING",
    section_enabled: 1,
    section_image: "/images/about-us/the.webp",
    title_line_1: "The Making !",
    title_line_1_enabled: 1,
    title_line_2: "Where Style Begins",
    title_line_2_enabled: 1,
    paragraph_1: "A well-made shirt begins long before it is stitched. It starts with choosing fabrics that suit different lifestyles, seasons, and occasions. From lightweight linen to soft cotton blends, every collection at Fabric Luxure is selected to help you dress with confidence, no matter where the day takes you.",
    paragraph_1_enabled: 1,
    paragraph_2: "We focus on fabrics that offer the right balance of comfort, durability, and style, ensuring they look great while feeling comfortable throughout the day.",
    paragraph_2_enabled: 1,
    paragraph_3: "Our carefully curated collections provide consistent quality, elegant finishes, and versatile designs to meet a wide range of fashion needs.",
    paragraph_3_enabled: 1,
    tags: [
      { text: "100% Linen", enabled: true },
      { text: "Linen Cotton", enabled: true },
      { text: "Pure Cotton", enabled: true },
      { text: "Cotton Blend", enabled: true },
      { text: "Everyday Wear", enabled: true },
      { text: "Formal Wear", enabled: true }
    ]
  });
  const [theMakingImage, setTheMakingImage] = useState<File | null>(null);
  const [isTheMakingEditing, setIsTheMakingEditing] = useState(false);
  const [savingTheMaking, setSavingTheMaking] = useState(false);

  // The People
  const [dbThePeople, setDbThePeople] = useState<any>({});
  const [thePeople, setThePeople] = useState<any>({
    section_name: "THE PEOPLE",
    is_enabled: 1,
    section_image: "/images/about-us/thepeople.webp",
    title_line_1: "THE PEOPLE !",
    title_line_1_enabled: 1,
    title_line_2: "Driven by craftsmanship and quality",
    title_line_2_enabled: 1,
    content_paragraph_1: "Behind every Fabric Luxure creation is a team devoted to excellence in fabric innovation, precision tailoring, and customer satisfaction. From sourcing the finest European linen to meticulous design and finishing, our artisans work together to craft garments that embody sophistication, comfort, and enduring quality.",
    content_paragraph_1_enabled: 1,
    content_paragraph_2: "Each piece reflects our commitment to timeless style and conscious craftsmanship — where luxury meets authenticity, and every detail tells a story of dedication and artistry.",
    content_paragraph_2_enabled: 1,
  });
  const [thePeopleImage, setThePeopleImage] = useState<File | null>(null);
  const [isThePeopleEditing, setIsThePeopleEditing] = useState(false);
  const [savingThePeople, setSavingThePeople] = useState(false);

  // Experience The Linen
  const [dbExperienceLinen, setDbExperienceLinen] = useState<any>({});
  const [experienceLinen, setExperienceLinen] = useState<any>({
    section_name: "Experience The Linen",
    is_enabled: 1,
    image_1: "/images/about-us/img-1.webp",
    image_2: "/images/about-us/img-3.webp",
    image_3: "/images/about-us/img-2.webp",
    image_4: "/images/about-us/img-4.webp",
    title_line_1: "Your Next Favourite Shirt",
    title_line_1_enabled: 1,
    title_line_2: "Begins Here",
    title_line_2_enabled: 1,
    section_description: "Explore a carefully selected range of fabrics that bring together timeless style, everyday wearability, and choices for every occasion.",
    section_description_enabled: 1,
  });
  const [experienceLinenImages, setExperienceLinenImages] = useState<{ [key: string]: File | null }>({
    image_1: null,
    image_2: null,
    image_3: null,
    image_4: null
  });
  const [isExperienceLinenEditing, setIsExperienceLinenEditing] = useState(false);
  const [savingExperienceLinen, setSavingExperienceLinen] = useState(false);

  useEffect(() => {
    fetchAboutPageData();
  }, []);

  const fetchAboutPageData = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      
      const res = await fetch(`${API_URL}/api/admin/about-page/about-hero`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setDbAboutHero(data.data);
          setAboutHero({
            section_name: data.data.section_name || "ABOUT HERO SECTION",
            is_enabled: data.data.is_enabled !== undefined ? data.data.is_enabled : 1,
            hero_image: data.data.hero_image || "/images/about-us/about1.webp",
            title_line_1: data.data.title_line_1 || "",
            title_line_2: data.data.title_line_2 || "",
            section_description: data.data.section_description || "",
          });
        }
      }
      const resWhereItBegan = await fetch(`${API_URL}/api/admin/about-page/where-it-began`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resWhereItBegan.ok) {
        const data = await resWhereItBegan.json();
        if (data.success && data.data) {
          setDbWhereItBegan(data.data);
          setWhereItBegan({
            section_name: data.data.section_name || "WHERE IT BEGAN",
            is_enabled: data.data.is_enabled !== undefined ? data.data.is_enabled : 1,
            image_path: data.data.image_path || "/images/about-us/where-it-begin.webp",
            heading: data.data.heading || "",
            heading_enabled: data.data.heading_enabled !== undefined ? data.data.heading_enabled : 1,
            title: data.data.title || "",
            title_enabled: data.data.title_enabled !== undefined ? data.data.title_enabled : 1,
            quote: data.data.quote || "",
            quote_enabled: data.data.quote_enabled !== undefined ? data.data.quote_enabled : 1,
            paragraph_1: data.data.paragraph_1 || "",
            paragraph_1_enabled: data.data.paragraph_1_enabled !== undefined ? data.data.paragraph_1_enabled : 1,
            paragraph_2: data.data.paragraph_2 || "",
            paragraph_2_enabled: data.data.paragraph_2_enabled !== undefined ? data.data.paragraph_2_enabled : 1,
            paragraph_3: data.data.paragraph_3 || "",
            paragraph_3_enabled: data.data.paragraph_3_enabled !== undefined ? data.data.paragraph_3_enabled : 1,
          });
        }
      }

      const resWhatWeStandFor = await fetch(`${API_URL}/api/admin/about-page/what-we-stand-for`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resWhatWeStandFor.ok) {
        const data = await resWhatWeStandFor.json();
        if (data.success && data.data) {
          setDbWhatWeStandFor(data.data);
          setWhatWeStandFor({
            section_name: data.data.section_name || "WHAT WE STAND FOR",
            section_enabled: data.data.section_enabled !== undefined ? data.data.section_enabled : 1,
            heading_line_1: data.data.heading_line_1 || "",
            heading_line_1_enabled: data.data.heading_line_1_enabled !== undefined ? data.data.heading_line_1_enabled : 1,
            heading_line_2: data.data.heading_line_2 || "",
            heading_line_2_enabled: data.data.heading_line_2_enabled !== undefined ? data.data.heading_line_2_enabled : 1,
            card_1_enabled: data.data.card_1_enabled !== undefined ? data.data.card_1_enabled : 1,
            card_1_title: data.data.card_1_title || "",
            card_1_content: data.data.card_1_content || "",
            card_2_enabled: data.data.card_2_enabled !== undefined ? data.data.card_2_enabled : 1,
            card_2_title: data.data.card_2_title || "",
            card_2_content: data.data.card_2_content || "",
            card_3_enabled: data.data.card_3_enabled !== undefined ? data.data.card_3_enabled : 1,
            card_3_title: data.data.card_3_title || "",
            card_3_content: data.data.card_3_content || "",
            card_4_enabled: data.data.card_4_enabled !== undefined ? data.data.card_4_enabled : 1,
            card_4_title: data.data.card_4_title || "",
            card_4_content: data.data.card_4_content || "",
            card_5_enabled: data.data.card_5_enabled !== undefined ? data.data.card_5_enabled : 1,
            card_5_title: data.data.card_5_title || "",
            card_5_content: data.data.card_5_content || "",
            card_6_enabled: data.data.card_6_enabled !== undefined ? data.data.card_6_enabled : 1,
            card_6_title: data.data.card_6_title || "",
            card_6_content: data.data.card_6_content || "",
          });
        }
      }

      const resTheMaking = await fetch(`${API_URL}/api/admin/about-page/the-making`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resTheMaking.ok) {
        const json = await resTheMaking.json();
        if (json.success && json.data) {
          setDbTheMaking(json.data);
          setTheMaking(json.data);
        }
      }

      // Fetch The People
      const resThePeople = await fetch(`${API_URL}/api/admin/about-page/the-people`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resThePeople.ok) {
        const json = await resThePeople.json();
        if (json.success && json.data) {
          setDbThePeople(json.data);
          setThePeople(json.data);
        }
      }

      // Fetch Experience The Linen
      const resExperienceLinen = await fetch(`${API_URL}/api/admin/about-page/experience-linen`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resExperienceLinen.ok) {
        const json = await resExperienceLinen.json();
        if (json.success && json.data) {
          setDbExperienceLinen(json.data);
          setExperienceLinen(json.data);
        }
      }

    } catch (error) {
      console.error("Error fetching About Page data:", error);
      toast.error("Failed to load About Page data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAboutHero = async () => {
    setSavingAboutHero(true);
    const token = localStorage.getItem("admin_token");
    
    try {
      const formData = new FormData();
      formData.append("title_line_1", aboutHero.title_line_1);
      formData.append("title_line_2", aboutHero.title_line_2);
      formData.append("section_description", aboutHero.section_description);
      formData.append("is_enabled", aboutHero.is_enabled.toString());
      
      if (aboutHeroImage) {
        formData.append("hero_image", aboutHeroImage);
      }
      
      const res = await fetch(`${API_URL}/api/admin/about-page/about-hero`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success("About Hero saved successfully.");
        setIsAboutHeroEditing(false);
        setAboutHeroImage(null);
        fetchAboutPageData();
      } else {
        toast.error(data.error || "Failed to save.");
      }
    } catch (error) {
      console.error("Save About Hero error:", error);
      toast.error("Failed to save. Try again.");
    } finally {
      setSavingAboutHero(false);
    }
  };

  const handleSaveWhereItBegan = async () => {
    setSavingWhereItBegan(true);
    const token = localStorage.getItem("admin_token");
    
    try {
      const formData = new FormData();
      formData.append("is_enabled", whereItBegan.is_enabled.toString());
      formData.append("heading", whereItBegan.heading);
      formData.append("heading_enabled", whereItBegan.heading_enabled.toString());
      formData.append("title", whereItBegan.title);
      formData.append("title_enabled", whereItBegan.title_enabled.toString());
      formData.append("quote", whereItBegan.quote);
      formData.append("quote_enabled", whereItBegan.quote_enabled.toString());
      formData.append("paragraph_1", whereItBegan.paragraph_1);
      formData.append("paragraph_1_enabled", whereItBegan.paragraph_1_enabled.toString());
      formData.append("paragraph_2", whereItBegan.paragraph_2);
      formData.append("paragraph_2_enabled", whereItBegan.paragraph_2_enabled.toString());
      formData.append("paragraph_3", whereItBegan.paragraph_3);
      formData.append("paragraph_3_enabled", whereItBegan.paragraph_3_enabled.toString());
      
      if (whereItBeganImage) {
        formData.append("image_path", whereItBeganImage);
      }
      
      const res = await fetch(`${API_URL}/api/admin/about-page/where-it-began`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success("Where It Began saved successfully.");
        setIsWhereItBeganEditing(false);
        setWhereItBeganImage(null);
        fetchAboutPageData();
      } else {
        toast.error(data.error || "Failed to save.");
      }
    } catch (error) {
      console.error("Save Where It Began error:", error);
      toast.error("Failed to save. Try again.");
    } finally {
      setSavingWhereItBegan(false);
    }
  };

  const handleSaveWhatWeStandFor = async () => {
    setSavingWhatWeStandFor(true);
    const token = localStorage.getItem("admin_token");
    
    try {
      const res = await fetch(`${API_URL}/api/admin/about-page/what-we-stand-for`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(whatWeStandFor)
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success("What We Stand For saved successfully.");
        setIsWhatWeStandForEditing(false);
        fetchAboutPageData(); // Refresh to get the latest
      } else {
        toast.error("Failed to update What We Stand For.");
      }
    } catch (error) {
      console.error("Save What We Stand For Error:", error);
      toast.error("Failed to update What We Stand For.");
    } finally {
      setSavingWhatWeStandFor(false);
    }
  };

  const handleSaveTheMaking = async () => {
    setSavingTheMaking(true);
    const token = localStorage.getItem("admin_token");

    try {
      const formData = new FormData();
      formData.append("section_enabled", theMaking.section_enabled.toString());
      formData.append("title_line_1", theMaking.title_line_1);
      formData.append("title_line_1_enabled", theMaking.title_line_1_enabled.toString());
      formData.append("title_line_2", theMaking.title_line_2);
      formData.append("title_line_2_enabled", theMaking.title_line_2_enabled.toString());
      formData.append("paragraph_1", theMaking.paragraph_1);
      formData.append("paragraph_1_enabled", theMaking.paragraph_1_enabled.toString());
      formData.append("paragraph_2", theMaking.paragraph_2);
      formData.append("paragraph_2_enabled", theMaking.paragraph_2_enabled.toString());
      formData.append("paragraph_3", theMaking.paragraph_3);
      formData.append("paragraph_3_enabled", theMaking.paragraph_3_enabled.toString());
      formData.append("tags", JSON.stringify(theMaking.tags));

      if (theMakingImage) {
        formData.append("section_image", theMakingImage);
      }

      const res = await fetch(`${API_URL}/api/admin/about-page/the-making`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      toast.success("The Making section updated successfully!");
      if (data.data) {
          setDbTheMaking(data.data);
          let parsedTags = data.data.tags;
          if (typeof parsedTags === 'string') {
            try {
              parsedTags = JSON.parse(parsedTags);
            } catch(e) {
              parsedTags = [];
            }
          }
          setTheMaking({ ...theMaking, ...data.data, tags: parsedTags || [] });
      }
      setIsTheMakingEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save The Making");
    } finally {
      setSavingTheMaking(false);
    }
  };

  const handleSaveThePeople = async () => {
    setSavingThePeople(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      Object.keys(thePeople).forEach(key => {
        formData.append(key, thePeople[key]);
      });
      if (thePeopleImage) {
        formData.append("section_image", thePeopleImage);
      }

      const res = await fetch(`${API_URL}/api/admin/about-page/the-people`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      const json = await res.json();
      if (json.success) {
        toast.success("The People saved successfully");
        setDbThePeople(json.data);
        setThePeople(json.data);
        setThePeopleImage(null);
        setIsThePeopleEditing(false);
      } else {
        toast.error(json.error || "Failed to save");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save The People");
    } finally {
      setSavingThePeople(false);
    }
  };

  const handleSaveExperienceLinen = async () => {
    setSavingExperienceLinen(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
      const formData = new FormData();
      Object.keys(experienceLinen).forEach(key => {
        formData.append(key, experienceLinen[key]);
      });
      
      if (experienceLinenImages.image_1) formData.append("image_1", experienceLinenImages.image_1);
      if (experienceLinenImages.image_2) formData.append("image_2", experienceLinenImages.image_2);
      if (experienceLinenImages.image_3) formData.append("image_3", experienceLinenImages.image_3);
      if (experienceLinenImages.image_4) formData.append("image_4", experienceLinenImages.image_4);

      const res = await fetch(`${API_URL}/api/admin/about-page/experience-linen`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Experience The Linen saved successfully");
        setDbExperienceLinen(json.data);
        setExperienceLinen(json.data);
        setExperienceLinenImages({ image_1: null, image_2: null, image_3: null, image_4: null });
        setIsExperienceLinenEditing(false);
      } else {
        toast.error(json.error || "Failed to save");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save Experience The Linen");
    } finally {
      setSavingExperienceLinen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col animate-fade-in">
      {/* Page Header */}
      <div className="flex-none mb-8">
        <h2 className="font-instrumentserif text-3xl font-normal uppercase tracking-wider text-white">
          About Page
        </h2>
        <p className="text-[14px] text-[#D3D3D3]/80 mt-1.5">
          Manage content, visibility, and layout for the About Page.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-12 pb-12 w-full">
        
        {/* About Hero Section */}
        <section className="bg-[#081A42] border border-[#102554] rounded-2xl overflow-hidden shadow-2xl relative w-full">
          {/* Header */}
          <div className="bg-[#0A1D4A] border-b border-[#102554] px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="font-instrumentserif text-xl text-[#D4AF37] uppercase tracking-widest font-semibold flex items-center gap-3">
              {aboutHero.section_name || "ABOUT HERO SECTION"}
            </h3>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Enable/Disable status badge removed from header, moved to modal */}
              <div className="flex items-center gap-2 bg-[#081A42] px-3 py-1.5 rounded-lg border border-[#102554]">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status:</span>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${aboutHero.is_enabled === 1 ? 'text-emerald-400' : 'text-gray-400'}`}>
                  {aboutHero.is_enabled === 1 ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <button
                onClick={() => setIsAboutHeroEditing(true)}
                className="bg-[#D4AF37] hover:bg-[#C89B2B] text-black px-4 py-1.5 rounded text-[13px] font-bold uppercase tracking-wider transition-colors w-full sm:w-auto text-center"
              >
                Edit
              </button>
            </div>
          </div>
          
          {/* Live Preview */}
          <div className="p-6 bg-[#050505]">
             <ScaledPreview bg="bg-white">
                <AboutHero previewConfig={aboutHero} />
             </ScaledPreview>
          </div>
        </section>

        {/* Where It Began Section */}
        <section className="bg-[#081A42] border border-[#102554] rounded-2xl overflow-hidden shadow-2xl relative w-full">
          {/* Header */}
          <div className="bg-[#0A1D4A] border-b border-[#102554] px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="font-instrumentserif text-xl text-[#D4AF37] uppercase tracking-widest font-semibold flex items-center gap-3">
              {whereItBegan.section_name || "WHERE IT BEGAN"}
            </h3>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Status Badge */}
              <div className="flex items-center gap-2 bg-[#081A42] px-3 py-1.5 rounded-lg border border-[#102554]">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status:</span>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${whereItBegan.is_enabled === 1 ? 'text-emerald-400' : 'text-gray-400'}`}>
                  {whereItBegan.is_enabled === 1 ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <button
                onClick={() => setIsWhereItBeganEditing(true)}
                className="bg-[#D4AF37] hover:bg-[#C89B2B] text-black px-4 py-1.5 rounded text-[13px] font-bold uppercase tracking-wider transition-colors w-full sm:w-auto text-center"
              >
                Edit
              </button>
            </div>
          </div>
          
          {/* Live Preview */}
          <div className="p-6 bg-[#050505]">
             <ScaledPreview bg="bg-white" aspectRatio="2/1">
                <WhereItBegin previewConfig={whereItBegan} />
             </ScaledPreview>
          </div>
        </section>

        {/* What We Stand For Section */}
        <section className="bg-[#081A42] border border-[#102554] rounded-2xl overflow-hidden shadow-2xl relative w-full mt-10">
          {/* Header */}
          <div className="bg-[#0A1D4A] border-b border-[#102554] px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="font-instrumentserif text-xl text-[#D4AF37] uppercase tracking-widest font-semibold flex items-center gap-3">
              {whatWeStandFor.section_name || "WHAT WE STAND FOR"}
            </h3>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Status Badge */}
              <div className="flex items-center gap-2 bg-[#081A42] px-3 py-1.5 rounded-lg border border-[#102554]">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status:</span>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${whatWeStandFor.section_enabled === 1 ? 'text-emerald-400' : 'text-gray-400'}`}>
                  {whatWeStandFor.section_enabled === 1 ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <button
                onClick={() => setIsWhatWeStandForEditing(true)}
                className="bg-[#D4AF37] hover:bg-[#C89B2B] text-black px-4 py-1.5 rounded text-[13px] font-bold uppercase tracking-wider transition-colors w-full sm:w-auto text-center"
              >
                Edit
              </button>
            </div>
          </div>

          {/* Live Preview */}
          <div className="p-6 bg-[#050505]">
             <ScaledPreview bg="bg-[#1a1a1a]">
                <Whatwestandfor previewConfig={whatWeStandFor} />
             </ScaledPreview>
          </div>
        </section>

        {/* The Making Section */}
        <section className="bg-[#081A42] border border-[#102554] rounded-2xl overflow-hidden shadow-2xl relative w-full">
          {/* Header */}
          <div className="bg-[#0A1D4A] border-b border-[#102554] px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="font-instrumentserif text-xl text-[#D4AF37] uppercase tracking-widest font-semibold flex items-center gap-3">
              {theMaking.section_name || "THE MAKING"}
            </h3>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-[#081A42] px-3 py-1.5 rounded-lg border border-[#102554]">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status:</span>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${theMaking.section_enabled === 1 ? 'text-emerald-400' : 'text-gray-400'}`}>
                  {theMaking.section_enabled === 1 ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <button
                onClick={() => setIsTheMakingEditing(true)}
                className="bg-[#D4AF37] hover:bg-[#C89B2B] text-black px-4 py-1.5 rounded text-[13px] font-bold uppercase tracking-wider transition-colors w-full sm:w-auto text-center"
              >
                Edit
              </button>
            </div>
          </div>

          {/* Live Preview */}
          <div className="p-6 bg-[#050505]">
            <ScaledPreview bg="bg-[#1a1a1a]">
              <TheMaking previewConfig={theMaking} />
            </ScaledPreview>
          </div>
        </section>

        {/* The People Section */}
        <section className="bg-[#081A42] border border-[#102554] rounded-2xl overflow-hidden shadow-2xl relative w-full mt-10">
          {/* Header */}
          <div className="bg-[#0A1D4A] border-b border-[#102554] px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="font-instrumentserif text-xl text-[#D4AF37] uppercase tracking-widest font-semibold flex items-center gap-3">
              {thePeople.section_name || "THE PEOPLE"}
            </h3>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-[#081A42] px-3 py-1.5 rounded-lg border border-[#102554]">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status:</span>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${thePeople.is_enabled === 1 ? 'text-emerald-400' : 'text-gray-400'}`}>
                  {thePeople.is_enabled === 1 ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <button 
                onClick={() => setIsThePeopleEditing(true)}
                className="bg-[#D4AF37] hover:bg-[#C89B2B] text-black px-4 py-1.5 rounded text-[13px] font-bold uppercase tracking-wider transition-colors w-full sm:w-auto text-center"
              >
                Edit
              </button>
            </div>
          </div>
          
          {/* Live Preview */}
          <div className="p-6 bg-[#050505]">
            <ScaledPreview bg="bg-[#1a1a1a]">
              <ThePeople previewConfig={thePeople} />
            </ScaledPreview>
          </div>
        </section>

        {/* Experience The Linen Section */}
        <section className="bg-[#081A42] border border-[#102554] rounded-2xl overflow-hidden shadow-2xl relative w-full mt-10">
          {/* Header */}
          <div className="bg-[#0A1D4A] border-b border-[#102554] px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="font-instrumentserif text-xl text-[#D4AF37] uppercase tracking-widest font-semibold flex items-center gap-3">
              {experienceLinen.section_name || "EXPERIENCE THE LINEN"}
            </h3>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-[#081A42] px-3 py-1.5 rounded-lg border border-[#102554]">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status:</span>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${experienceLinen.is_enabled === 1 ? 'text-emerald-400' : 'text-gray-400'}`}>
                  {experienceLinen.is_enabled === 1 ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <button 
                onClick={() => setIsExperienceLinenEditing(true)}
                className="bg-[#D4AF37] hover:bg-[#C89B2B] text-black px-4 py-1.5 rounded text-[13px] font-bold uppercase tracking-wider transition-colors w-full sm:w-auto text-center"
              >
                Edit
              </button>
            </div>
          </div>
          
          {/* Live Preview */}
          <div className="p-6 bg-[#050505]">
            <ScaledPreview bg="bg-[#1a1a1a]" interactive={true}>
              <ExperienceTheLinen previewConfig={experienceLinen} previewMode={true} />
            </ScaledPreview>
          </div>
        </section>
      </div>

      {/* Editor Modal for About Hero */}
      {isAboutHeroEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#081A42] border border-[#102554] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#102554] bg-[#0A1D4A] flex justify-between items-center shrink-0">
              <h3 className="font-instrumentserif text-2xl text-[#D4AF37] uppercase tracking-widest">
                Edit About Hero Section
              </h3>
              <button 
                onClick={() => setIsAboutHeroEditing(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
              
              {/* Enable/Disable Toggle inside Modal */}
              <div className="flex items-center justify-between bg-[#0A1D4A] p-4 rounded-lg border border-[#102554]">
                <div>
                  <h4 className="text-[13px] font-bold uppercase tracking-wider text-[#D4AF37]">Section Visibility</h4>
                  <p className="text-[12px] text-gray-400 mt-1">Enable or disable the entire About Hero section on the public website.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${aboutHero.is_enabled === 1 ? 'text-emerald-400' : 'text-gray-400'}`}>
                    {aboutHero.is_enabled === 1 ? 'Enabled' : 'Disabled'}
                  </span>
                  <button 
                    onClick={() => setAboutHero({ ...aboutHero, is_enabled: aboutHero.is_enabled === 1 ? 0 : 1 })}
                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${aboutHero.is_enabled === 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${aboutHero.is_enabled === 1 ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
              
              {/* Image Upload */}
              <div className="space-y-3">
                <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37]">
                  Hero Banner Image (Desktop & Mobile)
                </label>
                <div className="flex gap-6 items-start">
                  <div className="w-1/2">
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-[#102554] border-dashed rounded-lg cursor-pointer bg-[#0A1D4A]/50 hover:bg-[#102554] transition-colors relative overflow-hidden group">
                      {aboutHeroImage || aboutHero.hero_image ? (
                        <>
                          <Image 
                            src={aboutHeroImage ? URL.createObjectURL(aboutHeroImage) : encodeURI(`${aboutHero.hero_image.startsWith('http') ? '' : (aboutHero.hero_image.startsWith('/uploads') ? API_URL : '')}${aboutHero.hero_image}`)}
                            alt="Hero Preview"
                            fill
                            unoptimized={true}
                            className="object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Camera className="w-8 h-8 text-white mb-2" />
                             <span className="text-sm font-semibold text-white bg-black/50 px-3 py-1 rounded">Change Image</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Camera className="w-8 h-8 text-gray-400 mb-3" />
                          <p className="text-sm text-gray-400">Click to upload</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setAboutHeroImage(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Recommended size: 1920x1080px (WebP/JPG)</p>
                  </div>
                </div>
              </div>

              {/* Text Fields */}
              <div className="space-y-4">
                 <div>
                    <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37] mb-2">Title Line 1</label>
                    <input 
                      type="text"
                      value={aboutHero.title_line_1}
                      onChange={(e) => setAboutHero({ ...aboutHero, title_line_1: e.target.value })}
                      className="w-full bg-[#0A1D4A] border border-[#102554] rounded-lg p-3 text-white focus:outline-none focus:border-[#D4AF37]"
                      placeholder="Made To Be Worn, Remembered,"
                    />
                 </div>
                 <div>
                    <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37] mb-2">Title Line 2</label>
                    <input 
                      type="text"
                      value={aboutHero.title_line_2}
                      onChange={(e) => setAboutHero({ ...aboutHero, title_line_2: e.target.value })}
                      className="w-full bg-[#0A1D4A] border border-[#102554] rounded-lg p-3 text-white focus:outline-none focus:border-[#D4AF37]"
                      placeholder="And Chosen Again"
                    />
                 </div>
                 <div>
                    <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37] mb-2">Description Paragraph</label>
                    <textarea 
                      value={aboutHero.section_description}
                      onChange={(e) => setAboutHero({ ...aboutHero, section_description: e.target.value })}
                      rows={4}
                      className="w-full bg-[#0A1D4A] border border-[#102554] rounded-lg p-3 text-white focus:outline-none focus:border-[#D4AF37]"
                      placeholder="A well-chosen fabric stays with you..."
                    />
                 </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#102554] bg-[#0A1D4A] shrink-0 flex justify-end gap-4">
              <button 
                onClick={() => {
                  setIsAboutHeroEditing(false);
                  setAboutHeroImage(null);
                  setAboutHero(dbAboutHero); // revert
                }}
                className="px-6 py-2.5 rounded text-white bg-transparent border border-gray-600 hover:bg-gray-800 transition-colors font-bold uppercase tracking-wider text-[13px]"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveAboutHero}
                disabled={savingAboutHero}
                className="px-6 py-2.5 rounded text-black bg-[#D4AF37] hover:bg-[#C89B2B] transition-colors font-bold uppercase tracking-wider text-[13px] min-w-[120px]"
              >
                {savingAboutHero ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Editor Modal for Where It Began */}
      {isWhereItBeganEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#081A42] border border-[#102554] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#102554] bg-[#0A1D4A] flex justify-between items-center shrink-0">
              <h3 className="font-instrumentserif text-2xl text-[#D4AF37] uppercase tracking-widest">
                Edit Where It Began
              </h3>
              <button 
                onClick={() => setIsWhereItBeganEditing(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
              
              {/* Enable/Disable Toggle inside Modal */}
              <div className="flex items-center justify-between bg-[#0A1D4A] p-4 rounded-lg border border-[#102554]">
                <div>
                  <h4 className="text-[13px] font-bold uppercase tracking-wider text-[#D4AF37]">Section Visibility</h4>
                  <p className="text-[12px] text-gray-400 mt-1">Enable or disable the entire Where It Began section on the public website.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${whereItBegan.is_enabled === 1 ? 'text-emerald-400' : 'text-gray-400'}`}>
                    {whereItBegan.is_enabled === 1 ? 'Enabled' : 'Disabled'}
                  </span>
                  <button 
                    onClick={() => setWhereItBegan({ ...whereItBegan, is_enabled: whereItBegan.is_enabled === 1 ? 0 : 1 })}
                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${whereItBegan.is_enabled === 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${whereItBegan.is_enabled === 1 ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
              
              {/* Image Upload */}
              <div className="space-y-3">
                <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37]">
                  Side Image
                </label>
                <div className="flex gap-6 items-start">
                  <div className="w-1/2">
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-[#102554] border-dashed rounded-lg cursor-pointer bg-[#0A1D4A]/50 hover:bg-[#102554] transition-colors relative overflow-hidden group">
                      {whereItBeganImage || whereItBegan.image_path ? (
                        <>
                          <Image 
                            src={whereItBeganImage ? URL.createObjectURL(whereItBeganImage) : encodeURI(`${whereItBegan.image_path.startsWith('http') ? '' : (whereItBegan.image_path.startsWith('/uploads') ? API_URL : '')}${whereItBegan.image_path}`)}
                            alt="Preview"
                            fill
                            unoptimized={true}
                            className="object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Camera className="w-8 h-8 text-white mb-2" />
                             <span className="text-sm font-semibold text-white bg-black/50 px-3 py-1 rounded">Change Image</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Camera className="w-8 h-8 text-gray-400 mb-3" />
                          <p className="text-sm text-gray-400">Click to upload</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setWhereItBeganImage(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Text Fields */}
              <div className="space-y-6">
                 {/* Heading */}
                 <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37]">Heading</label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 uppercase">{whereItBegan.heading_enabled === 1 ? 'Show' : 'Hide'}</span>
                        <button 
                          onClick={() => setWhereItBegan({ ...whereItBegan, heading_enabled: whereItBegan.heading_enabled === 1 ? 0 : 1 })}
                          className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${whereItBegan.heading_enabled === 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${whereItBegan.heading_enabled === 1 ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                    <input 
                      type="text"
                      value={whereItBegan.heading}
                      onChange={(e) => setWhereItBegan({ ...whereItBegan, heading: e.target.value })}
                      className={`w-full bg-[#0A1D4A] border border-[#102554] rounded-lg p-3 text-white focus:outline-none focus:border-[#D4AF37] ${whereItBegan.heading_enabled === 0 ? 'opacity-50' : ''}`}
                    />
                 </div>
                 {/* Title */}
                 <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37]">Title</label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 uppercase">{whereItBegan.title_enabled === 1 ? 'Show' : 'Hide'}</span>
                        <button 
                          onClick={() => setWhereItBegan({ ...whereItBegan, title_enabled: whereItBegan.title_enabled === 1 ? 0 : 1 })}
                          className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${whereItBegan.title_enabled === 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${whereItBegan.title_enabled === 1 ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                    <input 
                      type="text"
                      value={whereItBegan.title}
                      onChange={(e) => setWhereItBegan({ ...whereItBegan, title: e.target.value })}
                      className={`w-full bg-[#0A1D4A] border border-[#102554] rounded-lg p-3 text-white focus:outline-none focus:border-[#D4AF37] ${whereItBegan.title_enabled === 0 ? 'opacity-50' : ''}`}
                    />
                 </div>
                 {/* Quote */}
                 <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37]">Quote</label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 uppercase">{whereItBegan.quote_enabled === 1 ? 'Show' : 'Hide'}</span>
                        <button 
                          onClick={() => setWhereItBegan({ ...whereItBegan, quote_enabled: whereItBegan.quote_enabled === 1 ? 0 : 1 })}
                          className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${whereItBegan.quote_enabled === 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${whereItBegan.quote_enabled === 1 ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                    <textarea 
                      value={whereItBegan.quote}
                      onChange={(e) => setWhereItBegan({ ...whereItBegan, quote: e.target.value })}
                      rows={3}
                      className={`w-full bg-[#0A1D4A] border border-[#102554] rounded-lg p-3 text-white focus:outline-none focus:border-[#D4AF37] ${whereItBegan.quote_enabled === 0 ? 'opacity-50' : ''}`}
                    />
                 </div>
                 {/* Paragraph 1 */}
                 <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37]">Paragraph 1</label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 uppercase">{whereItBegan.paragraph_1_enabled === 1 ? 'Show' : 'Hide'}</span>
                        <button 
                          onClick={() => setWhereItBegan({ ...whereItBegan, paragraph_1_enabled: whereItBegan.paragraph_1_enabled === 1 ? 0 : 1 })}
                          className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${whereItBegan.paragraph_1_enabled === 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${whereItBegan.paragraph_1_enabled === 1 ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                    <textarea 
                      value={whereItBegan.paragraph_1}
                      onChange={(e) => setWhereItBegan({ ...whereItBegan, paragraph_1: e.target.value })}
                      rows={3}
                      className={`w-full bg-[#0A1D4A] border border-[#102554] rounded-lg p-3 text-white focus:outline-none focus:border-[#D4AF37] ${whereItBegan.paragraph_1_enabled === 0 ? 'opacity-50' : ''}`}
                    />
                 </div>
                 {/* Paragraph 2 */}
                 <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37]">Paragraph 2</label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 uppercase">{whereItBegan.paragraph_2_enabled === 1 ? 'Show' : 'Hide'}</span>
                        <button 
                          onClick={() => setWhereItBegan({ ...whereItBegan, paragraph_2_enabled: whereItBegan.paragraph_2_enabled === 1 ? 0 : 1 })}
                          className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${whereItBegan.paragraph_2_enabled === 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${whereItBegan.paragraph_2_enabled === 1 ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                    <textarea 
                      value={whereItBegan.paragraph_2}
                      onChange={(e) => setWhereItBegan({ ...whereItBegan, paragraph_2: e.target.value })}
                      rows={3}
                      className={`w-full bg-[#0A1D4A] border border-[#102554] rounded-lg p-3 text-white focus:outline-none focus:border-[#D4AF37] ${whereItBegan.paragraph_2_enabled === 0 ? 'opacity-50' : ''}`}
                    />
                 </div>
                 {/* Paragraph 3 */}
                 <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37]">Paragraph 3</label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 uppercase">{whereItBegan.paragraph_3_enabled === 1 ? 'Show' : 'Hide'}</span>
                        <button 
                          onClick={() => setWhereItBegan({ ...whereItBegan, paragraph_3_enabled: whereItBegan.paragraph_3_enabled === 1 ? 0 : 1 })}
                          className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${whereItBegan.paragraph_3_enabled === 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${whereItBegan.paragraph_3_enabled === 1 ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                    <textarea 
                      value={whereItBegan.paragraph_3}
                      onChange={(e) => setWhereItBegan({ ...whereItBegan, paragraph_3: e.target.value })}
                      rows={3}
                      className={`w-full bg-[#0A1D4A] border border-[#102554] rounded-lg p-3 text-white focus:outline-none focus:border-[#D4AF37] ${whereItBegan.paragraph_3_enabled === 0 ? 'opacity-50' : ''}`}
                    />
                 </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#102554] bg-[#0A1D4A] shrink-0 flex justify-end gap-4">
              <button 
                onClick={() => {
                  setIsWhereItBeganEditing(false);
                  setWhereItBeganImage(null);
                  setWhereItBegan(dbWhereItBegan); // revert
                }}
                className="px-6 py-2.5 rounded text-white bg-transparent border border-gray-600 hover:bg-gray-800 transition-colors font-bold uppercase tracking-wider text-[13px]"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveWhereItBegan}
                disabled={savingWhereItBegan}
                className="px-6 py-2.5 rounded text-black bg-[#D4AF37] hover:bg-[#C89B2B] transition-colors font-bold uppercase tracking-wider text-[13px] min-w-[120px]"
              >
                {savingWhereItBegan ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* What We Stand For Edit Modal */}
      {isWhatWeStandForEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-hidden">
          <div className="bg-[#081A42] border border-[#102554] rounded-2xl w-full max-w-3xl h-[90vh] flex flex-col shadow-2xl relative">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#102554] bg-[#0A1D4A] shrink-0 flex items-center justify-between">
              <div>
                <h2 className="font-instrumentserif text-3xl text-[#D4AF37] tracking-wider uppercase">Edit What We Stand For</h2>
                <p className="text-gray-400 text-sm mt-1">Configure the core pillars section</p>
              </div>
              <button
                onClick={() => {
                  setIsWhatWeStandForEditing(false);
                  setWhatWeStandFor(dbWhatWeStandFor); // revert
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Edit Form (Scrollable) */}
              <div className="w-full h-full overflow-y-auto custom-scrollbar p-6 space-y-8 bg-[#081A42]">
                {/* Section Toggle */}
                <div>
                  <div className="flex items-center justify-between p-4 bg-[#0A1D4A] border border-[#102554] rounded-xl">
                    <div>
                      <h4 className="text-white font-semibold mb-1">Section Status</h4>
                      <p className="text-xs text-gray-400">Enable or disable this entire section</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${whatWeStandFor.section_enabled === 1 ? 'text-emerald-400' : 'text-gray-400'}`}>
                        {whatWeStandFor.section_enabled === 1 ? 'Enabled' : 'Disabled'}
                      </span>
                      <button
                        onClick={() => setWhatWeStandFor({ ...whatWeStandFor, section_enabled: whatWeStandFor.section_enabled === 1 ? 0 : 1 })}
                        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${whatWeStandFor.section_enabled === 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${whatWeStandFor.section_enabled === 1 ? 'translate-x-7' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-instrumentserif text-2xl text-[#D4AF37] uppercase tracking-widest border-b border-[#102554] pb-2">Text Content</h3>
                  
                  {/* Heading 1 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37]">Heading Line 1</label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 uppercase">{whatWeStandFor.heading_line_1_enabled === 1 ? 'Show' : 'Hide'}</span>
                        <button
                          onClick={() => setWhatWeStandFor({ ...whatWeStandFor, heading_line_1_enabled: whatWeStandFor.heading_line_1_enabled === 1 ? 0 : 1 })}
                          className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${whatWeStandFor.heading_line_1_enabled === 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${whatWeStandFor.heading_line_1_enabled === 1 ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={whatWeStandFor.heading_line_1}
                      onChange={(e) => setWhatWeStandFor({ ...whatWeStandFor, heading_line_1: e.target.value })}
                      className={`w-full bg-[#0A1D4A] border border-[#102554] rounded-lg p-3 text-white focus:outline-none focus:border-[#D4AF37] ${whatWeStandFor.heading_line_1_enabled === 0 ? 'opacity-50' : ''}`}
                    />
                  </div>

                  {/* Heading 2 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37]">Heading Line 2</label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 uppercase">{whatWeStandFor.heading_line_2_enabled === 1 ? 'Show' : 'Hide'}</span>
                        <button
                          onClick={() => setWhatWeStandFor({ ...whatWeStandFor, heading_line_2_enabled: whatWeStandFor.heading_line_2_enabled === 1 ? 0 : 1 })}
                          className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${whatWeStandFor.heading_line_2_enabled === 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${whatWeStandFor.heading_line_2_enabled === 1 ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={whatWeStandFor.heading_line_2}
                      onChange={(e) => setWhatWeStandFor({ ...whatWeStandFor, heading_line_2: e.target.value })}
                      className={`w-full bg-[#0A1D4A] border border-[#102554] rounded-lg p-3 text-white focus:outline-none focus:border-[#D4AF37] ${whatWeStandFor.heading_line_2_enabled === 0 ? 'opacity-50' : ''}`}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-instrumentserif text-2xl text-[#D4AF37] uppercase tracking-widest border-b border-[#102554] pb-2">Cards</h3>
                  
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <div key={num} className="p-4 bg-[#0A1D4A] border border-[#102554] rounded-xl space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-white font-semibold">Card {num}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 uppercase">{whatWeStandFor[`card_${num}_enabled`] === 1 ? 'Show' : 'Hide'}</span>
                          <button
                            onClick={() => setWhatWeStandFor({ ...whatWeStandFor, [`card_${num}_enabled`]: whatWeStandFor[`card_${num}_enabled`] === 1 ? 0 : 1 })}
                            className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${whatWeStandFor[`card_${num}_enabled`] === 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                          >
                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${whatWeStandFor[`card_${num}_enabled`] === 1 ? 'translate-x-4' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Title</label>
                        <input
                          type="text"
                          value={whatWeStandFor[`card_${num}_title`]}
                          onChange={(e) => setWhatWeStandFor({ ...whatWeStandFor, [`card_${num}_title`]: e.target.value })}
                          className={`w-full bg-[#081A42] border border-[#102554] rounded p-2 text-white text-sm focus:outline-none focus:border-[#D4AF37] ${whatWeStandFor[`card_${num}_enabled`] === 0 ? 'opacity-50' : ''}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Content</label>
                        <textarea
                          value={whatWeStandFor[`card_${num}_content`]}
                          onChange={(e) => setWhatWeStandFor({ ...whatWeStandFor, [`card_${num}_content`]: e.target.value })}
                          rows={3}
                          className={`w-full bg-[#081A42] border border-[#102554] rounded p-2 text-white text-sm focus:outline-none focus:border-[#D4AF37] ${whatWeStandFor[`card_${num}_enabled`] === 0 ? 'opacity-50' : ''}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#102554] bg-[#0A1D4A] shrink-0 flex justify-end gap-4">
              <button
                onClick={() => {
                  setIsWhatWeStandForEditing(false);
                  setWhatWeStandFor(dbWhatWeStandFor); // revert
                }}
                className="px-6 py-2.5 rounded text-white bg-transparent border border-gray-600 hover:bg-gray-800 transition-colors font-bold uppercase tracking-wider text-[13px]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWhatWeStandFor}
                disabled={savingWhatWeStandFor}
                className="px-6 py-2.5 rounded text-black bg-[#D4AF37] hover:bg-[#C89B2B] transition-colors font-bold uppercase tracking-wider text-[13px] min-w-[120px]"
              >
                {savingWhatWeStandFor ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* The Making Edit Modal */}
      {isTheMakingEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-hidden">
          <div className="bg-[#081A42] border border-[#102554] rounded-2xl w-full max-w-3xl h-[90vh] flex flex-col shadow-2xl relative">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#102554] bg-[#0A1D4A] shrink-0 flex items-center justify-between">
              <div>
                <h2 className="font-instrumentserif text-3xl text-[#D4AF37] tracking-wider uppercase">Edit The Making</h2>
                <p className="text-gray-400 text-sm mt-1">Configure section text, image, and tags.</p>
              </div>
              <button
                onClick={() => {
                  setIsTheMakingEditing(false);
                  setTheMaking(dbTheMaking); // revert
                  setTheMakingImage(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Edit Form (Scrollable) */}
              <div className="w-full h-full overflow-y-auto custom-scrollbar p-6 space-y-8 bg-[#081A42]">
                {/* Section Toggle */}
                <div>
                  <div className="flex items-center justify-between p-4 bg-[#0A1D4A] border border-[#102554] rounded-xl">
                    <div>
                      <h4 className="text-white font-semibold mb-1">Section Status</h4>
                      <p className="text-xs text-gray-400">Enable or disable this entire section</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${theMaking.section_enabled === 1 ? 'text-emerald-400' : 'text-gray-400'}`}>
                        {theMaking.section_enabled === 1 ? 'Enabled' : 'Disabled'}
                      </span>
                      <button
                        onClick={() => setTheMaking({ ...theMaking, section_enabled: theMaking.section_enabled === 1 ? 0 : 1 })}
                        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${theMaking.section_enabled === 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theMaking.section_enabled === 1 ? 'translate-x-7' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-instrumentserif text-2xl text-[#D4AF37] uppercase tracking-widest border-b border-[#102554] pb-2">Image</h3>
                  <div>
                    <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37] mb-2">Section Image</label>
                    <p className="text-xs text-gray-400 mb-2">Any aspect ratio uploaded here will be automatically cropped to fit the fixed 50% split container.</p>
                    <div className="flex items-center gap-4">
                      {theMakingImage ? (
                        <div className="w-24 h-24 relative rounded-xl overflow-hidden border-2 border-[#D4AF37]">
                          <Image src={URL.createObjectURL(theMakingImage)} alt="Preview" fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="w-24 h-24 relative rounded-xl overflow-hidden border border-gray-600">
                          <Image src={theMaking.section_image?.startsWith("http") ? theMaking.section_image : (theMaking.section_image?.startsWith("/uploads") ? `${API_URL}${theMaking.section_image}` : theMaking.section_image)} alt="Current" fill className="object-cover" unoptimized />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setTheMakingImage(e.target.files[0]);
                              const newImageObjUrl = URL.createObjectURL(e.target.files[0]);
                              setTheMaking({ ...theMaking, section_image: newImageObjUrl });
                            }
                          }}
                          className="hidden"
                          id="the-making-image-upload"
                        />
                        <label
                          htmlFor="the-making-image-upload"
                          className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#102554] hover:bg-[#1a3673] text-white rounded-lg border border-[#1e3a78] transition-colors w-full"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Change Image</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-instrumentserif text-2xl text-[#D4AF37] uppercase tracking-widest border-b border-[#102554] pb-2">Headings</h3>
                  
                  {/* Title 1 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37]">Title Line 1</label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 uppercase">{theMaking.title_line_1_enabled === 1 ? 'Show' : 'Hide'}</span>
                        <button
                          onClick={() => setTheMaking({ ...theMaking, title_line_1_enabled: theMaking.title_line_1_enabled === 1 ? 0 : 1 })}
                          className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${theMaking.title_line_1_enabled === 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${theMaking.title_line_1_enabled === 1 ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={theMaking.title_line_1}
                      onChange={(e) => setTheMaking({ ...theMaking, title_line_1: e.target.value })}
                      className={`w-full bg-[#0A1D4A] border border-[#102554] rounded-lg p-3 text-white focus:outline-none focus:border-[#D4AF37] ${theMaking.title_line_1_enabled === 0 ? 'opacity-50' : ''}`}
                    />
                  </div>

                  {/* Title 2 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37]">Title Line 2</label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 uppercase">{theMaking.title_line_2_enabled === 1 ? 'Show' : 'Hide'}</span>
                        <button
                          onClick={() => setTheMaking({ ...theMaking, title_line_2_enabled: theMaking.title_line_2_enabled === 1 ? 0 : 1 })}
                          className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${theMaking.title_line_2_enabled === 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${theMaking.title_line_2_enabled === 1 ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={theMaking.title_line_2}
                      onChange={(e) => setTheMaking({ ...theMaking, title_line_2: e.target.value })}
                      className={`w-full bg-[#0A1D4A] border border-[#102554] rounded-lg p-3 text-white focus:outline-none focus:border-[#D4AF37] ${theMaking.title_line_2_enabled === 0 ? 'opacity-50' : ''}`}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-instrumentserif text-2xl text-[#D4AF37] uppercase tracking-widest border-b border-[#102554] pb-2">Paragraphs</h3>
                  
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="p-4 bg-[#0A1D4A] border border-[#102554] rounded-xl space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-white font-semibold">Paragraph {num}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 uppercase">{theMaking[`paragraph_${num}_enabled`] === 1 ? 'Show' : 'Hide'}</span>
                          <button
                            onClick={() => setTheMaking({ ...theMaking, [`paragraph_${num}_enabled`]: theMaking[`paragraph_${num}_enabled`] === 1 ? 0 : 1 })}
                            className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${theMaking[`paragraph_${num}_enabled`] === 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                          >
                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${theMaking[`paragraph_${num}_enabled`] === 1 ? 'translate-x-4' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={theMaking[`paragraph_${num}`]}
                        onChange={(e) => setTheMaking({ ...theMaking, [`paragraph_${num}`]: e.target.value })}
                        rows={3}
                        className={`w-full bg-[#081A42] border border-[#102554] rounded p-2 text-white text-sm focus:outline-none focus:border-[#D4AF37] ${theMaking[`paragraph_${num}_enabled`] === 0 ? 'opacity-50' : ''}`}
                      />
                    </div>
                  ))}
                </div>
                
                <div className="space-y-6">
                  <h3 className="font-instrumentserif text-2xl text-[#D4AF37] uppercase tracking-widest border-b border-[#102554] pb-2">Tags / Badges</h3>
                  <div className="space-y-3">
                    {theMaking.tags.map((tag: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-[#0A1D4A] border border-[#102554] rounded-xl">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={tag.text}
                            onChange={(e) => {
                              const newTags = [...theMaking.tags];
                              newTags[index].text = e.target.value;
                              setTheMaking({ ...theMaking, tags: newTags });
                            }}
                            className={`w-full bg-[#081A42] border border-[#102554] rounded p-2 text-white text-sm focus:outline-none focus:border-[#D4AF37] ${!tag.enabled ? 'opacity-50' : ''}`}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const newTags = [...theMaking.tags];
                              newTags[index].enabled = !newTags[index].enabled;
                              setTheMaking({ ...theMaking, tags: newTags });
                            }}
                            className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${tag.enabled ? 'bg-emerald-500' : 'bg-gray-600'}`}
                          >
                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${tag.enabled ? 'translate-x-4' : 'translate-x-1'}`} />
                          </button>
                          <button
                            onClick={() => {
                              const newTags = theMaking.tags.filter((_: any, i: number) => i !== index);
                              setTheMaking({ ...theMaking, tags: newTags });
                            }}
                            className="text-red-400 hover:text-red-300 transition-colors ml-2"
                            title="Delete Tag"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      onClick={() => {
                        setTheMaking({ ...theMaking, tags: [...theMaking.tags, { text: "New Tag", enabled: true }] });
                      }}
                      className="w-full py-3 bg-[#102554] hover:bg-[#1a3673] text-white rounded-xl border border-dashed border-[#1e3a78] transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-wider font-bold mt-4"
                    >
                      + Add New Tag
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#102554] bg-[#0A1D4A] shrink-0 flex justify-end gap-4">
              <button
                onClick={() => {
                  setIsTheMakingEditing(false);
                  setTheMaking(dbTheMaking); // revert
                  setTheMakingImage(null);
                }}
                className="px-6 py-2.5 rounded text-white bg-transparent border border-gray-600 hover:bg-gray-800 transition-colors font-bold uppercase tracking-wider text-[13px]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTheMaking}
                disabled={savingTheMaking}
                className="px-6 py-2.5 rounded text-black bg-[#D4AF37] hover:bg-[#C89B2B] transition-colors font-bold uppercase tracking-wider text-[13px] min-w-[120px]"
              >
                {savingTheMaking ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* The People Edit Modal */}
      {isThePeopleEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-hidden">
          <div className="bg-[#081A42] border border-[#102554] rounded-2xl w-full max-w-3xl h-[90vh] flex flex-col shadow-2xl relative">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#102554] bg-[#0A1D4A] shrink-0 flex items-center justify-between">
              <div>
                <h2 className="font-instrumentserif text-3xl text-[#D4AF37] tracking-wider uppercase">Edit The People</h2>
                <p className="text-gray-400 text-sm mt-1">Configure section text, image, and status.</p>
              </div>
              <button 
                onClick={() => {
                  setIsThePeopleEditing(false);
                  setThePeople(dbThePeople); // revert
                  setThePeopleImage(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Edit Form (Scrollable) */}
              <div className="w-full h-full overflow-y-auto custom-scrollbar p-6 space-y-8 bg-[#081A42]">
                {/* Section Toggle */}
                <div>
                  <div className="flex items-center justify-between p-4 bg-[#0A1D4A] border border-[#102554] rounded-xl">
                    <div>
                      <h4 className="text-white font-semibold mb-1">Section Status</h4>
                      <p className="text-xs text-gray-400">Enable or disable this entire section</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold tracking-wider uppercase ${thePeople.is_enabled === 1 ? 'text-emerald-500' : 'text-gray-500'}`}>
                        {thePeople.is_enabled === 1 ? 'Enabled' : 'Disabled'}
                      </span>
                      <button
                        onClick={() => setThePeople({ ...thePeople, is_enabled: thePeople.is_enabled === 1 ? 0 : 1 })}
                        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${thePeople.is_enabled === 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${thePeople.is_enabled === 1 ? 'translate-x-7' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-instrumentserif text-2xl text-[#D4AF37] uppercase tracking-widest border-b border-[#102554] pb-2">Image</h3>
                  <div>
                    <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37] mb-2">Section Image</label>
                    <p className="text-xs text-gray-400 mb-2">The image container maintains a fixed aspect ratio. Uploading any size image will simply crop to fit without changing the layout height.</p>
                    <div className="flex items-center gap-4">
                      {thePeopleImage ? (
                        <div className="w-24 h-24 relative rounded-xl overflow-hidden border-2 border-[#D4AF37]">
                          <Image src={URL.createObjectURL(thePeopleImage)} alt="Preview" fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="w-24 h-24 relative rounded-xl overflow-hidden border border-gray-600">
                          <Image src={thePeople.section_image?.startsWith("http") ? thePeople.section_image : (thePeople.section_image?.startsWith("/uploads") ? `${API_URL}${thePeople.section_image}` : thePeople.section_image)} alt="Current" fill className="object-cover" unoptimized />
                        </div>
                      )}
                      <div className="flex-1">
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setThePeopleImage(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                          id="thePeopleImageUpload"
                        />
                        <label 
                          htmlFor="thePeopleImageUpload"
                          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#102554] hover:bg-[#1a3673] border border-[#1e3a78] text-white rounded cursor-pointer transition-colors text-sm font-medium"
                        >
                          <Camera size={16} />
                          <span>Change Image</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-instrumentserif text-2xl text-[#D4AF37] uppercase tracking-widest border-b border-[#102554] pb-2">Headings</h3>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37]">Title Line 1</label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase text-gray-400 tracking-wider">Show</span>
                        <button
                          onClick={() => setThePeople({ ...thePeople, title_line_1_enabled: thePeople.title_line_1_enabled === 1 ? 0 : 1 })}
                          className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${thePeople.title_line_1_enabled === 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${thePeople.title_line_1_enabled === 1 ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                    <input 
                      type="text"
                      value={thePeople.title_line_1}
                      onChange={(e) => setThePeople({...thePeople, title_line_1: e.target.value})}
                      className={`w-full bg-[#050505] border border-[#102554] rounded p-3 text-white focus:outline-none focus:border-[#D4AF37] ${thePeople.title_line_1_enabled !== 1 ? 'opacity-50' : ''}`}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37]">Title Line 2</label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase text-gray-400 tracking-wider">Show</span>
                        <button
                          onClick={() => setThePeople({ ...thePeople, title_line_2_enabled: thePeople.title_line_2_enabled === 1 ? 0 : 1 })}
                          className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${thePeople.title_line_2_enabled === 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${thePeople.title_line_2_enabled === 1 ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                    <input 
                      type="text"
                      value={thePeople.title_line_2}
                      onChange={(e) => setThePeople({...thePeople, title_line_2: e.target.value})}
                      className={`w-full bg-[#050505] border border-[#102554] rounded p-3 text-white focus:outline-none focus:border-[#D4AF37] ${thePeople.title_line_2_enabled !== 1 ? 'opacity-50' : ''}`}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-instrumentserif text-2xl text-[#D4AF37] uppercase tracking-widest border-b border-[#102554] pb-2">Content Paragraphs</h3>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37]">Paragraph 1</label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase text-gray-400 tracking-wider">Show</span>
                        <button
                          onClick={() => setThePeople({ ...thePeople, content_paragraph_1_enabled: thePeople.content_paragraph_1_enabled === 1 ? 0 : 1 })}
                          className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${thePeople.content_paragraph_1_enabled === 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${thePeople.content_paragraph_1_enabled === 1 ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                    <textarea 
                      value={thePeople.content_paragraph_1}
                      onChange={(e) => setThePeople({...thePeople, content_paragraph_1: e.target.value})}
                      rows={4}
                      className={`w-full bg-[#050505] border border-[#102554] rounded p-3 text-white focus:outline-none focus:border-[#D4AF37] ${thePeople.content_paragraph_1_enabled !== 1 ? 'opacity-50' : ''}`}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37]">Paragraph 2</label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase text-gray-400 tracking-wider">Show</span>
                        <button
                          onClick={() => setThePeople({ ...thePeople, content_paragraph_2_enabled: thePeople.content_paragraph_2_enabled === 1 ? 0 : 1 })}
                          className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${thePeople.content_paragraph_2_enabled === 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${thePeople.content_paragraph_2_enabled === 1 ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                    <textarea 
                      value={thePeople.content_paragraph_2}
                      onChange={(e) => setThePeople({...thePeople, content_paragraph_2: e.target.value})}
                      rows={3}
                      className={`w-full bg-[#050505] border border-[#102554] rounded p-3 text-white focus:outline-none focus:border-[#D4AF37] ${thePeople.content_paragraph_2_enabled !== 1 ? 'opacity-50' : ''}`}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#102554] bg-[#0A1D4A] shrink-0 flex justify-end gap-4">
              <button 
                onClick={() => {
                  setIsThePeopleEditing(false);
                  setThePeople(dbThePeople); // revert
                  setThePeopleImage(null);
                }}
                className="px-6 py-2.5 rounded text-white bg-transparent border border-gray-600 hover:bg-gray-800 transition-colors font-bold uppercase tracking-wider text-[13px]"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveThePeople}
                disabled={savingThePeople}
                className="px-6 py-2.5 rounded text-black bg-[#D4AF37] hover:bg-[#C89B2B] transition-colors font-bold uppercase tracking-wider text-[13px] min-w-[120px]"
              >
                {savingThePeople ? "Saving..." : "Save Changes"}
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* Experience The Linen Edit Modal */}
      {isExperienceLinenEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-hidden">
          <div className="bg-[#081A42] border border-[#102554] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#102554] bg-[#0A1D4A] shrink-0 flex items-center justify-between">
              <div>
                <h2 className="font-instrumentserif text-3xl text-[#D4AF37] tracking-wider uppercase">Edit Experience The Linen</h2>
                <p className="text-gray-400 text-sm mt-1">Configure section text, images, and status.</p>
              </div>
              <button
                onClick={() => {
                  setIsExperienceLinenEditing(false);
                  setExperienceLinen(dbExperienceLinen); // revert
                  setExperienceLinenImages({ image_1: null, image_2: null, image_3: null, image_4: null });
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body without Live Preview */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Edit Form (Scrollable) */}
              <div className="w-full h-full overflow-y-auto custom-scrollbar p-6 space-y-8 bg-[#081A42]">
                
                {/* Section Toggle */}
                <div>
                  <div className="flex items-center justify-between p-4 bg-[#0A1D4A] border border-[#102554] rounded-xl">
                    <div>
                      <h4 className="font-bold text-white uppercase tracking-wider text-sm mb-1">Section Status</h4>
                      <p className="text-xs text-gray-400">Enable or disable this entire section</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        {experienceLinen.is_enabled === 1 ? 'Enabled' : 'Disabled'}
                      </span>
                      <button
                        onClick={() => setExperienceLinen({ ...experienceLinen, is_enabled: experienceLinen.is_enabled === 1 ? 0 : 1 })}
                        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${experienceLinen.is_enabled === 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${experienceLinen.is_enabled === 1 ? 'translate-x-7' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Images Section */}
                <div>
                  <h3 className="font-instrumentserif text-xl text-[#D4AF37] uppercase tracking-widest border-b border-[#102554] pb-2 mb-4">IMAGES</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(num => {
                      const key = `image_${num}` as keyof typeof experienceLinen;
                      return (
                        <div key={num} className="bg-[#0A1D4A] border border-[#102554] rounded-xl p-4">
                          <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37] mb-2">Image {num}</label>
                          <div className="relative w-full aspect-square bg-[#050505] rounded-lg overflow-hidden border border-[#102554] mb-3">
                            <Image 
                              src={
                                experienceLinenImages[key as string] 
                                  ? URL.createObjectURL(experienceLinenImages[key as string] as File) 
                                  : (experienceLinen[key] as string)?.startsWith('/uploads') 
                                    ? `${API_URL}${experienceLinen[key]}` 
                                    : (experienceLinen[key] as string)?.startsWith('http')
                                      ? experienceLinen[key] as string
                                      : `/images/about-us/img-${num}.webp`
                              }
                              alt={`Image ${num}`} 
                              fill 
                              className="object-cover"
                              unoptimized={true}
                            />
                          </div>
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setExperienceLinenImages({ ...experienceLinenImages, [key as string]: e.target.files[0] });
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="bg-[#081A42] border border-[#102554] hover:border-[#1e3a78] text-white text-[11px] uppercase tracking-wider font-bold text-center py-2 rounded transition-colors flex items-center justify-center gap-2">
                              <Camera size={14} />
                              Change
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Headings Section */}
                <div>
                  <h3 className="font-instrumentserif text-xl text-[#D4AF37] uppercase tracking-widest border-b border-[#102554] pb-2 mb-4">HEADINGS</h3>
                  
                  {/* Title 1 */}
                  <div className="bg-[#0A1D4A] border border-[#102554] rounded-xl p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37]">Title Line 1</label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase text-gray-400 tracking-wider">Show</span>
                        <button
                          onClick={() => setExperienceLinen({ ...experienceLinen, title_line_1_enabled: experienceLinen.title_line_1_enabled === 1 ? 0 : 1 })}
                          className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${experienceLinen.title_line_1_enabled === 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${experienceLinen.title_line_1_enabled === 1 ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={experienceLinen.title_line_1}
                      onChange={(e) => setExperienceLinen({...experienceLinen, title_line_1: e.target.value})}
                      className={`w-full bg-[#050505] border border-[#102554] rounded p-3 text-white focus:outline-none focus:border-[#D4AF37] ${experienceLinen.title_line_1_enabled !== 1 ? 'opacity-50' : ''}`}
                    />
                  </div>

                  {/* Title 2 */}
                  <div className="bg-[#0A1D4A] border border-[#102554] rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37]">Title Line 2</label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase text-gray-400 tracking-wider">Show</span>
                        <button
                          onClick={() => setExperienceLinen({ ...experienceLinen, title_line_2_enabled: experienceLinen.title_line_2_enabled === 1 ? 0 : 1 })}
                          className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${experienceLinen.title_line_2_enabled === 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${experienceLinen.title_line_2_enabled === 1 ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={experienceLinen.title_line_2}
                      onChange={(e) => setExperienceLinen({...experienceLinen, title_line_2: e.target.value})}
                      className={`w-full bg-[#050505] border border-[#102554] rounded p-3 text-white focus:outline-none focus:border-[#D4AF37] ${experienceLinen.title_line_2_enabled !== 1 ? 'opacity-50' : ''}`}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-instrumentserif text-xl text-[#D4AF37] uppercase tracking-widest border-b border-[#102554] pb-2 mb-4">DESCRIPTION</h3>
                  
                  <div className="bg-[#0A1D4A] border border-[#102554] rounded-xl p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37]">Paragraph Content</label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase text-gray-400 tracking-wider">Show</span>
                        <button
                          onClick={() => setExperienceLinen({ ...experienceLinen, section_description_enabled: experienceLinen.section_description_enabled === 1 ? 0 : 1 })}
                          className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${experienceLinen.section_description_enabled === 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${experienceLinen.section_description_enabled === 1 ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={experienceLinen.section_description}
                      onChange={(e) => setExperienceLinen({...experienceLinen, section_description: e.target.value})}
                      rows={4}
                      className={`w-full bg-[#050505] border border-[#102554] rounded p-3 text-white focus:outline-none focus:border-[#D4AF37] ${experienceLinen.section_description_enabled !== 1 ? 'opacity-50' : ''}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#102554] bg-[#0A1D4A] shrink-0 flex justify-end gap-4">
              <button
                onClick={() => {
                  setIsExperienceLinenEditing(false);
                  setExperienceLinen(dbExperienceLinen); // revert
                  setExperienceLinenImages({ image_1: null, image_2: null, image_3: null, image_4: null });
                }}
                className="px-6 py-2.5 rounded text-white bg-transparent border border-gray-600 hover:bg-gray-800 transition-colors font-bold uppercase tracking-wider text-[13px]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveExperienceLinen}
                disabled={savingExperienceLinen}
                className="px-6 py-2.5 rounded text-black bg-[#D4AF37] hover:bg-[#C89B2B] transition-colors font-bold uppercase tracking-wider text-[13px] min-w-[120px]"
              >
                {savingExperienceLinen ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
