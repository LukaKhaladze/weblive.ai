import EditableText from "@/components/EditableText";
import { WidgetComponentProps } from "@/lib/widgetTypes";

const lineStyle = "text-sm text-ink/70";

function getArray<T>(value: unknown, fallback: T[]): T[] {
  if (Array.isArray(value)) return value as T[];
  return fallback;
}

function getString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function HeaderMinimal({ props, theme, onPropChange }: WidgetComponentProps) {
  const links = getArray<string>(props.links, []);
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-white px-6 py-4">
      <div className="flex items-center gap-3">
        {theme.logoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={theme.logoDataUrl} alt="Logo" className="h-9 w-9 rounded-lg object-cover" />
        ) : (
          <div className="h-9 w-9 rounded-lg border border-dashed border-ink/30 text-[10px] flex items-center justify-center text-ink/40">
            Logo
          </div>
        )}
        <EditableText
          as="span"
          className="text-lg font-semibold"
          value={getString(props.brand)}
          onChange={(value) => onPropChange("brand", value)}
          placeholder="Brand"
        />
      </div>
      <nav className="flex items-center gap-4 text-sm text-ink/70">
        {links.map((link, index) => (
          <EditableText
            key={index}
            as="span"
            className="hover:text-ink"
            value={link}
            onChange={(value) => {
              const next = [...links];
              next[index] = value;
              onPropChange("links", next);
            }}
            placeholder="Link"
          />
        ))}
      </nav>
    </header>
  );
}

export function HeaderCentered({ props, theme, onPropChange }: WidgetComponentProps) {
  const links = getArray<string>(props.links, []);
  return (
    <header className="rounded-2xl border border-ink/10 bg-white px-6 py-6 text-center space-y-3">
      {theme.logoDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={theme.logoDataUrl} alt="Logo" className="mx-auto h-10 w-10 rounded-lg object-cover" />
      ) : (
        <div className="mx-auto h-10 w-10 rounded-lg border border-dashed border-ink/30 text-[10px] flex items-center justify-center text-ink/40">
          Logo
        </div>
      )}
      <EditableText
        as="h3"
        className="text-lg font-semibold"
        value={getString(props.brand)}
        onChange={(value) => onPropChange("brand", value)}
        placeholder="Brand"
      />
      <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-ink/70">
        {links.map((link, index) => (
          <EditableText
            key={index}
            as="span"
            className="hover:text-ink"
            value={link}
            onChange={(value) => {
              const next = [...links];
              next[index] = value;
              onPropChange("links", next);
            }}
            placeholder="Link"
          />
        ))}
      </nav>
    </header>
  );
}

export function HeroSplitImageRight({ props, theme, onPropChange }: WidgetComponentProps) {
  return (
    <section className="grid gap-8 rounded-3xl border border-ink/10 bg-white p-8 md:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <EditableText
          as="h2"
          className="text-3xl font-semibold"
          value={getString(props.headline)}
          onChange={(value) => onPropChange("headline", value)}
          placeholder="Headline"
        />
        <EditableText
          as="p"
          className={lineStyle}
          value={getString(props.subheadline)}
          onChange={(value) => onPropChange("subheadline", value)}
          placeholder="Subheadline"
        />
        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-full px-5 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <EditableText
              as="span"
              className="text-white"
              value={getString(props.ctaLabel)}
              onChange={(value) => onPropChange("ctaLabel", value)}
              placeholder="CTA"
            />
          </button>
          <button
            className="rounded-full border px-5 py-2 text-sm font-medium"
            style={{ borderColor: theme.secondaryColor, color: theme.secondaryColor }}
          >
            <EditableText
              as="span"
              className="text-sm"
              value={getString(props.ctaSecondaryLabel ?? "დაგვიკავშირდით")}
              onChange={(value) => onPropChange("ctaSecondaryLabel", value)}
              placeholder="Secondary CTA"
            />
          </button>
        </div>
      </div>
      <div className="rounded-2xl border border-dashed border-ink/30 bg-ink/5 flex items-center justify-center text-xs text-ink/50">
        <EditableText
          as="span"
          className="text-xs text-ink/50"
          value={getString(props.imageHint, "სურათის იდეა")}
          onChange={(value) => onPropChange("imageHint", value)}
          placeholder="Image hint"
        />
      </div>
    </section>
  );
}

export function HeroCenteredOverlay({ props, theme, onPropChange }: WidgetComponentProps) {
  return (
    <section className="rounded-3xl border border-ink/10 bg-white p-10 text-center space-y-4">
      <EditableText
        as="h2"
        className="text-3xl font-semibold"
        value={getString(props.headline)}
        onChange={(value) => onPropChange("headline", value)}
        placeholder="Headline"
      />
      <EditableText
        as="p"
        className="text-sm text-ink/70"
        value={getString(props.subheadline)}
        onChange={(value) => onPropChange("subheadline", value)}
        placeholder="Subheadline"
      />
      <button
        className="mx-auto rounded-full px-6 py-2 text-sm font-medium text-white"
        style={{ backgroundColor: theme.primaryColor }}
      >
        <EditableText
          as="span"
          className="text-white"
          value={getString(props.ctaLabel)}
          onChange={(value) => onPropChange("ctaLabel", value)}
          placeholder="CTA"
        />
      </button>
    </section>
  );
}

export function TrustBadgesRow({ props, theme, onPropChange }: WidgetComponentProps) {
  const badges = getArray<string>(props.badges, []);
  return (
    <section className="rounded-2xl border border-ink/10 bg-white px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-ink/60">
        {badges.map((badge, index) => (
          <span key={index} className="rounded-full border px-3 py-1" style={{ borderColor: theme.secondaryColor }}>
            <EditableText
              as="span"
              className="text-xs"
              value={badge}
              onChange={(value) => {
                const next = [...badges];
                next[index] = value;
                onPropChange("badges", next);
              }}
              placeholder="Badge"
            />
          </span>
        ))}
      </div>
    </section>
  );
}

export function TrustBadgesPill({ props, theme, onPropChange }: WidgetComponentProps) {
  const badges = getArray<string>(props.badges, []);
  return (
    <section className="rounded-2xl border border-ink/10 bg-white px-6 py-4">
      <div className="flex flex-wrap items-center gap-3">
        {badges.map((badge, index) => (
          <span
            key={index}
            className="rounded-full px-4 py-2 text-xs text-white"
            style={{ backgroundColor: theme.secondaryColor }}
          >
            <EditableText
              as="span"
              className="text-xs text-white"
              value={badge}
              onChange={(value) => {
                const next = [...badges];
                next[index] = value;
                onPropChange("badges", next);
              }}
              placeholder="Badge"
            />
          </span>
        ))}
      </div>
    </section>
  );
}

export function AboutTextImage({ props, onPropChange }: WidgetComponentProps) {
  return (
    <section className="grid gap-6 rounded-3xl border border-ink/10 bg-white p-8 md:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-3">
        <EditableText
          as="h3"
          className="text-2xl font-semibold"
          value={getString(props.title)}
          onChange={(value) => onPropChange("title", value)}
          placeholder="Title"
        />
        <EditableText
          as="p"
          className="text-sm text-ink/70"
          value={getString(props.body)}
          onChange={(value) => onPropChange("body", value)}
          placeholder="Body"
        />
      </div>
      <div className="rounded-2xl border border-dashed border-ink/30 bg-ink/5 flex items-center justify-center text-xs text-ink/50">
        <EditableText
          as="span"
          className="text-xs text-ink/50"
          value={getString(props.imageHint, "სურათის იდეა")}
          onChange={(value) => onPropChange("imageHint", value)}
          placeholder="Image hint"
        />
      </div>
    </section>
  );
}

export function AboutTextOnly({ props, onPropChange }: WidgetComponentProps) {
  return (
    <section className="rounded-3xl border border-ink/10 bg-white p-8 space-y-3">
      <EditableText
        as="h3"
        className="text-2xl font-semibold"
        value={getString(props.title)}
        onChange={(value) => onPropChange("title", value)}
        placeholder="Title"
      />
      <EditableText
        as="p"
        className="text-sm text-ink/70"
        value={getString(props.body)}
        onChange={(value) => onPropChange("body", value)}
        placeholder="Body"
      />
    </section>
  );
}

export function ServicesCards3({ props, theme, onPropChange }: WidgetComponentProps) {
  const services = getArray<{ title?: string; description?: string }>(props.services, []);
  return (
    <section className="rounded-3xl border border-ink/10 bg-white p-8 space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {services.slice(0, 3).map((service, index) => (
          <div key={index} className="rounded-2xl border border-ink/10 p-4 shadow-soft">
            <div className="h-8 w-8 rounded-full" style={{ backgroundColor: theme.secondaryColor }} />
            <EditableText
              as="h3"
              className="mt-3 text-base font-semibold"
              value={getString(service.title)}
              onChange={(value) => {
                const next = [...services];
                next[index] = { ...next[index], title: value };
                onPropChange("services", next);
              }}
              placeholder="Service"
            />
            <EditableText
              as="p"
              className="text-xs text-ink/60"
              value={getString(service.description)}
              onChange={(value) => {
                const next = [...services];
                next[index] = { ...next[index], description: value };
                onPropChange("services", next);
              }}
              placeholder="Description"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ServicesCards6({ props, theme, onPropChange }: WidgetComponentProps) {
  const services = getArray<{ title?: string; description?: string }>(props.services, []);
  return (
    <section className="rounded-3xl border border-ink/10 bg-white p-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.slice(0, 6).map((service, index) => (
          <div key={index} className="rounded-2xl border border-ink/10 p-4">
            <div className="h-6 w-6 rounded-full" style={{ backgroundColor: theme.secondaryColor }} />
            <EditableText
              as="h3"
              className="mt-3 text-sm font-semibold"
              value={getString(service.title)}
              onChange={(value) => {
                const next = [...services];
                next[index] = { ...next[index], title: value };
                onPropChange("services", next);
              }}
              placeholder="Service"
            />
            <EditableText
              as="p"
              className="text-xs text-ink/60"
              value={getString(service.description)}
              onChange={(value) => {
                const next = [...services];
                next[index] = { ...next[index], description: value };
                onPropChange("services", next);
              }}
              placeholder="Description"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ServicesIconRow({ props, theme, onPropChange }: WidgetComponentProps) {
  const items = getArray<string>(props.items, []);
  return (
    <section className="rounded-3xl border border-ink/10 bg-white px-8 py-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-3 text-sm">
            <div className="h-8 w-8 rounded-full" style={{ backgroundColor: theme.secondaryColor }} />
            <EditableText
              as="span"
              className="text-sm font-medium"
              value={item}
              onChange={(value) => {
                const next = [...items];
                next[index] = value;
                onPropChange("items", next);
              }}
              placeholder="Item"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function WhyUsCards({ props, theme, onPropChange }: WidgetComponentProps) {
  const benefits = getArray<{ title?: string; description?: string }>(props.benefits, []);
  return (
    <section className="rounded-3xl border border-ink/10 bg-white p-8">
      <div className="grid gap-4 md:grid-cols-3">
        {benefits.slice(0, 3).map((benefit, index) => (
          <div key={index} className="rounded-2xl border border-ink/10 p-4">
            <div className="h-7 w-7 rounded-full" style={{ backgroundColor: theme.secondaryColor }} />
            <EditableText
              as="h3"
              className="mt-3 text-sm font-semibold"
              value={getString(benefit.title)}
              onChange={(value) => {
                const next = [...benefits];
                next[index] = { ...next[index], title: value };
                onPropChange("benefits", next);
              }}
              placeholder="Benefit"
            />
            <EditableText
              as="p"
              className="text-xs text-ink/60"
              value={getString(benefit.description)}
              onChange={(value) => {
                const next = [...benefits];
                next[index] = { ...next[index], description: value };
                onPropChange("benefits", next);
              }}
              placeholder="Description"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function StatsNumbersRow({ props, theme, onPropChange }: WidgetComponentProps) {
  const stats = getArray<{ value?: string; label?: string }>(props.stats, []);
  return (
    <section className="rounded-3xl border border-ink/10 bg-white px-8 py-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat, index) => (
          <div key={index} className="rounded-2xl border border-ink/10 px-4 py-3">
            <EditableText
              as="h3"
              className="text-xl font-semibold"
              value={getString(stat.value)}
              onChange={(value) => {
                const next = [...stats];
                next[index] = { ...next[index], value };
                onPropChange("stats", next);
              }}
              placeholder="0"
            />
            <EditableText
              as="p"
              className="text-xs text-ink/60"
              value={getString(stat.label)}
              onChange={(value) => {
                const next = [...stats];
                next[index] = { ...next[index], label: value };
                onPropChange("stats", next);
              }}
              placeholder="Label"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function TestimonialsCards({ props, onPropChange }: WidgetComponentProps) {
  const testimonials = getArray<{ name?: string; quote?: string }>(props.testimonials, []);
  return (
    <section className="rounded-3xl border border-ink/10 bg-white p-8">
      <div className="grid gap-4 md:grid-cols-3">
        {testimonials.slice(0, 3).map((item, index) => (
          <div key={index} className="rounded-2xl border border-ink/10 p-4">
            <EditableText
              as="p"
              className="text-sm text-ink/70"
              value={getString(item.quote)}
              onChange={(value) => {
                const next = [...testimonials];
                next[index] = { ...next[index], quote: value };
                onPropChange("testimonials", next);
              }}
              placeholder="Quote"
            />
            <EditableText
              as="span"
              className="mt-3 block text-xs font-medium text-ink/60"
              value={getString(item.name)}
              onChange={(value) => {
                const next = [...testimonials];
                next[index] = { ...next[index], name: value };
                onPropChange("testimonials", next);
              }}
              placeholder="Name"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function TestimonialsSlider({ props, theme, onPropChange }: WidgetComponentProps) {
  const testimonials = getArray<{ name?: string; quote?: string }>(props.testimonials, []);
  return (
    <section className="rounded-3xl border border-ink/10 bg-white p-8">
      <div className="flex flex-wrap gap-4">
        {testimonials.slice(0, 3).map((item, index) => (
          <div key={index} className="min-w-[220px] flex-1 rounded-2xl border border-ink/10 p-4">
            <div className="h-1 w-10 rounded-full" style={{ backgroundColor: theme.secondaryColor }} />
            <EditableText
              as="p"
              className="mt-3 text-sm text-ink/70"
              value={getString(item.quote)}
              onChange={(value) => {
                const next = [...testimonials];
                next[index] = { ...next[index], quote: value };
                onPropChange("testimonials", next);
              }}
              placeholder="Quote"
            />
            <EditableText
              as="span"
              className="mt-3 block text-xs font-medium text-ink/60"
              value={getString(item.name)}
              onChange={(value) => {
                const next = [...testimonials];
                next[index] = { ...next[index], name: value };
                onPropChange("testimonials", next);
              }}
              placeholder="Name"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function PricingPlans({ props, theme, onPropChange }: WidgetComponentProps) {
  const plans = getArray<{ name?: string; price?: string; features?: string[] }>(props.plans, []);
  const planCtaLabel = getString(props.planCtaLabel, "აირჩიე");
  return (
    <section className="rounded-3xl border border-ink/10 bg-white p-8">
      <div className="grid gap-4 md:grid-cols-3">
        {plans.slice(0, 3).map((plan, index) => (
          <div key={index} className="rounded-2xl border border-ink/10 p-4">
            <EditableText
              as="h3"
              className="text-base font-semibold"
              value={getString(plan.name)}
              onChange={(value) => {
                const next = [...plans];
                next[index] = { ...next[index], name: value };
                onPropChange("plans", next);
              }}
              placeholder="Plan"
            />
            <EditableText
              as="p"
              className="text-xl font-semibold"
              value={getString(plan.price)}
              onChange={(value) => {
                const next = [...plans];
                next[index] = { ...next[index], price: value };
                onPropChange("plans", next);
              }}
              placeholder="Price"
            />
            <ul className="mt-3 space-y-1 text-xs text-ink/60">
              {getArray<string>(plan.features, []).map((feature, featureIndex) => (
                <li key={featureIndex}>
                  <EditableText
                    as="span"
                    className="text-xs"
                    value={feature}
                    onChange={(value) => {
                      const next = [...plans];
                      const features = [...getArray<string>(next[index]?.features, [])];
                      features[featureIndex] = value;
                      next[index] = { ...next[index], features };
                      onPropChange("plans", next);
                    }}
                    placeholder="Feature"
                  />
                </li>
              ))}
            </ul>
            <button
              className="mt-4 rounded-full px-4 py-2 text-xs font-medium text-white"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <EditableText
                as="span"
                className="text-xs text-white"
                value={planCtaLabel}
                onChange={(value) => onPropChange("planCtaLabel", value)}
                placeholder="CTA"
              />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FAQAccordion({ props, theme, onPropChange }: WidgetComponentProps) {
  const faq = getArray<{ question?: string; answer?: string }>(props.faq, []);
  return (
    <section className="rounded-3xl border border-ink/10 bg-white p-8">
      <div className="space-y-3">
        {faq.map((item, index) => (
          <div key={index} className="rounded-xl border border-ink/10 px-4 py-3">
            <EditableText
              as="h3"
              className="text-sm font-semibold"
              value={getString(item.question)}
              onChange={(value) => {
                const next = [...faq];
                next[index] = { ...next[index], question: value };
                onPropChange("faq", next);
              }}
              placeholder="Question"
            />
            <EditableText
              as="p"
              className="text-xs text-ink/60"
              value={getString(item.answer)}
              onChange={(value) => {
                const next = [...faq];
                next[index] = { ...next[index], answer: value };
                onPropChange("faq", next);
              }}
              placeholder="Answer"
            />
            <div className="mt-2 h-1 w-12 rounded-full" style={{ backgroundColor: theme.secondaryColor }} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function CTABannerSplit({ props, theme, onPropChange }: WidgetComponentProps) {
  return (
    <section className="rounded-3xl px-8 py-6 text-white" style={{ backgroundColor: theme.primaryColor }}>
      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <EditableText
            as="h3"
            className="text-2xl font-semibold text-white"
            value={getString(props.headline)}
            onChange={(value) => onPropChange("headline", value)}
            placeholder="Headline"
          />
          <EditableText
            as="p"
            className="text-sm text-white/80"
            value={getString(props.subheadline)}
            onChange={(value) => onPropChange("subheadline", value)}
            placeholder="Subheadline"
          />
        </div>
        <div className="flex items-center">
          <button
            className="rounded-full bg-white px-5 py-2 text-sm font-medium"
            style={{ color: theme.primaryColor }}
          >
            <EditableText
              as="span"
              className="text-sm"
              value={getString(props.ctaLabel)}
              onChange={(value) => onPropChange("ctaLabel", value)}
              placeholder="CTA"
            />
          </button>
        </div>
      </div>
    </section>
  );
}

export function CTABannerCentered({ props, theme, onPropChange }: WidgetComponentProps) {
  return (
    <section
      className="rounded-3xl px-8 py-10 text-center text-white"
      style={{ backgroundColor: theme.primaryColor }}
    >
      <EditableText
        as="h3"
        className="text-2xl font-semibold text-white"
        value={getString(props.headline)}
        onChange={(value) => onPropChange("headline", value)}
        placeholder="Headline"
      />
      <button
        className="mt-4 rounded-full bg-white px-6 py-2 text-sm font-medium"
        style={{ color: theme.primaryColor }}
      >
        <EditableText
          as="span"
          className="text-sm"
          value={getString(props.ctaLabel)}
          onChange={(value) => onPropChange("ctaLabel", value)}
          placeholder="CTA"
        />
      </button>
    </section>
  );
}

export function ContactFormMap({ props, theme, onPropChange }: WidgetComponentProps) {
  const formLabels = getArray<string>(props.formLabels, ["სახელი", "ტელეფონი", "შეტყობინება"]);
  return (
    <section className="grid gap-6 rounded-3xl border border-ink/10 bg-white p-8 md:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-3">
        <EditableText
          as="h3"
          className="text-xl font-semibold"
          value={getString(props.address)}
          onChange={(value) => onPropChange("address", value)}
          placeholder="Address"
        />
        <EditableText
          as="p"
          className="text-sm text-ink/70"
          value={getString(props.phone)}
          onChange={(value) => onPropChange("phone", value)}
          placeholder="Phone"
        />
        <EditableText
          as="p"
          className="text-sm text-ink/70"
          value={getString(props.email)}
          onChange={(value) => onPropChange("email", value)}
          placeholder="Email"
        />
        <EditableText
          as="p"
          className="text-xs text-ink/60"
          value={getString(props.workingHours)}
          onChange={(value) => onPropChange("workingHours", value)}
          placeholder="Working hours"
        />
        <div className="mt-4 space-y-2 text-xs text-ink/50">
          {formLabels.map((label) => (
            <div
              key={label}
              className="rounded-lg border border-dashed border-ink/20 px-3 py-2"
            >
              {label}
            </div>
          ))}
          <button
            className="rounded-full px-5 py-2 text-xs font-medium text-white"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <EditableText
              as="span"
              className="text-white"
              value={getString(props.formCtaLabel)}
              onChange={(value) => onPropChange("formCtaLabel", value)}
              placeholder="Send"
            />
          </button>
        </div>
      </div>
      <div className="rounded-2xl border border-dashed border-ink/30 bg-ink/5 flex items-center justify-center text-xs text-ink/50">
        რუკა / მისამართი
      </div>
    </section>
  );
}

export function ContactFormOnly({ props, theme, onPropChange }: WidgetComponentProps) {
  const formLabels = getArray<string>(props.formLabels, ["სახელი", "ტელეფონი", "შეტყობინება"]);
  return (
    <section className="rounded-3xl border border-ink/10 bg-white p-8 space-y-4">
      <EditableText
        as="h3"
        className="text-xl font-semibold"
        value={getString(props.address)}
        onChange={(value) => onPropChange("address", value)}
        placeholder="Address"
      />
      <EditableText
        as="p"
        className="text-sm text-ink/70"
        value={getString(props.phone)}
        onChange={(value) => onPropChange("phone", value)}
        placeholder="Phone"
      />
      <div className="space-y-2 text-xs text-ink/50">
        {formLabels.map((label) => (
          <div
            key={label}
            className="rounded-lg border border-dashed border-ink/20 px-3 py-2"
          >
            {label}
          </div>
        ))}
        <button
          className="rounded-full px-5 py-2 text-xs font-medium text-white"
          style={{ backgroundColor: theme.primaryColor }}
        >
          <EditableText
            as="span"
            className="text-white"
            value={getString(props.formCtaLabel)}
            onChange={(value) => onPropChange("formCtaLabel", value)}
            placeholder="Send"
          />
        </button>
      </div>
    </section>
  );
}

export function FooterColumns({ props, theme, onPropChange }: WidgetComponentProps) {
  const links = getArray<string>(props.links, []);
  return (
    <footer className="rounded-3xl border border-ink/10 bg-white px-8 py-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <EditableText
          as="span"
          className="text-sm font-semibold"
          value={getString(props.brand)}
          onChange={(value) => onPropChange("brand", value)}
          placeholder="Brand"
        />
        <div className="flex flex-wrap gap-3 text-xs text-ink/60">
          {links.map((link, index) => (
            <EditableText
              key={index}
              as="span"
              className="text-xs"
              value={link}
              onChange={(value) => {
                const next = [...links];
                next[index] = value;
                onPropChange("links", next);
              }}
              placeholder="Link"
            />
          ))}
        </div>
        <div className="h-2 w-12 rounded-full" style={{ backgroundColor: theme.secondaryColor }} />
      </div>
    </footer>
  );
}

export function FooterSimple({ props, onPropChange }: WidgetComponentProps) {
  return (
    <footer className="rounded-3xl border border-ink/10 bg-white px-8 py-6 text-xs text-ink/60">
      <EditableText
        as="span"
        className="text-xs text-ink/60"
        value={getString(props.copyright)}
        onChange={(value) => onPropChange("copyright", value)}
        placeholder="Copyright"
      />
    </footer>
  );
}

export function CustomWidgetPlaceholder({ props }: WidgetComponentProps) {
  const name = getString(props.name, "Custom widget");
  const image = typeof props.imageDataUrl === "string" ? props.imageDataUrl : "";
  return (
    <section className="rounded-3xl border border-dashed border-ink/30 bg-shell/60 p-6 text-center text-sm text-ink/60 space-y-3">
      <p className="font-medium">Custom widget: {name} (placeholder)</p>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={name}
          className="mx-auto h-40 w-full max-w-md rounded-2xl object-cover border border-ink/10"
        />
      ) : (
        <div className="mx-auto h-32 w-full max-w-md rounded-2xl border border-dashed border-ink/20" />
      )}
    </section>
  );
}

export const WIDGET_COMPONENTS = {
  Header: {
    minimal: HeaderMinimal,
    centered: HeaderCentered
  },
  Hero: {
    splitImageRight: HeroSplitImageRight,
    centeredOverlay: HeroCenteredOverlay
  },
  TrustBadges: {
    row: TrustBadgesRow,
    pill: TrustBadgesPill
  },
  About: {
    textImage: AboutTextImage,
    textOnly: AboutTextOnly
  },
  Services: {
    cards3: ServicesCards3,
    cards6: ServicesCards6,
    iconRow: ServicesIconRow
  },
  WhyUs: {
    "3cards": WhyUsCards
  },
  Stats: {
    numbersRow: StatsNumbersRow
  },
  Testimonials: {
    cards: TestimonialsCards,
    sliderSimple: TestimonialsSlider
  },
  Pricing: {
    plans3: PricingPlans
  },
  FAQ: {
    accordion: FAQAccordion
  },
  CTA: {
    bannerSplit: CTABannerSplit,
    bannerCentered: CTABannerCentered
  },
  Contact: {
    formMap: ContactFormMap,
    formOnly: ContactFormOnly
  },
  Footer: {
    columns: FooterColumns,
    simple: FooterSimple
  },
  CustomWidgetPlaceholder: {
    image: CustomWidgetPlaceholder
  }
} as const;
