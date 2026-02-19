"use client";

import { useMemo, useState } from "react";

const tabContent = {
  Sell: {
    title: "Sell products with clarity",
    desc: "Create product-focused pages with strong CTA paths and conversion-first content blocks.",
  },
  Book: {
    title: "Turn visits into bookings",
    desc: "Guide users to contact and booking actions with clean page flow and trust-building sections.",
  },
  Blog: {
    title: "Publish content consistently",
    desc: "Generate structured blog-ready layouts and keep your brand voice consistent across posts.",
  },
  Contact: {
    title: "Capture leads quickly",
    desc: "Collect inquiries with simple forms, clear value messaging, and direct next steps.",
  },
} as const;

type TabKey = keyof typeof tabContent;

export default function LandingTabs() {
  const [activeTab, setActiveTab] = useState<TabKey>("Sell");
  const content = useMemo(() => tabContent[activeTab], [activeTab]);

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-white">Everything you need to grow online.</h2>
      <div className="mt-5 flex flex-wrap gap-2">
        {(Object.keys(tabContent) as TabKey[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
              activeTab === tab ? "bg-white text-slate-900" : "border border-white/20 text-white/80 hover:border-white/40"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1326] p-6">
        <div key={activeTab} className="grid gap-5 md:grid-cols-[1.2fr_0.8fr] animate-[fadein_.35s_ease]">
          <div>
            <h3 className="text-xl font-semibold text-white">{content.title}</h3>
            <p className="mt-2 text-sm text-white/65">{content.desc}</p>
          </div>
          <div className="h-28 rounded-xl border border-white/10 bg-gradient-to-br from-cyan-400/20 via-indigo-500/20 to-fuchsia-500/20" />
        </div>
      </div>
      <style jsx>{`
        @keyframes fadein {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
