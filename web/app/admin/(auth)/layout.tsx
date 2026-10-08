import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
