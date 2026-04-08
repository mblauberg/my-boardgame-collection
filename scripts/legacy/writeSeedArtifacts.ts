import { writeFileSync } from 'fs';
import type { SeedPayload } from './buildSeedPayload.js';

export function writeSeedArtifacts(payload: SeedPayload, outputPath: string): void {
  writeFileSync(outputPath, JSON.stringify(payload, null, 2), 'utf-8');
}
