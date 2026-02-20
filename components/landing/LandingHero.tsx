"use client";

import Link from "next/link";
import Image from "next/image";

const socialLinks = [
  {
    name: "Discord",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 7c2.7-1 5.3-1 8 0" />
        <path d="M6.4 8.4A14.3 14.3 0 0 0 4 16c2.2 1.8 4.4 2.7 6.7 2.8l.8-1.4" />
        <path d="M17.6 8.4A14.3 14.3 0 0 1 20 16c-2.2 1.8-4.4 2.7-6.7 2.8l-.8-1.4" />
        <circle cx="9.5" cy="13" r="1" fill="currentColor" />
        <circle cx="14.5" cy="13" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M6.2 8.6a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6ZM4.8 19.2h2.8v-8H4.8v8Zm6.2 0h2.8v-4.3c0-2.6 3.2-2.8 3.2 0v4.3h2.8v-5.3c0-4.1-4.7-3.9-6-1.9v-2.1H11v9.3Z" />
      </svg>
    ),
  },
  {
    name: "X",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M4 4h4.1l4.4 5.9L17.6 4H20l-6.4 7.4L20.5 20h-4.1l-4.8-6.4L6 20H3.5l6.8-7.9L4 4Z" />
      </svg>
    ),
  },
];

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden rounded-[30px] border border-border bg-primary px-6 py-6 md:px-10 md:py-10">
      <div className="pointer-events-none absolute left-1/2 top-[28%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gradient opacity-15 blur-3xl" />
      <div className="relative z-10">
        <nav className="sticky top-0 flex flex-wrap items-center justify-between gap-4 bg-primary/90 py-2 backdrop-blur">
          <Link href="/" className="flex items-center pl-6 pr-6">
            <Image
              src="/placeholders/weblive.png"
              alt="Weblive.ai"
              width={132}
              height={34}
              className="h-auto w-[132px]"
              priority
            />
          </Link>
          <div className="flex items-center gap-2">
            {socialLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                aria-label={item.name}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition hover:bg-border hover:text-primary"
              >
                {item.icon}
              </a>
            ))}
            <Link
              href="/build?demo=tbilisi-business&autostart=1"
              className="btn-primary ml-1 px-4 py-2 text-sm font-semibold"
            >
              Start Building
            </Link>
          </div>
        </nav>

        <div className="mt-16 text-center md:mt-20">
          <p className="text-sm uppercase tracking-[0.3em] text-muted">Idea to website</p>
          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-semibold leading-tight text-[#F8FAFC] sm:text-5xl md:text-6xl">
            <span className="block animate-[lift_8s_ease-in-out_infinite]">Generate it.</span>
            <span className="block animate-[lift_8s_ease-in-out_1.6s_infinite]">customize it.</span>
            <span className="block animate-[lift_8s_ease-in-out_3.2s_infinite]">launch it.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted">
            Build your first production-ready website in minutes, then keep refining every section in a live editor.
          </p>
          <Link
            href="/build?demo=tbilisi-business&autostart=1"
            className="btn-primary mt-8 inline-flex px-6 py-3 text-sm font-semibold"
          >
            Start Building
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes lift {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </section>
  );
}
