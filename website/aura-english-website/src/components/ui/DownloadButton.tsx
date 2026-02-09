import Link from "next/link";
import { ANDROID_APK_URL } from "@/src/constants";
import { Download } from "lucide-react";

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
      className={`inline-flex items-center gap-2 font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 ${sizeClasses} ${className}`}
    >
      <Download className="h-5 w-5" />
      Download APK
    </Link>
  );
}
