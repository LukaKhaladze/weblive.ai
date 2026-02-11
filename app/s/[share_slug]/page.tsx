import PreviewRenderer from "@/components/PreviewRenderer";
import { fetchProjectByShareSlug } from "@/lib/projects";
import { applyShareLinks } from "@/lib/shareLinks";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SharePage({ params }: { params: { share_slug: string } }) {
  const project = await fetchProjectByShareSlug(params.share_slug);

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>პროექტი ვერ მოიძებნა.</p>
      </div>
    );
  }

  const expired = new Date(project.expires_at).getTime() < Date.now();
  if (expired) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="rounded-[28px] border border-white/10 bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-semibold">ბმულის ვადა ამოიწურა</h1>
          <p className="mt-2 text-sm text-white/70">ახალი ბმულის მისაღებად შექმენი ახალი პროექტი.</p>
          <a className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900" href="/">
            ახალი პროექტის დაწყება
          </a>
        </div>
      </div>
    );
  }

  const expiresAt = new Date(project.expires_at).toLocaleDateString("ka-GE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const site = applyShareLinks(project.site, params.share_slug);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white/80 px-6 py-4 text-center text-sm text-slate-600">
        გენერირებულია Weblive.ai-ის მიერ (ვადა: {expiresAt}).
      </div>
      <div className="mx-auto max-w-6xl px-6 py-8">
        <PreviewRenderer site={site} />
      </div>
    </div>
  );
}
