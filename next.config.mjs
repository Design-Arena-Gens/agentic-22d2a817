import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    HUBSPOT_API_KEY: process.env.HUBSPOT_API_KEY,
    CLICKUP_API_TOKEN: process.env.CLICKUP_API_TOKEN,
    KNOWLEDGE_BASE_BUCKET: process.env.KNOWLEDGE_BASE_BUCKET,
    DEFAULT_LOCALE: process.env.DEFAULT_LOCALE ?? 'en'
  }
};

export default nextConfig;
