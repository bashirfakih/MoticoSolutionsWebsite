import type { Metadata } from 'next';
import { AdminLayout } from './AdminLayoutClient';

export const metadata: Metadata = {
  title: {
    default: 'Admin Dashboard',
    template: '%s | Motico Admin',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
