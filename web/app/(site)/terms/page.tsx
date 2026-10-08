import type { Metadata } from "next";
import { PolicyPlaceholder } from "@/components/policy-placeholder";

export const metadata: Metadata = { title: "Terms & conditions" };

export default function TermsPage() {
  return <PolicyPlaceholder title="Terms & conditions" />;
}
