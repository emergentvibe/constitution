/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/sign',
        destination: '/quickstart',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
