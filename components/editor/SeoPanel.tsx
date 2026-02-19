"use client";

import { SeoPayload } from "@/lib/schema";

export default function SeoPanel({ seo }: { seo: SeoPayload | null }) {
  if (!seo) {
    return <p className="text-sm text-muted">SEO data is not available yet.</p>;
  }

  return (
    <div className="space-y-6 text-sm">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Pages</p>
        <div className="mt-3 space-y-3">
          {seo.pages.map((page) => (
            <div key={page.slug} className="rounded-[18px] border border-border bg-primary p-3">
              <p className="font-semibold text-[#F8FAFC]">{page.slug}</p>
              <p className="text-muted">Title: {page.title}</p>
              <p className="text-muted">Description: {page.description}</p>
              <p className="text-muted">Keywords: {page.keywords.join(", ")}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Recommendations</p>
        <ul className="mt-3 list-disc space-y-2 pl-4 text-muted">
          {seo.recommendations.map((rec) => (
            <li key={rec}>{rec}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
