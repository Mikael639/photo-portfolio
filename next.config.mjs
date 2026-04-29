function getSupabaseHostname() {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) return null;

  try {
    return new URL(supabaseUrl).hostname;
  } catch {
    return null;
  }
}

function getR2PublicHostname() {
  const r2PublicUrl = process.env.R2_PUBLIC_URL;
  if (!r2PublicUrl) return null;

  try {
    return new URL(r2PublicUrl).hostname;
  } catch {
    return null;
  }
}

const supabaseHostname = getSupabaseHostname();
const r2PublicHostname = getR2PublicHostname();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
        pathname: "/**",
      },
      ...(supabaseHostname
        ? [
            {
              protocol: "https",
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      ...(r2PublicHostname
        ? [
            {
              protocol: "https",
              hostname: r2PublicHostname,
              pathname: "/**",
            },
          ]
        : []),
    ],
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp"],
    minimumCacheTTL: 2678400,
    qualities: [75, 85, 90],
    unoptimized: true,
  },
};

export default nextConfig;
