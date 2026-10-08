"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { enquiryInputSchema, type EnquiryInput, type EnquiryType } from "@ofp/shared";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { apiFetch, ApiRequestError } from "@/lib/api";
import { CheckIcon } from "./icons";
import { Turnstile, useTurnstile } from "./turnstile";
import { Field, Notice } from "./ui";

const COPY: Record<EnquiryType, { submit: string; message: string; done: string; showBusiness: boolean }> = {
  wholesale: {
    submit: "Send enquiry",
    message: "What products and quantities do you need, and how often?",
    done: "Thank you — we've received your enquiry and will contact you shortly.",
    showBusiness: true,
  },
  notify: {
    submit: "Notify me",
    message: "Anything you'd like us to know? (optional)",
    done: "Thank you — we'll let you know as soon as our chicken is available.",
    showBusiness: true,
  },
  contact: {
    submit: "Send message",
    message: "Your message",
    done: "Thank you — we've received your message and will get back to you soon.",
    showBusiness: false,
  },
};

export function EnquiryForm({ type }: { type: EnquiryType }) {
  const copy = COPY[type];
  const turnstile = useTurnstile();
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryInput>({
    resolver: zodResolver(enquiryInputSchema),
    defaultValues: { type, turnstileToken: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError("");
    try {
      await apiFetch("/enquiries", { method: "POST", body: JSON.stringify(values) });
      setDone(true);
    } catch (e) {
      setServerError(e instanceof ApiRequestError ? e.message : "Could not send. Please check your connection and try again.");
      turnstile.reset();
      setValue("turnstileToken", "");
    }
  });

  if (done) {
    return (
      <div className="card flex items-start gap-3 p-6">
        <span className="mt-0.5 rounded-full bg-sprout p-1.5 text-leaf-dark">
          <CheckIcon className="h-4 w-4" />
        </span>
        <p className="text-ink">{copy.done}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6 sm:p-8" noValidate>
      <input type="hidden" {...register("type")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" error={errors.name?.message}>
          <input className="field-input" autoComplete="name" {...register("name")} />
        </Field>
        <Field label="Phone / WhatsApp" error={errors.phone?.message}>
          <input className="field-input" type="tel" autoComplete="tel" placeholder="+266 …" {...register("phone")} />
        </Field>
        <Field label="Email (optional)" error={errors.email?.message}>
          <input className="field-input" type="email" autoComplete="email" {...register("email")} />
        </Field>
        {copy.showBusiness && (
          <Field label="Business name (optional)" error={errors.business?.message}>
            <input className="field-input" autoComplete="organization" {...register("business")} />
          </Field>
        )}
      </div>
      <Field label={copy.message} error={errors.message?.message}>
        <textarea className="field-input min-h-28" {...register("message")} />
      </Field>
      <Turnstile
        widgetId={turnstile.widgetId}
        onToken={(t) => setValue("turnstileToken", t, { shouldValidate: !!t })}
      />
      {errors.turnstileToken && <p className="field-error">{errors.turnstileToken.message}</p>}
      {serverError && <Notice tone="error">{serverError}</Notice>}
      <button type="submit" className="btn-primary w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : copy.submit}
      </button>
    </form>
  );
}
