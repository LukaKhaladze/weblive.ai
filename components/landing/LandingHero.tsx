import Link from "next/link";

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
    <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#070b16] px-6 py-6 shadow-[0_0_80px_rgba(59,130,246,0.12)] md:px-10 md:py-10">
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-52 -right-44 h-[28rem] w-[28rem] rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="relative z-10">
        <nav className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.35em] text-white/80">
            Weblive.ai
          </Link>
          <div className="flex items-center gap-2">
            {socialLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                aria-label={item.name}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                {item.icon}
              </a>
            ))}
            <Link
              href="#email-capture"
              className="ml-1 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              Get Early Access
            </Link>
          </div>
        </nav>

        <div className="mt-16 text-center md:mt-20">
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">Idea to website</p>
          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl">
            <span className="block animate-[lift_8s_ease-in-out_infinite]">Generate it.</span>
            <span className="block animate-[lift_8s_ease-in-out_1.6s_infinite] text-white/85">customize it.</span>
            <span className="block animate-[lift_8s_ease-in-out_3.2s_infinite] text-white/70">launch it.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-white/65">
            Build your first production-ready website in minutes, then keep refining every section in a live editor.
          </p>
          <Link
            href="#email-capture"
            className="mt-8 inline-flex rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            Join the Waitlist
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
