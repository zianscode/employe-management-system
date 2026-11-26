const nextConfig = {
  async rewrites() {
    return { beforeFiles: [{ source: '/uploads/avatars/:file', destination: '/api/v1/avatars/:file' }] };
  },
  async headers() {
    return [{ source: '/auth/reset-password', headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }] }];
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
