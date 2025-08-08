import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Ignoruj błędy ESLint podczas builda produkcyjnego
    // (lokalnie dalej działa `npm run lint`)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
