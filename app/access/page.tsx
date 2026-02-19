"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AccessPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const nextPath = searchParams.get("next") || "/";
    const res = await fetch("/api/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoading(false);
      setError(data?.error || "Access denied.");
      return;
    }

    router.push(nextPath);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-primary text-[#F8FAFC] flex items-center justify-center px-6">
      <div className="surface-card w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold">Protected Access</h1>
        <p className="mt-2 text-sm text-muted">Enter password to continue.</p>

        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-[14px] border border-border bg-primary px-4 py-3 text-sm text-[#F8FAFC]"
            placeholder="Password"
            required
          />
          <button type="submit" className="btn-primary w-full py-3 text-sm font-semibold" disabled={loading}>
            {loading ? "Checking..." : "Unlock Website"}
          </button>
        </form>

        {error && <p className="mt-3 text-sm text-[#F8FAFC]">{error}</p>}
      </div>
    </div>
  );
}

