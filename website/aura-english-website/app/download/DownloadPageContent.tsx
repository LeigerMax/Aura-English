"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/src/lib";
import { DownloadButton } from "@/src/components/ui";
import { APP_VERSION, PLATFORM } from "@/src/constants";

export function DownloadPageContent() {
  return (
    <section className="pt-32 pb-20 sm:pt-40 sm:pb-28">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-xl px-6 text-center"
      >
        <motion.h1
          variants={fadeInUp}
          className="text-4xl sm:text-5xl font-extrabold text-slate-900"
        >
          Download Aura English
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className="mt-4 text-lg text-slate-500"
        >
          Get the latest version for {PLATFORM}.
        </motion.p>

        <motion.div
          variants={fadeInUp}
          className="mt-10 inline-flex flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div className="space-y-1 text-left w-full">
            <InfoRow label="Version" value={APP_VERSION} />
            <InfoRow label="Platform" value={PLATFORM} />
            <InfoRow label="Install type" value="Manual APK (outside Play Store)" />
          </div>

          <DownloadButton size="large" />
        </motion.div>

        <motion.p
          variants={fadeInUp}
          className="mt-6 text-sm text-slate-400"
        >
          You may need to allow installs from unknown sources in your device settings.
        </motion.p>
      </motion.div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm text-slate-600">
      <span className="font-medium text-slate-900">{label}:</span>{" "}
      {value}
    </p>
  );
}
