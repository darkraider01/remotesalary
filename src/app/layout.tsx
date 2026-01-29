import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'RemoteSalary | Compare Global Income & Cost of Living',
  description:
    'Free remote salary calculator to compare cost of living, taxes, and disposable income across 15 countries. Calculate your real take-home pay, savings score, and find the best countries for remote workers.',
  keywords: [
    'remote salary calculator',
    'cost of living comparison',
    'digital nomad calculator',
    'disposable income calculator',
    'expat salary comparison',
    'remote work tax calculator',
    'best countries remote workers',
    'salary comparison tool',
  ],
  authors: [{ name: 'RemoteSalary' }],
  openGraph: {
    title: 'RemoteSalary (2026)',
    description:
      'Compare your real take-home pay across 15 countries. Free calculator for remote workers.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RemoteSalary (2026)',
    description:
      'Compare your real take-home pay across 15 countries. Free calculator for remote workers.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#0f172a" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2561060401438724"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="bg-slate-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
