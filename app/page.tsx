import { Suspense } from "react";
import GeneratorClient from "@/components/GeneratorClient";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <GeneratorClient />
    </Suspense>
  );
}
