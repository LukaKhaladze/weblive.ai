import { Theme } from "@/lib/schema";

type ContactProps = {
  variant: string;
  props: {
    title: string;
    phone: string;
    email: string;
    address: string;
    hours: string;
  };
  theme: Theme;
};

export default function Contact({ variant, props }: ContactProps) {
  const centered = variant === "centered";
  return (
    <section id="contact" className="px-6 py-16">
      <div
        className={`mx-auto max-w-6xl rounded-[36px] border border-slate-200 bg-white p-10 shadow-sm ${
          centered ? "text-center" : ""
        }`}
      >
        <h2 className="text-3xl font-semibold text-slate-900">{props.title}</h2>
        <div
          className={`mt-8 grid gap-6 text-sm text-slate-600 ${
            centered ? "md:grid-cols-2" : "md:grid-cols-4"
          }`}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Phone</p>
            <p className="mt-2 font-semibold text-slate-900">{props.phone}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Email</p>
            <p className="mt-2 font-semibold text-slate-900">{props.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Address</p>
            <p className="mt-2 font-semibold text-slate-900">{props.address}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Hours</p>
            <p className="mt-2 font-semibold text-slate-900">{props.hours}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
