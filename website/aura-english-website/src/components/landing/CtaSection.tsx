"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/src/lib";
import { DownloadButton } from "@/src/components/ui";

export function CtaSection() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="mx-auto max-w-2xl px-6 text-center"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
          Ready to level up your English?
        </h2>
        <p className="mt-4 text-lg text-slate-500">
          Download Aura English now and start learning — no account required, fully offline.
        </p>
        <div className="mt-8">
          <DownloadButton size="large" />
        </div>
      </motion.div>
    </section>
  );
}
