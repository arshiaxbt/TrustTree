/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'thick-emerald-possum.myfilebase.com',
                pathname: '/ipfs/**',
            },
            {
                protocol: 'https',
                hostname: 'pbs.twimg.com',
            },
        ],
    },
};

export default nextConfig;
