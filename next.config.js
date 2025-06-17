/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // remotePatterns: [[new URL("https://avatars.githubusercontent.com/u/*")]],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/u/**",
      },
    ],
  },
};

module.exports = nextConfig;
