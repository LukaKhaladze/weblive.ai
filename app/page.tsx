import Link from "next/link";
import LandingHero from "@/components/landing/LandingHero";
import LandingEmailCapture from "@/components/landing/LandingEmailCapture";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingHowItWorks from "@/components/landing/LandingHowItWorks";
import LandingDomainCTA from "@/components/landing/LandingDomainCTA";
import LandingTabs from "@/components/landing/LandingTabs";
import LandingBrandSection from "@/components/landing/LandingBrandSection";
import LandingIntelligence from "@/components/landing/LandingIntelligence";
import LandingFAQ from "@/components/landing/LandingFAQ";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#040816] text-white">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 md:space-y-10 md:py-12">
        <LandingHero />
        <LandingEmailCapture />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingDomainCTA />
        <LandingTabs />
        <LandingBrandSection />
        <LandingIntelligence />
        <LandingFAQ />

        <footer className="rounded-[24px] border border-white/10 bg-white/[0.03] px-6 py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/70">Weblive.ai</p>
              <p className="mt-2 text-sm text-white/60">AI website generation with editable, launch-ready sections.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/build"
                className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                Start Building
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
