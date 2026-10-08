import { ApiError } from "./http";

export async function verifyTurnstile(secret: string, token: string, ip?: string): Promise<void> {
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  const data = (await res.json()) as { success: boolean };
  if (!data.success) throw new ApiError(400, "captcha_failed", "Security check failed. Please try again.");
}
