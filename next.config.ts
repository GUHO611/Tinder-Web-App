import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        // Cập nhật domain mới từ thông báo lỗi của bạn
        hostname: "nnlzfhtbykgspfphdcfs.supabase.co",
      },
    ],
  },
};

export default nextConfig;