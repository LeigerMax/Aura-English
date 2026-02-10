import { NextResponse } from "next/server";
import { APP_VERSION, ANDROID_APK_URL } from "@/src/constants";

/**
 * GET /api/version
 *
 * Returns the latest app version info.
 * The mobile app polls this endpoint on startup to check for updates.
 */
export async function GET() {
  return NextResponse.json(
    {
      version: APP_VERSION,
      downloadUrl: ANDROID_APK_URL,
      updateUrl: "https://aura-english.vercel.app/download",
      releaseNotes: "",
      forceUpdate: false,
    },
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
