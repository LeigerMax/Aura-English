"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/src/lib";
import { SectionHeading, StepCard } from "@/src/components/ui";
import { STEPS } from "@/src/data";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeading
          title="How it works"
          subtitle="Three simple steps to fluency."
          accent
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-10 sm:grid-cols-3"
        >
          {STEPS.map((step) => (
            <StepCard key={step.number} step={step} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
