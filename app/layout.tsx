import type {Metadata} from 'next';
import './globals.css';
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'MIOS Payroll',
  description: 'MIOS Payroll - Multi-tenant Tax & Payroll Calculator',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-gray-50 text-gray-900 font-sans antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
