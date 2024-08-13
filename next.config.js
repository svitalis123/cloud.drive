/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental:{
    fetchCache: 'force-no-store',
  }
  // output: 'static'
}

module.exports = nextConfig
