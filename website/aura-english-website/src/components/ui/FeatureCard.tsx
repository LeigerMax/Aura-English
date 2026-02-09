"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/src/lib";
import type { Feature } from "@/src/types";

interface FeatureCardProps {
  feature: Feature;
}

export function FeatureCard({ feature }: FeatureCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <span className="text-4xl" role="img" aria-label={feature.title}>
        {feature.icon}
      </span>
      <h3 className="mt-4 text-xl font-semibold text-slate-900">{feature.title}</h3>
      <p className="mt-2 text-slate-500 leading-relaxed">{feature.description}</p>
    </motion.div>
  );
}
