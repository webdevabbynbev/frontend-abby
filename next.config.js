/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
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
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:3333/api/v1/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
