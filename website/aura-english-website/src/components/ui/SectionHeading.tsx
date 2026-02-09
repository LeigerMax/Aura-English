"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/src/lib";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

export function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="text-center mb-12"
    >
      <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">{title}</h2>
      {subtitle && (
        <p className="mt-3 text-lg text-slate-500 max-w-xl mx-auto">{subtitle}</p>
      )}
    </motion.div>
  );
}
