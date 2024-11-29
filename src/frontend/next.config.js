/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/auth/register",
      },
      {
        source: "/auth",
        destination: "/auth/register",
      },
    ];
  },
};


module.exports = nextConfig
