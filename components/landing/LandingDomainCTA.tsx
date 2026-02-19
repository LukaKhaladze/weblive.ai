export default function LandingDomainCTA() {
  return (
    <section className="surface-card rounded-[28px] p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-[#F8FAFC]">Find the perfect domain</h2>
      <p className="mt-2 text-sm text-muted">
        Secure your brand identity and get your business online with a domain that matches your product.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button className="btn-primary px-5 py-3 text-sm font-semibold">
          Secure Your Own Domain Today
        </button>
        <button className="btn-secondary px-5 py-3 text-sm font-semibold">
          Already Have One? Transfer Your Domain
        </button>
      </div>
    </section>
  );
}
