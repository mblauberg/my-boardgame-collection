import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

describe('importLegacyData', () => {
  it('exits with error when required env values are missing', () => {
    expect(() => {
      execSync('tsx scripts/importLegacyData.ts', {
        env: { ...process.env, VITE_SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '' },
        stdio: 'pipe',
      });
    }).toThrow();
  });

  it('exits with error when the service role key is missing', () => {
    expect(() => {
      execSync('tsx scripts/importLegacyData.ts', {
        env: {
          ...process.env,
          VITE_SUPABASE_URL: 'https://example.supabase.co',
          SUPABASE_SERVICE_ROLE_KEY: '',
        },
        stdio: 'pipe',
      });
    }).toThrow();
  });
});
