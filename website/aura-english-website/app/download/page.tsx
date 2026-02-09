import type { Metadata } from "next";
import { DownloadPageContent } from "./DownloadPageContent";

export const metadata: Metadata = {
  title: "Download",
  description: "Download the latest Aura English APK for Android.",
};

export default function DownloadPage() {
  return <DownloadPageContent />;
}
