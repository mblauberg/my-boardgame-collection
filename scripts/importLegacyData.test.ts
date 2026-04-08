import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

describe('importLegacyData', () => {
  it('exits with error when required env values are missing', () => {
    expect(() => {
      execSync('tsx scripts/importLegacyData.ts', {
        env: { ...process.env, VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' },
        stdio: 'pipe',
      });
    }).toThrow();
  });
});
