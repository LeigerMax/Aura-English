import { APP_VERSION } from "./app";
import { GITHUB_URL } from "./links";

/**
 * GitHub Releases APK download link.
 * Automatically built from the current APP_VERSION.
 * Upload the APK to GitHub Releases with tag `v{APP_VERSION}`.
 */
export const ANDROID_APK_URL =
  `${GITHUB_URL}/releases/download/v${APP_VERSION}/aura-english-v${APP_VERSION}.apk`;
