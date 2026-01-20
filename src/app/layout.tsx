import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/dashboard/sidebar';
import { PWARegister } from '@/components/pwa-register';

export const metadata: Metadata = {
  title: 'Aegis Viral Engine',
  description: 'Automate the creation of viral TikTok content promoting ethical AI and humanitarian tech',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#020617" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/api/icon?size=192" />
      </head>
      <body className="font-sans antialiased bg-slate-950 text-slate-200">
        <PWARegister />
        <Sidebar />
        <main className="lg:pl-64 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pt-16 lg:pt-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
