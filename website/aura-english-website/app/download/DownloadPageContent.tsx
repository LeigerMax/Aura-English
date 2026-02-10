"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/src/lib";
import { DownloadButton } from "@/src/components/ui";
import { APP_VERSION, PLATFORM } from "@/src/constants";
import { CHANGELOG } from "@/src/data/changelog";

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

        {/* Changelog */}
        {CHANGELOG.length > 0 && (
          <motion.div variants={fadeInUp} className="mt-16 text-left">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">
              What&apos;s New
            </h2>
            <div className="space-y-6">
              {CHANGELOG.map((entry) => (
                <div
                  key={entry.version}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-600">
                      v{entry.version}
                    </span>
                    <span className="text-xs text-slate-400">{entry.date}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {entry.changes.map((change) => (
                      <li
                        key={change}
                        className="flex items-start gap-2 text-sm text-slate-600"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}

function InfoRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <p className="text-sm text-slate-600">
      <span className="font-medium text-slate-900">{label}:</span>{" "}
      {value}
    </p>
  );
}
