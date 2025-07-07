import * as React from 'react';

// This is a simple layout wrapper for admin pages.
// It can be expanded to include admin-specific headers or navigation if needed.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
