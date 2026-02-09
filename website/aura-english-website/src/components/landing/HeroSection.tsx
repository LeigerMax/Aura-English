"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/src/lib";
import { DownloadButton } from "@/src/components/ui";
import { APP_NAME, APP_TAGLINE, APP_DESCRIPTION } from "@/src/constants";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white pt-28 pb-20 sm:pt-36 sm:pb-28">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-3xl px-6 text-center"
      >
        <motion.h1
          variants={fadeInUp}
          className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900"
        >
          {APP_NAME}
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className="mt-4 text-xl sm:text-2xl font-medium text-slate-500"
        >
          {APP_TAGLINE}
        </motion.p>

        <motion.p
          variants={fadeInUp}
          className="mt-6 text-lg text-slate-400 max-w-xl mx-auto"
        >
          {APP_DESCRIPTION}
        </motion.p>

        <motion.div variants={fadeInUp} className="mt-10">
          <DownloadButton size="large" />
        </motion.div>
      </motion.div>

      {/* Decorative gradient blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 opacity-40 blur-3xl"
      />
    </section>
  );
}
