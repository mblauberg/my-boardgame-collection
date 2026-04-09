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

describe("database typings", () => {
  it("includes the multi-user library tables and public profile fields", () => {
    expectTypeOf<LibraryEntryRow>().toMatchTypeOf<{
      id: string;
      user_id: string;
      game_id: string;
      is_saved: boolean;
      is_in_collection: boolean;
      sentiment: "like" | "dislike" | "neutral" | null;
    }>();

    expectTypeOf<ProfileRow>().toMatchTypeOf<{
      username: string | null;
      is_profile_public: boolean;
      is_collection_public: boolean;
      is_saved_public: boolean;
    }>();
  });
});
