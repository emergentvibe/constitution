/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/sign',
        destination: '/c/emergentvibe/quickstart',
        permanent: true,
      },
      {
        source: '/constitution',
        destination: '/c/emergentvibe',
        permanent: true,
      },
      {
        source: '/registry',
        destination: '/c/emergentvibe/registry',
        permanent: true,
      },
      {
        source: '/quickstart',
        destination: '/c/emergentvibe/quickstart',
        permanent: true,
      },
      {
        source: '/join',
        destination: '/c/emergentvibe/join',
        permanent: true,
      },
      {
        source: '/dashboard',
        destination: '/c/emergentvibe/dashboard',
        permanent: true,
      },
      {
        source: '/governance',
        destination: '/c/emergentvibe/governance',
        permanent: true,
      },
      {
        source: '/governance/:path*',
        destination: '/c/emergentvibe/governance/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
