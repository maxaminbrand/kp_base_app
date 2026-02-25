import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SBBN",
    short_name: "SBBN",
    description: "Small Business Buyers Network",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0b0b0f",
    theme_color: "#0b0b0f",
    icons: [
      { src: "/pwa/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/pwa/maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}