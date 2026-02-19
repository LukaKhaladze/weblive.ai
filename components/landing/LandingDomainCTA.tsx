export default function LandingDomainCTA() {
  return (
    <section className="rounded-[28px] border border-cyan-300/20 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-white">Find the perfect domain</h2>
      <p className="mt-2 text-sm text-white/65">
        Secure your brand identity and get your business online with a domain that matches your product.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
          Secure Your Own Domain Today
        </button>
        <button className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
          Already Have One? Transfer Your Domain
        </button>
      </div>
    </section>
  );
}
