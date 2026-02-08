const rules = [
  "ჰედერები არ იყენებს ბურგერ მენიუს. მენიუ არის ხილული ან დამალული მობილურზე.",
  "ჰედერში ყოველთვის არის ლოგო, ნავიგაცია და CTA ღილაკი.",
  "CTA ტექსტი ქართულად არის მოკლე და ქმედებაზე ორიენტირებული.",
  "სიგანე: მაქს. 1200px კონტეინერი, სიმაღლე 72-96px დიაპაზონში.",
  "ჰედერის ვარიანტები უნდა იყოს მკვეთრად განსხვავებული (განლაგება/ფონი/საბჭოთა).",
  "არ გამოიყენოთ მენიუს ჩამოშლა ან overlay მობილურზე.",
];

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">Weblive.ai</p>
        <h1 className="mt-3 text-3xl font-semibold">ჰედერის შაბლონების წესები</h1>
        <p className="mt-2 text-sm text-white/60">
          ეს გვერდი დროებითია და მხოლოდ შიდა გამოყენებისთვის.
        </p>
        <ul className="mt-8 space-y-3 text-sm text-white/80">
          {rules.map((item) => (
            <li key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
