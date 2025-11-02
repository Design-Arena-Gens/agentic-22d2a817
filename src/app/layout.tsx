import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OneHotel Conversational Suite',
  description: 'Lead capture and support chatbot platform for OneHotel.asia'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={process.env.DEFAULT_LOCALE ?? 'en'}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
