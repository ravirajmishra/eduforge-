/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['pptxgenjs', 'docx', 'jspdf'],
  },
};

export default nextConfig;
