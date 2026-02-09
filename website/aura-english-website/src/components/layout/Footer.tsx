import Link from "next/link";
import { APP_NAME, APP_VERSION, GITHUB_URL } from "@/src/constants";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-10">
      <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
        <p>
          {APP_NAME} &middot; v{APP_VERSION}
        </p>
        <Link
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-slate-600 transition-colors"
        >
          GitHub
        </Link>
      </div>
    </footer>
  );
}
