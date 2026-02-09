"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/src/lib";
import { BookMarked, Dumbbell, Trophy } from "lucide-react";
import type { Step } from "@/src/types";

const STEP_STYLES = [
  { gradient: "from-blue-500 to-cyan-400", icon: BookMarked },
  { gradient: "from-violet-500 to-purple-400", icon: Dumbbell },
  { gradient: "from-emerald-500 to-teal-400", icon: Trophy },
];

interface StepCardProps {
  step: Step;
}

export function StepCard({ step }: StepCardProps) {
  const style = STEP_STYLES[step.number - 1] ?? STEP_STYLES[0];
  const Icon = style.icon;

  return (
    <motion.div variants={fadeInUp} className="text-center">
      <div
        className={`relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${style.gradient} shadow-lg`}
      >
        <Icon className="h-9 w-9 text-white" strokeWidth={2} />
        <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-900 shadow-md">
          {step.number}
        </span>
      </div>
      <h3 className="mt-5 text-xl font-semibold text-slate-900">{step.title}</h3>
      <p className="mt-2 text-slate-500 max-w-xs mx-auto">{step.description}</p>
    </motion.div>
  );
}
