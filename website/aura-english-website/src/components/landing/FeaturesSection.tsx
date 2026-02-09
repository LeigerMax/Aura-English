"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/src/lib";
import { SectionHeading, FeatureCard } from "@/src/components/ui";
import { FEATURES } from "@/src/data";

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-20 sm:py-28 bg-slate-50">
      {/* Decorative gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"
      />

      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          title="Everything you need to learn English"
          subtitle="A focused toolkit — no bloat, no distractions."
          accent
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
