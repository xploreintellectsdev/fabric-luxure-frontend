"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";

export default function BlogDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!id) return;
    const fetchBlog = async () => {
      try {
        const res = await fetch(`${API_URL}/api/blogs/${id}`);
        const data = await res.json();
        if (data.success && data.data) {
          setBlog(data.data);
        } else {
          setBlog(null);
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 font-light text-xl">Loading...</div>;
  }

  if (!blog) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 font-light text-xl">Blog not found.</div>;
  }

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] pt-32 pb-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/blogs" className="inline-flex items-center gap-2 text-[#081B46] uppercase tracking-widest font-semibold text-sm hover:text-[#D4AF37] transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" /> Back to Blogs
        </Link>

        <motion.article 
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          {/* Banner Image */}
          <div className="w-full h-[40vh] md:h-[60vh] relative mb-12 overflow-hidden rounded-sm shadow-sm">
            <img 
              src={`${API_URL}${blog.blog_image}`} 
              alt={blog.blog_title} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title & Short Description */}
          <div className="mb-12">
            <div className="text-sm text-slate-500 font-mono mb-4">
              {new Date(blog.published_date).toLocaleDateString()}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#081B46] mb-6 leading-tight break-words">
              {blog.blog_title}
            </h1>
            <p className="text-xl md:text-2xl font-light text-slate-600 leading-relaxed break-words">
              {blog.short_description}
            </p>
          </div>

          {/* Full Description / Rendered HTML Content */}
          <div 
            className="prose prose-xl max-w-none text-slate-700 font-light leading-relaxed prose-headings:font-serif prose-headings:text-[#081B46] prose-a:text-[#D4AF37] break-words [&_*]:whitespace-normal"
            dangerouslySetInnerHTML={{ __html: blog.blog_content }}
          />
        </motion.article>
      </div>
    </main>
  );
}
