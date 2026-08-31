/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  // Limit parallel build workers so the build doesn't spike memory usage
  // and crash on machines with limited free RAM.
  experimental: {
    cpus: 1,
  },
};

module.exports = nextConfig;
