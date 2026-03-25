import { Metadata } from "next";
import { Header, Footer } from "@/src/components";
import { CHANGELOG } from "@/src/data/changelog";
import { CheckCircle2, Zap, Bug, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Changelog",
  description: "History of updates and improvements to Aura English.",
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-slate-900 pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            <span>Latest Updates</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Changelog
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            See what's new in Aura English. We are constantly improving the app
            to help you learn faster and better.
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-16">
            {CHANGELOG.map((entry, entryIdx) => (
              <div key={entry.version} className="relative">
                {/* Visual Connector */}
                {entryIdx !== CHANGELOG.length - 1 && (
                  <div className="absolute left-[1.35rem] md:left-1/2 top-10 w-px h-full bg-slate-200 md:-translate-x-px" />
                )}

                <div className="md:flex md:items-start md:gap-12">
                  {/* Version & Date (Left side on desktop) */}
                  <div className="md:w-1/4 md:text-right mb-4 md:mb-0">
                    <div className="flex flex-col md:items-end">
                      <h2 className="text-2xl font-bold text-slate-900">
                        v{entry.version}
                      </h2>
                      <time className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                    </div>
                  </div>

                  {/* Changes List (Right side on desktop) */}
                  <div className="md:w-3/4 pl-14 md:pl-0">
                    <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <ul className="space-y-4">
                        {entry.changes.map((change, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                            <span className="text-slate-700 leading-relaxed font-medium">
                              {change}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
