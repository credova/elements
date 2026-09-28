/** @type {import('next').NextConfig} */
const nextConfig = {
  // 127.0.0.1: Playwright's baseURL. Next 16 blocks dev resources from other origins.
  allowedDevOrigins: ['applepaygisely.publicsquare.com', 'http://localhost:5090', '127.0.0.1'],
};

export default nextConfig;
