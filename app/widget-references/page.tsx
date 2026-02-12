import { Suspense } from "react";
import WidgetReferencesClient from "@/app/widget-references/WidgetReferencesClient";

export default function WidgetReferencesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white p-10">Loading...</div>}>
      <WidgetReferencesClient />
    </Suspense>
  );
}
