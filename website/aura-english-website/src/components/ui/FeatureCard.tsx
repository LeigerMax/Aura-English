"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/src/lib";
import type { Feature } from "@/src/types";

interface FeatureCardProps {
  feature: Feature;
}

export function FeatureCard({ feature }: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <motion.div
      variants={fadeInUp}
      className="group relative rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Gradient accent top bar */}
      <div
        className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r ${feature.gradient}`}
      />

      <div
        className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
      >
        <Icon className="h-7 w-7 text-white" strokeWidth={2} />
      </div>

      <h3 className="mt-5 text-xl font-semibold text-slate-900">
        {feature.title}
      </h3>
      <p className="mt-2 text-slate-500 leading-relaxed">
        {feature.description}
      </p>
    </motion.div>
  );
}
