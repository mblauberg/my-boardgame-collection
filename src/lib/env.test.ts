import { hasPublicEnv, readPublicEnv } from "./env";

describe("readPublicEnv", () => {
  it("returns the public Supabase configuration when both values are present", () => {
    expect(
      readPublicEnv({
        VITE_SUPABASE_URL: "https://example.supabase.co",
        VITE_SUPABASE_ANON_KEY: "anon-key",
      }),
    ).toEqual({
      supabaseUrl: "https://example.supabase.co",
      supabaseAnonKey: "anon-key",
    });
  });

  it("throws a useful error when required variables are missing", () => {
    expect(() => readPublicEnv({ VITE_SUPABASE_URL: "https://example.supabase.co" })).toThrow(
      /VITE_SUPABASE_ANON_KEY/,
    );
  });
});

describe("hasPublicEnv", () => {
  it("reports whether the public Supabase environment is ready", () => {
    expect(
      hasPublicEnv({
        VITE_SUPABASE_URL: "https://example.supabase.co",
        VITE_SUPABASE_ANON_KEY: "anon-key",
      }),
    ).toBe(true);

    expect(hasPublicEnv({ VITE_SUPABASE_URL: "https://example.supabase.co" })).toBe(false);
  });
});
