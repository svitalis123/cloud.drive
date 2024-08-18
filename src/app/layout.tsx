import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from './providers'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Photo Pro',
  description: 'Discover PhotoPro: Your all-in-one photo editing solution. Upload, enhance with AI, transform, apply filters, and create collages effortlessly. Professional results, user-friendly interface. Start your photo editing journey today',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          { children }
        </Providers>        
      </body>
    </html>
  )
}