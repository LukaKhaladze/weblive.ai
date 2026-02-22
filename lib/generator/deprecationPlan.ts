export const LEGACY_GENERATION_DEPRECATION_PLAN = {
  status: "proposed",
  goal: "Consolidate generation to layoutPlan -> renderFromPlan as the only production path.",
  paths_to_deprecate: [
    "siteSpec path in /api/generate using renderFromSpec",
    "raw prompt path in /api/generate that calls planSite + renderFromSpec",
    "legacy runGeneration rule-based/AI stub path for WizardInput payload",
  ],
  phases: [
    {
      phase: 1,
      action: "Mark legacy branches with runtime warnings and telemetry counters.",
      success_metric: "99% of generate traffic uses layoutPlan path for 14 days.",
    },
    {
      phase: 2,
      action: "Move /build and all internal generation callers to layoutPlan-only contract.",
      success_metric: "No active callers to siteSpec/raw prompt branches.",
    },
    {
      phase: 3,
      action: "Remove legacy branches and simplify generator module boundaries.",
      success_metric: "Single deterministic generation flow with one schema contract.",
    },
  ],
  risks: [
    "Breaking old clients still posting WizardInput directly.",
    "Data migrations for old saved projects may be needed if theme/schema diverges.",
  ],
} as const;
