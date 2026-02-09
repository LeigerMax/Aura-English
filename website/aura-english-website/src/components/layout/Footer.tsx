import Link from "next/link";
import Image from "next/image";
import { APP_NAME, APP_VERSION, GITHUB_URL } from "@/src/constants";
import { Github, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-10">
      <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt={`${APP_NAME} logo`}
            width={20}
            height={20}
            className="rounded-md"
          />
          <p>
            {APP_NAME} &middot; v{APP_VERSION}
          </p>
        </div>

        <p className="flex items-center gap-1 text-slate-400">
          Made with <Heart className="h-3.5 w-3.5 text-pink-500 fill-pink-500" /> for English learners
        </p>

        <Link
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-slate-600 transition-colors"
        >
          <Github className="h-4 w-4" /> GitHub
        </Link>
      </div>
    </footer>
  );
}
