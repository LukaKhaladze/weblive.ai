import { Theme } from "@/lib/schema";

type TeamProps = {
  variant: string;
  props: {
    title: string;
    members: { name: string; role: string; bio: string }[];
  };
  theme: Theme;
};

export default function Team({ props }: TeamProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold text-slate-900">{props.title}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {props.members.map((member) => (
            <div key={member.name} className="rounded-[28px] border border-slate-200 bg-white p-6">
              <div className="h-12 w-12 rounded-full bg-[color:var(--primary)]/20" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{member.name}</h3>
              <p className="text-sm text-slate-500">{member.role}</p>
              <p className="mt-3 text-sm text-slate-600">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
