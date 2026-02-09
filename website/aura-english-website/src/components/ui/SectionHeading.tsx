"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/src/lib";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  accent?: boolean;
  light?: boolean;
}

export function SectionHeading({ title, subtitle, accent, light }: SectionHeadingProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="text-center mb-14"
    >
      {accent && (
        <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
      )}
      <h2
        className={`text-3xl sm:text-4xl font-bold ${light ? "text-white" : "text-slate-900"}`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-3 text-lg max-w-xl mx-auto ${light ? "text-slate-300" : "text-slate-500"}`}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
