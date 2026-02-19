"use client";

import { FormEvent, useState } from "react";

export default function LandingEmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setStatus("success");
    setEmail("");
  }

  return (
    <section id="email-capture" className="surface-card p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-[#F8FAFC]">Get product updates</h2>
      <p className="mt-2 text-sm text-muted">Optional: receive release notes and practical tips. You can start building immediately.</p>
      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="landing-email" className="sr-only">
          Email
        </label>
        <input
          id="landing-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          placeholder="you@company.com"
          className="h-12 flex-1 rounded-[14px] border border-border bg-primary px-4 text-sm text-[#F8FAFC] placeholder:text-muted"
        />
        <button
          type="submit"
          className="btn-primary h-12 px-5 text-sm font-semibold"
        >
          Subscribe
        </button>
      </form>
      <p
        className={`mt-3 text-sm transition ${
          status === "success" ? "translate-y-0 opacity-100 text-[#F8FAFC]" : "translate-y-1 opacity-0"
        }`}
      >
        Thanks. You are subscribed.
      </p>
    </section>
  );
}
