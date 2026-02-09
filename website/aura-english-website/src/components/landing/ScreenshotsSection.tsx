"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/src/lib";
import { SectionHeading } from "@/src/components/ui";
import { SCREENSHOTS } from "@/src/data";

export function ScreenshotsSection() {
  return (
    <section className="relative py-20 sm:py-28 bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden">
      {/* Background decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full bg-gradient-to-r from-blue-500/10 to-violet-500/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeading
          title="See it in action"
          subtitle="A beautiful interface designed for focused learning."
          light
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="flex justify-center gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
        >
          {SCREENSHOTS.map((screenshot) => (
            <motion.div
              key={screenshot.label}
              variants={fadeInUp}
              className="flex-shrink-0 snap-center"
            >
              <div className="group relative rounded-3xl bg-gradient-to-b from-white/10 to-white/5 p-2 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors">
                <div className="relative w-[220px] h-[440px] sm:w-[260px] sm:h-[520px] rounded-2xl overflow-hidden bg-slate-800">
                  <Image
                    src={screenshot.src}
                    alt={screenshot.alt}
                    fill
                    className="object-cover"
                    sizes="260px"
                  />

                </div>
              </div>
              <p className="mt-3 text-center text-sm font-medium text-slate-400">
                {screenshot.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
