import { Theme } from "@/lib/schema";
import EditableText from "@/components/EditableText";

type TeamProps = {
  variant: string;
  props: {
    title: string;
    members: { name: string; role: string; bio: string }[];
  };
  theme: Theme;
  editable?: boolean;
  onEdit?: (path: string, value: any) => void;
};

export default function Team({ props, editable, onEdit }: TeamProps) {
  const textStyles = (props as any)._textStyles || {};
  const styleFor = (path: string) => textStyles[path];
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        {editable && onEdit ? (
          <EditableText
            as="h2"
            className="text-3xl font-semibold text-slate-900"
            value={props.title}
            onChange={(value) => onEdit("title", value)}
            responsiveStyle={styleFor("title")}
          />
        ) : (
          <h2 className="text-3xl font-semibold text-slate-900">{props.title}</h2>
        )}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {props.members.map((member, index) => (
            <div
              key={`${member.name}-${index}`}
              className="rounded-[28px] border border-slate-200 bg-white p-6"
            >
              <div className="h-12 w-12 rounded-full bg-[color:var(--primary)]/20" />
              {editable && onEdit ? (
                <EditableText
                  as="h3"
                  className="mt-4 text-lg font-semibold text-slate-900"
                  value={member.name}
                  onChange={(value) => {
                    const next = [...props.members];
                    next[index] = { ...next[index], name: value };
                    onEdit("members", next);
                  }}
                  responsiveStyle={styleFor("members")}
                />
              ) : (
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{member.name}</h3>
              )}
              {editable && onEdit ? (
                <EditableText
                  as="p"
                  className="text-sm text-slate-500"
                  value={member.role}
                  onChange={(value) => {
                    const next = [...props.members];
                    next[index] = { ...next[index], role: value };
                    onEdit("members", next);
                  }}
                  responsiveStyle={styleFor("members")}
                />
              ) : (
                <p className="text-sm text-slate-500">{member.role}</p>
              )}
              {editable && onEdit ? (
                <EditableText
                  as="p"
                  className="mt-3 text-sm text-slate-600"
                  value={member.bio}
                  onChange={(value) => {
                    const next = [...props.members];
                    next[index] = { ...next[index], bio: value };
                    onEdit("members", next);
                  }}
                  responsiveStyle={styleFor("members")}
                />
              ) : (
                <p className="mt-3 text-sm text-slate-600">{member.bio}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
