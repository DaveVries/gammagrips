import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      /* /collections advertised three surface families across six moulds. There
         is one mould, so the taxonomy was fiction and the routes are gone.
         Permanent, because they were in the sitemap and may be indexed. */
      { source: "/collections", destination: "/controller-grips", permanent: true },
      { source: "/collections/:id", destination: "/controller-grips", permanent: true },
      /* Compared five textures that turned out to be one. */
      {
        source: "/guides/grip-texture-comparison",
        destination: "/guides/choosing-a-controller-grip",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
