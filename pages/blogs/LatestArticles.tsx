"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface LatestArticlesProps {
  previewConfig?: any;
  mockBlogs?: any[];
}

export default function LatestArticles({ previewConfig, mockBlogs }: LatestArticlesProps) {
  const [loading, setLoading] = useState(!previewConfig);
  const [cmsConfig, setCmsConfig] = useState<any>({
    section_title: "Latest Articles",
    is_enabled: 1
  });
  const [blogsData, setBlogsData] = useState<any[]>(mockBlogs || []);

  useEffect(() => {
    if (mockBlogs && mockBlogs.length > 0) {
      setBlogsData(mockBlogs);
    }
    const fetchData = async () => {
      try {
        if (!previewConfig) {
          const resCMS = await fetch(`${API_URL}/api/blogs-page/latest-articles`, { cache: 'no-store' });
          if (resCMS.ok) {
            const dataCMS = await resCMS.json();
            if (dataCMS.success && dataCMS.data) {
              setCmsConfig(dataCMS.data);
            }
          }
        }
        
        if (!mockBlogs || mockBlogs.length === 0) {
          const resBlogs = await fetch(`${API_URL}/api/blogs`, { cache: 'no-store' });
          if (resBlogs.ok) {
            const dataBlogs = await resBlogs.json();
            if (dataBlogs.success && dataBlogs.data) {
              setBlogsData(dataBlogs.data);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching Latest Articles data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [previewConfig, mockBlogs]);

  if (loading) {
    return <div className="py-24 px-4 bg-white border-t border-slate-200"></div>;
  }

  const activeConfig = previewConfig || cmsConfig;
  const activeBlogsData = (mockBlogs && mockBlogs.length > 0) ? mockBlogs : blogsData;
  const latestArticlesData = activeBlogsData.slice(0, 3);

  if (activeConfig.is_enabled === 0 && !previewConfig) {
    return null;
  }

  const getMediaUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("/images/")) return path;
    if (path.startsWith("http")) return path;
    return `${API_URL}${path}`;
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  return (
    <section className={`bg-white py-24 px-4 md:px-8 border-t border-slate-200 ${activeConfig.is_enabled === 0 ? 'opacity-50 grayscale' : ''}`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 md:gap-0"
        >
          <div>
            <p className="text-[#D4AF37] uppercase tracking-widest text-sm font-semibold mb-3">Keep Reading</p>
            <h2 className="text-4xl md:text-5xl font-serif text-[#081B46]">
              {activeConfig.section_title || "Latest Articles"}
            </h2>
          </div>
          <button
            onClick={() => document.getElementById('all-blogs')?.scrollIntoView({ behavior: 'smooth' })}
            className="hidden md:inline-flex items-center gap-2 text-[#081B46] uppercase tracking-widest font-semibold text-sm hover:text-[#D4AF37] transition-colors pb-1 border-b border-[#081B46] hover:border-[#D4AF37]"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {latestArticlesData.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            {latestArticlesData.map((article: any) => (
              <Link href={`/blogs/${article.blog_id}`} key={article.blog_id}>
                <motion.div variants={fadeUp} className="group cursor-pointer h-full">
                  <div className="relative h-64 overflow-hidden mb-6">
                    <img
                      src={getMediaUrl(article.blog_image)}
                      alt={article.blog_title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-[#081B46]/10 group-hover:bg-transparent transition-colors duration-500" />
                  </div>
                  <div className="text-xs text-slate-500 font-mono mb-3">
                    {article.published_date ? new Date(article.published_date).toLocaleDateString() : "New"}
                  </div>
                  <h3 className="text-xl font-serif text-[#081B46] group-hover:text-[#D4AF37] transition-colors mb-4 line-clamp-2">
                    {article.blog_title}
                  </h3>
                  <div className="text-sm font-semibold text-[#081B46] uppercase tracking-wider flex items-center gap-2 group-hover:text-[#D4AF37] transition-colors">
                    Read Article <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        ) : (
           <div className="text-center py-10 text-slate-500 font-light text-lg">No articles found.</div>
        )}

        {/* Mobile view all button */}
        <div className="mt-10 flex justify-center md:hidden">
          <button
            onClick={() => document.getElementById('all-blogs')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 text-[#081B46] uppercase tracking-widest font-semibold text-sm hover:text-[#D4AF37] transition-colors pb-1 border-b border-[#081B46] hover:border-[#D4AF37]"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
