import type { Bindings } from "../env";

interface Email {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

/** Sends via Resend. Without an API key (local dev) the email is logged instead. Never throws. */
export async function sendEmail(env: Bindings, email: Email): Promise<void> {
  if (!env.RESEND_API_KEY) {
    console.log(`[email:dev] to=${email.to} subject="${email.subject}"\n${email.text}`);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: [email.to],
        subject: email.subject,
        text: email.text,
        reply_to: email.replyTo,
      }),
    });
    if (!res.ok) console.error(`Resend ${res.status}: ${await res.text()}`);
  } catch (err) {
    console.error("Email send failed", err);
  }
}
