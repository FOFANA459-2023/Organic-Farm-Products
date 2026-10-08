import type { Metadata } from "next";
import { PolicyPlaceholder } from "@/components/policy-placeholder";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <PolicyPlaceholder title="Privacy policy">
      <div className="prose-farm">
        <p>
          When you place an order or send us a message, we collect the details you enter (such as your name, phone
          number, email, district and address) so that we can respond and arrange your order. Website visits are measured
          with Cloudflare Web Analytics, which does not use cookies.
        </p>
      </div>
    </PolicyPlaceholder>
  );
}
