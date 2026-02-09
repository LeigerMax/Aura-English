import Link from "next/link";
import { ANDROID_APK_URL } from "@/src/constants";

interface DownloadButtonProps {
  size?: "default" | "large";
  className?: string;
}

export function DownloadButton({ size = "default", className = "" }: DownloadButtonProps) {
  const sizeClasses =
    size === "large" ? "px-8 py-4 text-lg" : "px-6 py-3 text-base";

  return (
    <Link
      href={ANDROID_APK_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-700 transition-colors ${sizeClasses} ${className}`}
    >
      Download APK
    </Link>
  );
}
