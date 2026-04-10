import {
  getSupabaseQueryErrorMessage,
  shouldRetrySupabaseQuery,
} from "./runtimeErrors";

describe("getSupabaseQueryErrorMessage", () => {
  it("explains how to configure public env when it is missing", () => {
    expect(
      getSupabaseQueryErrorMessage(
        new Error("Missing required public environment variables: VITE_SUPABASE_URL"),
        "collection",
      ),
    ).toMatch(/VITE_SUPABASE_URL/);
  });

  it("explains how to apply the schema when Supabase returns a schema cache miss", () => {
    expect(
      getSupabaseQueryErrorMessage(
        {
          status: 404,
          code: "PGRST205",
          message: "Could not find the table 'public.games' in the schema cache",
        },
        "collection",
      ),
    ).toMatch(/supabase db reset/);
  });
});

describe("shouldRetrySupabaseQuery", () => {
  it("does not retry missing-env errors", () => {
    expect(
      shouldRetrySupabaseQuery(
        0,
        new Error("Missing required public environment variables: VITE_SUPABASE_URL"),
      ),
    ).toBe(false);
  });

  it("does not retry schema cache misses", () => {
    expect(
      shouldRetrySupabaseQuery(0, {
        status: 404,
        code: "PGRST205",
        message: "Could not find the table 'public.games' in the schema cache",
      }),
    ).toBe(false);
  });

  it("retries transient errors up to two failures", () => {
    expect(shouldRetrySupabaseQuery(0, new Error("network timeout"))).toBe(true);
    expect(shouldRetrySupabaseQuery(1, new Error("network timeout"))).toBe(true);
    expect(shouldRetrySupabaseQuery(2, new Error("network timeout"))).toBe(false);
  });
});
