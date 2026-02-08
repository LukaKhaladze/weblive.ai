import Link from "next/link";

export default function HomePage() {
  const steps = [
    { title: "ბიზნესის დასახელება", desc: "დაასახელე შენი ბიზნესი ან ბრენდი." },
    { title: "კატეგორია", desc: "აირჩიე სფერო: ელ-კომერცია ან საინფორმაციო." },
    { title: "აღწერა", desc: "მოკლედ აღწერე რას აკეთებ." },
    { title: "მთავარი მიზანი", desc: "ლიდები, გაყიდვები, ზარები ან ვიზიტები." },
    { title: "ლოგო და ფერები", desc: "ატვირთე ლოგო და შეარჩიე ფერები." },
    { title: "კონტაქტი", desc: "დაამატე ტელეფონი, მისამართი და ელფოსტა." },
  ];

  return (
    <div className="min-h-screen bg-[#070B14] text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Weblive.ai</p>
            <h1 className="text-3xl font-semibold">AI ვებსაიტის გენერატორი</h1>
            <p className="mt-2 text-sm text-white/60">
              შექმენი პროფესიონალური საიტი რამდენიმე ნაბიჯში.
            </p>
          </div>
          <Link
            href="/build"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900"
          >
            დაწყება
          </Link>
        </header>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-white/10 bg-[#0C1220] p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                შექმნის ნაბიჯები
              </p>
              <span className="text-xs text-white/50">6 ნაბიჯი</span>
            </div>
            <div className="mt-6 grid gap-4">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-[20px] border border-white/10 bg-[#0B1120] px-4 py-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        {index + 1}. {step.title}
                      </p>
                      <p className="mt-1 text-xs text-white/60">{step.desc}</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] text-white/60">
                      ეტაპი {index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-3">
              <Link
                href="/build"
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900"
              >
                გენერაცია
              </Link>
              <span className="text-xs text-white/50">
                საშუალოდ 2-3 წუთი
              </span>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#0C1220] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">პრევიუ</p>
            <div className="mt-4 rounded-[22px] bg-white p-4 text-slate-900">
              <div className="flex items-center justify-between rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold">
                <span>Weblive.ai</span>
                <span>მთავარი</span>
                <span>პროდუქტები</span>
                <span>კონტაქტი</span>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-white">
                  დაწყება
                </span>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_1fr]">
                <div className="rounded-[18px] bg-slate-100 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    შენი ბიზნესის გმირი
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    AI ქმნის დიზაინს და სტრუქტურას
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    ტექსტი, CTA და სექციები ავტომატურად მზადდება.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <button className="rounded-full bg-slate-900 px-3 py-1 text-xs text-white">
                      დაწყება
                    </button>
                    <button className="rounded-full border border-slate-200 px-3 py-1 text-xs">
                      გაიგე მეტი
                    </button>
                  </div>
                </div>
                <div className="rounded-[18px] bg-slate-100 p-4">
                  <div className="h-32 w-full rounded-[14px] bg-gradient-to-br from-slate-200 to-slate-300" />
                  <p className="mt-3 text-xs text-slate-500">გალერიის პრევიუ</p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs text-white/50">
              ფორმის ნაცვლად — ნაბიჯების მართვადი პროცესი.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
