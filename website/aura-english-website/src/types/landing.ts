import type { LucideIcon } from "lucide-react";

export interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  iconColor: string;
}

export interface Step {
  number: number;
  title: string;
  description: string;
}

export interface Screenshot {
  src: string;
  alt: string;
  label: string;
}
