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
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-primary text-[#F8FAFC]">
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

        <footer className="surface-card rounded-[24px] px-6 py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="pl-6 pr-6">
                <Image src="/placeholders/weblive.png" alt="Weblive.ai" width={132} height={34} className="h-auto w-[132px]" />
              </div>
              <p className="mt-2 text-sm text-muted">AI website generation with editable, launch-ready sections.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/build?demo=tbilisi-business&autostart=1"
                className="btn-primary px-5 py-2 text-sm font-semibold"
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
