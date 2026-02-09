"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/src/lib";
import type { Step } from "@/src/types";

interface StepCardProps {
  step: Step;
}

export function StepCard({ step }: StepCardProps) {
  return (
    <motion.div variants={fadeInUp} className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white text-xl font-bold">
        {step.number}
      </div>
      <h3 className="mt-4 text-xl font-semibold text-slate-900">{step.title}</h3>
      <p className="mt-2 text-slate-500 max-w-xs mx-auto">{step.description}</p>
    </motion.div>
  );
}
