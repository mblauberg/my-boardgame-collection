const LEGACY_PIPELINE_OPT_IN_ENV = "ALLOW_LEGACY_IMPORT_PIPELINE";

export const LEGACY_SOURCE_PATH = "scripts/legacy/assets/board-game-collection.jsx";
export const LEGACY_SEED_PATH = "scripts/legacy/output/seed-data.json";

export function assertLegacyPipelineOptIn(legacyCommand: string) {
  if (process.env[LEGACY_PIPELINE_OPT_IN_ENV] === "1") {
    return;
  }

  throw new Error(
    `Legacy import pipeline is quarantined. Re-run intentionally with ${LEGACY_PIPELINE_OPT_IN_ENV}=1 npm run ${legacyCommand}.`,
  );
}
