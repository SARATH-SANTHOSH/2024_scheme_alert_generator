import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KTU 2024 Scheme Live Tracker',
  description: 'Live dashboard monitoring KTU 2024 Scheme announcements.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
