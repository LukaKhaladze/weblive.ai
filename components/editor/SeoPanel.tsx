"use client";

import { SeoPayload } from "@/lib/schema";

export default function SeoPanel({ seo }: { seo: SeoPayload | null }) {
  if (!seo) {
    return <p className="text-sm text-slate-500">SEO data is not available yet.</p>;
  }

  return (
    <div className="space-y-6 text-sm">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pages</p>
        <div className="mt-3 space-y-3">
          {seo.pages.map((page) => (
            <div key={page.slug} className="rounded-[18px] border border-slate-200 bg-white p-3">
              <p className="font-semibold text-slate-900">{page.slug}</p>
              <p className="text-slate-600">Title: {page.title}</p>
              <p className="text-slate-600">Description: {page.description}</p>
              <p className="text-slate-500">Keywords: {page.keywords.join(", ")}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Recommendations</p>
        <ul className="mt-3 list-disc space-y-2 pl-4 text-slate-600">
          {seo.recommendations.map((rec) => (
            <li key={rec}>{rec}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
