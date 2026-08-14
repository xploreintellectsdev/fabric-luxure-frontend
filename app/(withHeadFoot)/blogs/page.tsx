"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import BlogsHero from "../../../pages/blogs/BlogsHero";
import LatestArticles from "../../../pages/blogs/LatestArticles";
import BlogsHeritage from "../../../pages/blogs/BlogsHeritage";

export default function BlogsPage() {
  const [blogsData, setBlogsData] = useState<any[]>([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${API_URL}/api/blogs`, { cache: 'no-store' });
        const data = await res.json();
        if (data.success && data.data) {
          setBlogsData(data.data);
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
      }
    };
    fetchBlogs();
  }, []);

  const latestArticles = blogsData.slice(0, 3);

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const slideLeft: Variants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const slideRight: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <BlogsHero />

      {/* BLOGS LISTING */}
      <section id="all-blogs" className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-32">
          {blogsData.length === 0 && (
            <div className="text-center py-20 text-slate-500 font-light text-xl">Loading blogs...</div>
          )}
          {blogsData.map((blog, index) => {
            const isEven = index % 2 === 0;
            const numberString = (index + 1).toString().padStart(2, '0');

            return (
              <motion.article
                key={blog.blog_id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="relative flex flex-col md:flex-row items-center gap-12 lg:gap-24 group"
              >
                {/* Large Background Number */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 hidden lg:block opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-1000">
                  <span
                    className="text-[300px] font-serif leading-none font-bold text-transparent"
                    style={{ WebkitTextStroke: "2px #081B46" }}
                  >
                    {numberString}
                  </span>
                </div>

                {/* Mobile Background Number (Visible on small screens) */}
                <div className="absolute top-0 right-0 pointer-events-none z-0 lg:hidden opacity-5">
                  <span
                    className="text-[120px] font-serif leading-none font-bold text-transparent"
                    style={{ WebkitTextStroke: "1px #081B46" }}
                  >
                    {numberString}
                  </span>
                </div>

                {/* Image Section */}
                <motion.div
                  variants={isEven ? slideLeft : slideRight}
                  className={`w-full md:w-1/2 relative z-10 ${!isEven && 'md:order-2'}`}
                >
                  <div className="relative h-[400px] lg:h-[550px] overflow-hidden rounded-sm group">
                    <div className="absolute inset-0 bg-[#081B46]/20 group-hover:bg-transparent transition-colors duration-700 z-10" />
                    <img
                      src={`${API_URL}${blog.blog_image}`}
                      alt={blog.blog_title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
                    />
                  </div>
                </motion.div>

                {/* Content Section */}
                <motion.div
                  variants={fadeUp}
                  className={`w-full md:w-1/2 z-10 flex flex-col ${!isEven && 'md:order-1'}`}
                >
                  <div className="flex items-center text-sm text-slate-500 font-mono mb-6">
                    <span>{new Date(blog.published_date).toLocaleDateString()}</span>
                  </div>

                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#081B46] mb-6 leading-tight group-hover:text-[#D4AF37] transition-colors duration-500">
                    {blog.blog_title}
                  </h2>

                  <p className="text-slate-600 text-lg font-light leading-relaxed mb-10 break-words">
                    {blog.short_description}
                  </p>

                  <div>
                    <Link href={`/blogs/${blog.blog_id}`}>
                      <button className="inline-flex items-center gap-3 text-[#081B46] uppercase tracking-widest font-semibold text-sm hover:text-[#D4AF37] transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-[#D4AF37] after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-300 pb-1">
                        Continue Reading <ChevronRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </motion.div>

              </motion.article>
            );
          })}
        </div>
      </section>

      <LatestArticles mockBlogs={blogsData} />

      <BlogsHeritage />
    </main>
  );
}
