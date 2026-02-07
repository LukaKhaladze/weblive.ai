import EditorShell from "@/components/editor/EditorShell";
import { fetchProjectByEditToken } from "@/lib/projects";

export default async function EditPage({ params }: { params: { edit_token: string } }) {
  const project = await fetchProjectByEditToken(params.edit_token);
  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Project not found.</p>
      </div>
    );
  }

  const expired = new Date(project.expires_at).getTime() < Date.now();
  if (expired) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="rounded-[28px] border border-white/10 bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-semibold">Link expired</h1>
          <p className="mt-2 text-sm text-white/70">Start a new project to generate a fresh link.</p>
          <a className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900" href="/">
            Start again
          </a>
        </div>
      </div>
    );
  }

  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

  return (
    <EditorShell
      project={{
        id: project.id,
        input: project.input,
        site: project.site,
        seo: project.seo,
        expires_at: project.expires_at,
        share_slug: project.share_slug,
        edit_token: project.edit_token,
      }}
      baseUrl={baseUrl}
    />
  );
}
