"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/src/lib";
import { DownloadButton } from "@/src/components/ui";
import { APP_NAME, APP_TAGLINE, APP_DESCRIPTION } from "@/src/constants";
import { Sparkles, BookOpen, Brain } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 pt-28 pb-20 sm:pt-36 sm:pb-32">
      {/* Animated gradient orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-blue-500/20 to-cyan-500/10 blur-3xl animate-pulse"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-bl from-violet-500/20 to-purple-500/10 blur-3xl animate-pulse"
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative mx-auto max-w-4xl px-6 text-center"
      >
        {/* Logo */}
        <motion.div variants={fadeInUp} className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400 to-indigo-500 blur-xl opacity-40" />
            <Image
              src="/logo.png"
              alt={`${APP_NAME} logo`}
              width={100}
              height={100}
              className="relative rounded-3xl shadow-2xl"
              priority
            />
          </div>
        </motion.div>

        <motion.h1
          variants={fadeInUp}
          className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white"
        >
          {APP_NAME}
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className="mt-4 text-xl sm:text-2xl font-medium bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent"
        >
          {APP_TAGLINE}
        </motion.p>

        <motion.p
          variants={fadeInUp}
          className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed"
        >
          {APP_DESCRIPTION}
        </motion.p>

        {/* Feature pills */}
        <motion.div
          variants={fadeInUp}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2 text-sm font-medium text-blue-200">
            <BookOpen className="h-4 w-4" /> Flashcards
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2 text-sm font-medium text-violet-200">
            <Brain className="h-4 w-4" /> Spaced Repetition
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2 text-sm font-medium text-pink-200">
            <Sparkles className="h-4 w-4" /> AI-Powered
          </span>
        </motion.div>

        <motion.div variants={fadeInUp} className="mt-10">
          <DownloadButton size="large" />
        </motion.div>
      </motion.div>
    </section>
  );
}
