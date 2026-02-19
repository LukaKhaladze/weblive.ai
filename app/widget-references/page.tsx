import { Suspense } from "react";
import WidgetReferencesClient from "@/app/widget-references/WidgetReferencesClient";

export default function WidgetReferencesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-primary text-[#F8FAFC] p-10">Loading...</div>}>
      <WidgetReferencesClient />
    </Suspense>
  );
}
