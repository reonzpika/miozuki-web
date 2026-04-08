import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';
import Header from '@/components/header';
import Footer from '@/components/footer';
import AnnouncementBar from '@/components/announcement-bar';
import { CartProvider } from '@/components/cart-provider';
import EmailPopup from '@/components/email-popup';

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Miozuki — Fine Jewellery',
  description:
    'Moissanite and pearl fine jewellery, ethically made and designed in New Zealand. Discover pieces that last a lifetime.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <CartProvider>
          <AnnouncementBar />
          <Header />
          <div className="flex flex-col flex-1">{children}</div>
          <Footer />
          <EmailPopup />
        </CartProvider>
      </body>
    </html>
  );
}
