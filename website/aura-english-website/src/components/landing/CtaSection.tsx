"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/src/lib";
import { DownloadButton } from "@/src/components/ui";
import { Rocket } from "lucide-react";

export function CtaSection() {
  return (
    <section className="relative py-20 sm:py-28 bg-white overflow-hidden">
      {/* Decorative gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent"
      />

      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="relative mx-auto max-w-2xl px-6 text-center"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg mb-6">
          <Rocket className="h-8 w-8 text-white" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
          Ready to level up your English?
        </h2>
        <p className="mt-4 text-lg text-slate-500">
          Download Aura English now and start learning — no account required, fully offline.
          Connect your own AI for smart hints!
        </p>
        <div className="mt-8">
          <DownloadButton size="large" />
        </div>
      </motion.div>
    </section>
  );
}
