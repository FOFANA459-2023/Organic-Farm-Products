export interface Bindings {
  WEB_ORIGIN: string;
  ORDER_NOTIFY_EMAIL: string;
  EMAIL_FROM: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  RESEND_API_KEY?: string;
  FORM_LIMITER?: RateLimit;
}

export interface Variables {
  adminUserId: string;
}

export type AppEnv = { Bindings: Bindings; Variables: Variables };
