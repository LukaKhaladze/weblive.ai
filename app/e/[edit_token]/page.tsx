import EditorShell from "@/components/editor/EditorShell";
import { fetchProjectByEditToken } from "@/lib/projects";

export default async function EditPage({ params }: { params: { edit_token: string } }) {
  const project = await fetchProjectByEditToken(params.edit_token);
  if (!project) {
    return (
      <div className="min-h-screen bg-primary text-[#F8FAFC] flex items-center justify-center">
        <p>Project not found.</p>
      </div>
    );
  }

  const expired = new Date(project.expires_at).getTime() < Date.now();
  if (expired) {
    return (
      <div className="min-h-screen bg-primary text-[#F8FAFC] flex items-center justify-center">
        <div className="surface-card rounded-[28px] p-8 text-center">
          <h1 className="text-2xl font-semibold">Link expired</h1>
          <p className="mt-2 text-sm text-muted">Create a new project to get a fresh link.</p>
          <a className="btn-primary mt-4 inline-flex px-4 py-2 text-sm font-semibold" href="/">
            Start over
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
