import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const form = await req.formData();
  let supabaseServer;
  try {
    supabaseServer = getSupabaseServer();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Supabase env vars missing" },
      { status: 500 }
    );
  }
  const file = form.get("file");
  const projectId = form.get("projectId");
  const type = form.get("type");

  if (!(file instanceof File) || typeof projectId !== "string" || typeof type !== "string") {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const safeType = type === "logo" ? "logo" : "images";
  const ext = file.name.split(".").pop() || "png";
  const path = `${projectId}/${safeType}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabaseServer.storage
    .from("weblive-assets")
    .upload(path, file, { contentType: file.type || "image/png" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: signed } = await supabaseServer.storage
    .from("weblive-assets")
    .createSignedUrl(path, 60 * 60 * 24 * 7);

  const signedUrl = signed?.signedUrl || "";

  if (safeType === "logo" && signedUrl) {
    const { data: existingProject } = await supabaseServer
      .from("projects")
      .select("input, site")
      .eq("id", projectId)
      .single();

    if (existingProject?.input) {
      const updatedInput = { ...existingProject.input, logoUrl: signedUrl };
      let updatedSite = existingProject.site;
      if (existingProject.site?.pages) {
        updatedSite = {
          ...existingProject.site,
          pages: existingProject.site.pages.map((page: any) => ({
            ...page,
            sections: page.sections.map((section: any) =>
              section.widget === "header"
                ? { ...section, props: { ...section.props, logo: signedUrl } }
                : section
            ),
          })),
        };
      }

      await supabaseServer
        .from("projects")
        .update({
          input: updatedInput,
          site: updatedSite,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);
    }
  }

  return NextResponse.json({ path, url: signedUrl });
}
