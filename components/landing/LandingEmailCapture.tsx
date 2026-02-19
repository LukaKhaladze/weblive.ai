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
    <section id="email-capture" className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur md:p-8">
      <h2 className="text-2xl font-semibold text-white">Get product updates before launch</h2>
      <p className="mt-2 text-sm text-white/65">No spam. We only send major product updates and early-access invites.</p>
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
          className="h-12 flex-1 rounded-xl border border-white/15 bg-[#0a1224] px-4 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        />
        <button
          type="submit"
          className="h-12 rounded-xl bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          Notify Me
        </button>
      </form>
      <p
        className={`mt-3 text-sm transition ${
          status === "success" ? "translate-y-0 opacity-100 text-emerald-300" : "translate-y-1 opacity-0"
        }`}
      >
        You are on the list. We will contact you soon.
      </p>
    </section>
  );
}
