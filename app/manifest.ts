import type { MetadataRoute } from "next";

// Static export needs this route pinned; it has nothing dynamic in it anyway.
export const dynamic = "force-static";

/** Lets the app install to a phone home screen and open without browser chrome. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TFT Set 18 flashcards",
    short_name: "Set 18",
    description: "Champions, traits, breakpoints and abilities. Nothing saved, nothing tracked.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f2eee7",
    theme_color: "#f2eee7",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
