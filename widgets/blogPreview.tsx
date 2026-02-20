import { Theme } from "@/lib/schema";
import EditableText from "@/components/EditableText";

type BlogPreviewProps = {
  variant: string;
  props: {
    title: string;
    posts: { title: string; date: string; excerpt: string }[];
  };
  theme: Theme;
  editable?: boolean;
  onEdit?: (path: string, value: any) => void;
};

export default function BlogPreview({ props, editable, onEdit }: BlogPreviewProps) {
  const textStyles = (props as any)._textStyles || {};
  const styleFor = (path: string) => textStyles[path];
  const posts = Array.isArray(props.posts) ? props.posts : [];
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
          {posts.map((post, index) => (
            <article
              key={`${post.title}-${index}`}
              className="rounded-[28px] border border-slate-200 bg-white p-6"
            >
              {editable && onEdit ? (
                <EditableText
                  as="p"
                  className="text-xs uppercase tracking-[0.3em] text-slate-400"
                  value={post.date}
                  onChange={(value) => {
                    const next = [...props.posts];
                    next[index] = { ...next[index], date: value };
                    onEdit("posts", next);
                  }}
                  responsiveStyle={styleFor("posts")}
                />
              ) : (
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{post.date}</p>
              )}
              {editable && onEdit ? (
                <EditableText
                  as="h3"
                  className="mt-3 text-lg font-semibold text-slate-900"
                  value={post.title}
                  onChange={(value) => {
                    const next = [...props.posts];
                    next[index] = { ...next[index], title: value };
                    onEdit("posts", next);
                  }}
                  responsiveStyle={styleFor("posts")}
                />
              ) : (
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{post.title}</h3>
              )}
              {editable && onEdit ? (
                <EditableText
                  as="p"
                  className="mt-2 text-sm text-slate-600"
                  value={post.excerpt}
                  onChange={(value) => {
                    const next = [...props.posts];
                    next[index] = { ...next[index], excerpt: value };
                    onEdit("posts", next);
                  }}
                  responsiveStyle={styleFor("posts")}
                />
              ) : (
                <p className="mt-2 text-sm text-slate-600">{post.excerpt}</p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
