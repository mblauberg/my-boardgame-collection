import { hasPublicEnv, readPublicEnv } from "./env";
import type { Database } from "../types/database";

type LibraryEntryRow = Database["public"]["Tables"]["library_entries"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

describe("readPublicEnv", () => {
  it("returns the public Supabase configuration when both values are present", () => {
    expect(
      readPublicEnv({
        VITE_SUPABASE_URL: "https://example.supabase.co",
        VITE_SUPABASE_ANON_KEY: "anon-key",
        VITE_AUTH_ENABLED_OAUTH_PROVIDERS: "google, github,discord",
      }),
    ).toEqual({
      supabaseUrl: "https://example.supabase.co",
      supabaseAnonKey: "anon-key",
      enabledOAuthProviders: ["google", "github", "discord"],
    });
  });

  it("throws a useful error when required variables are missing", () => {
    expect(() => readPublicEnv({ VITE_SUPABASE_URL: "https://example.supabase.co" })).toThrow(
      /VITE_SUPABASE_ANON_KEY/,
    );
  });

  it("throws a useful error when an unsupported OAuth provider is configured", () => {
    expect(() =>
      readPublicEnv({
        VITE_SUPABASE_URL: "https://example.supabase.co",
        VITE_SUPABASE_ANON_KEY: "anon-key",
        VITE_AUTH_ENABLED_OAUTH_PROVIDERS: "google,notion",
      }),
    ).toThrow(/VITE_AUTH_ENABLED_OAUTH_PROVIDERS/);
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

describe("database typings", () => {
  it("includes account-oriented library and profile fields", () => {
    expectTypeOf<LibraryEntryRow>().toMatchTypeOf<{
      id: string;
      account_id: string;
      game_id: string;
      is_saved: boolean;
      is_in_collection: boolean;
      sentiment: string | null;
    }>();

    expectTypeOf<ProfileRow>().toMatchTypeOf<{
      id: string;
      username: string | null;
      is_profile_public: boolean;
      is_collection_public: boolean;
      is_saved_public: boolean;
    }>();
  });
});
