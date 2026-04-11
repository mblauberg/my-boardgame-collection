import { afterEach, describe, expect, it, vi } from "vitest";
import { getCorsHeaders, requireMethod } from "./cors.ts";

describe("cors helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses the request origin when it matches the configured allowlist", () => {
    vi.stubGlobal("Deno", {
      env: {
        get(name: string) {
          if (name === "SITE_URL") return "https://app.example.com";
          if (name === "CORS_ALLOWED_ORIGINS") return "https://preview.example.com";
          return undefined;
        },
      },
    });

    const headers = getCorsHeaders(
      new Request("https://project.supabase.co/functions/v1/email-merge-request", {
        headers: {
          Origin: "https://preview.example.com",
        },
      }),
    );

    expect(headers.get("Access-Control-Allow-Origin")).toBe("https://preview.example.com");
    expect(headers.get("Vary")).toContain("Origin");
  });

  it("returns a 405 response for unsupported methods", async () => {
    vi.stubGlobal("Deno", {
      env: {
        get(name: string) {
          if (name === "SITE_URL") return "https://app.example.com";
          return undefined;
        },
      },
    });

    const response = requireMethod(
      new Request("https://project.supabase.co/functions/v1/email-merge-request", {
        method: "GET",
        headers: {
          Origin: "https://app.example.com",
        },
      }),
      ["POST"],
    );

    expect(response).not.toBeNull();
    expect(response?.status).toBe(405);
    expect(response?.headers.get("Allow")).toBe("POST");
    expect(await response?.json()).toEqual({ error: "Method not allowed" });
  });
});
