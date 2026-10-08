import type { Metadata } from "next";
import { PolicyPlaceholder } from "@/components/policy-placeholder";

export const metadata: Metadata = { title: "Refunds & returns" };

export default function RefundsPage() {
  return <PolicyPlaceholder title="Refunds & returns" />;
}
