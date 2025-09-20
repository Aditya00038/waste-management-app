
import type {NextConfig} from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';
// Import webpack for NormalModuleReplacementPlugin
import webpack from 'webpack';
import path from 'path';

const withBundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Proper tracing root setup
  distDir: '.next',
  // Merged experimental properties
  experimental: {
    outputFileTracingRoot: __dirname,
    optimizeCss: true,
    scrollRestoration: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Simple fix for handlebars and genkit require.extensions issue
  webpack: (config, { isServer }) => {
    // Handle Node.js specific modules for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        handlebars: false,
        "handlebars/runtime": false,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer/"),
      };
    }
    
    // Add rules to handle problematic modules
    config.module.rules.push(
      {
        test: /node_modules\/handlebars\/lib\/index\.js$/,
        loader: 'null-loader',
      },
      {
        test: /handlebars|dotprompt/,
        loader: 'null-loader',
      }
    );
    
    return config;
  },
  reactStrictMode: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Speed up page transitions
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5,
  },
  images: {
    domains: ['storage.googleapis.com'], // Direct domain allowance
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleapis.com',
        port: '',
        pathname: '/**',
      }
    ],
    minimumCacheTTL: 86400, // Cache optimized images for 1 day
    formats: ['image/webp'],
  },
};

// Enhanced with optimization options
const finalConfig: NextConfig = {
  ...nextConfig,
  // Add optimization for preloads to fix warnings
  experimental: {
    ...nextConfig.experimental,
    optimizeCss: true,
    scrollRestoration: true,
  },
  // Configure HTTP response headers for better caching
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          }
        ],
      },
    ]
  },
};

export default process.env.ANALYZE === 'true' 
  ? withBundleAnalyzerConfig(finalConfig)
  : finalConfig;
