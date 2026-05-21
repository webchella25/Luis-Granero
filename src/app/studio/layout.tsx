import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Studio',
  robots: 'noindex, nofollow',
};

export default function StudioRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
