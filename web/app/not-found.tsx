import Link from "next/link";
import { Wordmark } from "@/components/brand";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-gradient-to-br from-sprout to-mist px-4 text-center">
      <Wordmark />
      <h1 className="text-4xl font-bold">Page not found</h1>
      <p className="text-ink-soft">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link href="/" className="btn-primary">Back to home</Link>
    </div>
  );
}
