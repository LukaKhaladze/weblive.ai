"use client";

import { useState } from "react";

const items = [
  {
    question: "How is Weblive.ai different from website builders?",
    answer: "Weblive.ai is generation-first: it creates structured page plans and editable sections from your business input.",
  },
  {
    question: "Can I edit generated sections after creation?",
    answer: "Yes. You can edit text, images, order, and styling in the live editor after generation.",
  },
  {
    question: "Do I need to know design or code?",
    answer: "No. The default flow is built for non-technical users, with editable controls for advanced users.",
  },
  {
    question: "Can I share drafts with teammates?",
    answer: "Yes. Each project supports temporary share links so you can collect feedback quickly.",
  },
  {
    question: "Is the generated website SEO-ready?",
    answer: "Yes. Titles, descriptions, keywords, and SEO recommendations are included in the output.",
  },
  {
    question: "Can I regenerate a different direction?",
    answer: "Yes. You can regenerate layouts and content variants while keeping your business context.",
  },
];

export default function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-white">FAQ</h2>
      <div className="mt-5 space-y-3">
        {items.map((item, index) => {
          const open = openIndex === index;
          return (
            <article key={item.question} className="rounded-xl border border-white/10 bg-[#0a1224]">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                onClick={() => setOpenIndex(open ? null : index)}
                aria-expanded={open}
                aria-controls={`faq-panel-${index}`}
              >
                <span>{item.question}</span>
                <span className="text-white/60">{open ? "−" : "+"}</span>
              </button>
              <div
                id={`faq-panel-${index}`}
                className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              >
                <div className="overflow-hidden">
                  <p className="px-4 pb-4 text-sm text-white/65">{item.answer}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
