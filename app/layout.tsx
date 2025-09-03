import { ThemeProvider } from '@/components/theme-provider';
import { auth } from '@/lib/auth';
import { BookMarkedIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import Nav from './nav';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Social Book & Mark',
  description: 'Social BookMark',
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    // html Darker_Grotesque, whitemode 설정
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={session}>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            <div className='container mx-auto flex h-screen flex-col justify-center'>
              <header className='flex justify-between border border-b-1'>
                <Link
                  href='/'
                  className='flex items-center font-semibold text-3xl text-green-500 tracking-tight'
                >
                  <BookMarkedIcon size={28} /> BookMark
                </Link>
                <Nav />
              </header>
              <main className='flex-1'> {children}</main>
              <footer className='text-center text-green-500'>
                &#169; seonu Sesac 2025
              </footer>
            </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
