"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/src/lib";
import { SectionHeading, FeatureCard } from "@/src/components/ui";
import { FEATURES } from "@/src/data";

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading
          title="Everything you need to learn English"
          subtitle="A focused toolkit — no bloat, no distractions."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-6 sm:grid-cols-2"
        >
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
