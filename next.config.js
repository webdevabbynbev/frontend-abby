/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "standalone",
  images: {
    domains: ["d2ntedlnuwws1k.cloudfront.net", "localhost", "127.0.0.1"],
    remotePatterns: [
      { protocol: "http", hostname: "localhost", pathname: "/uploads/**" },
      { protocol: "http", hostname: "127.0.0.1", pathname: "/uploads/**" },
      { protocol: "https", hostname: "ibyteimg.com", pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "blog.abbynbev.com", pathname: "/**" },
    ],
  },
  async rewrites() {
    return [
      // AUTH
      { source: "/api/auth/:path*", destination: `${api}/api/auth/:path*` },
      { source: "/api/:path*", destination: `${api}/api/:path*` },
    ];
  },
};

module.exports = nextConfig;
