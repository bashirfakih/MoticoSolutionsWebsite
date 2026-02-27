'use client';

/**
 * Admin New Product Page
 *
 * Redirects to the product editor with 'new' as the ID.
 *
 * @module app/admin/products/new/page
 */

import { redirect } from 'next/navigation';
import AdminProductEditPage from '../[id]/page';

export default function AdminNewProductPage() {
  // The [id] page handles both new and edit
  // We just render it with 'new' in the URL
  return <AdminProductEditPage />;
}
