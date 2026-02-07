import { Theme } from "@/lib/schema";

type BlogPreviewProps = {
  variant: string;
  props: {
    title: string;
    posts: { title: string; date: string; excerpt: string }[];
  };
  theme: Theme;
};

export default function BlogPreview({ props }: BlogPreviewProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold text-slate-900">{props.title}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {props.posts.map((post) => (
            <article key={post.title} className="rounded-[28px] border border-slate-200 bg-white p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{post.date}</p>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">{post.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
