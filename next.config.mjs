/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3333", // wajib kalau pakai port
        pathname: "/**",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/auth/:path*",
        destination: process.env.NEXT_PUBLIC_API_URL + "/auth/:path*",
      },
    ];
  },
};

export default nextConfig;
