import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { fetchBggThing } from "../src/features/games/bggApi";
import { mapBggThingToGameMetadata } from "../src/features/games/bggMappers";
import type { Database } from "../src/types/database";

const requestSchema = z.object({
  gameId: z.string().min(1, "gameId is required."),
});

type ServerEnvLike = Record<string, string | undefined>;

type SupabaseClientLike = {
  auth: {
    getUser: () => Promise<{
      data: { user: { id: string } | null };
      error: { message?: string } | null;
    }>;
  };
  from: (table: "profiles" | "games") => {
    select: (columns?: string) => {
      eq: (column: string, value: string) => {
        single: () => Promise<{ data: any; error: { message?: string } | null }>;
      };
    };
    update?: (values: Record<string, unknown>) => {
      eq: (column: string, value: string) => Promise<{ error: { message?: string } | null }>;
    };
  };
};

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
}

function readServerEnv(
  env: ServerEnvLike = (globalThis as { process?: { env?: ServerEnvLike } }).process?.env ?? {},
) {
  const supabaseUrl = env.VITE_SUPABASE_URL?.trim();
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing required server environment variables.");
  }

  return { supabaseUrl, supabaseAnonKey };
}

function createAuthenticatedSupabaseClient(accessToken: string): SupabaseClientLike {
  const { supabaseUrl, supabaseAnonKey } = readServerEnv();

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  }) as unknown as SupabaseClientLike;
}

export function createBggRefreshHandler({
  createSupabaseClient = createAuthenticatedSupabaseClient,
  fetchImpl = fetch,
}: {
  createSupabaseClient?: (accessToken: string) => SupabaseClientLike;
  fetchImpl?: typeof fetch;
} = {}) {
  return async function handleBggRefresh(request: Request) {
    if (request.method !== "POST") {
      return json({ error: "Method not allowed." }, { status: 405 });
    }

    const authHeader = request.headers.get("authorization");
    const accessToken = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();

    if (!accessToken) {
      return json({ error: "Authentication required." }, { status: 401 });
    }

    let payload: z.infer<typeof requestSchema>;
    try {
      payload = requestSchema.parse(await request.json());
    } catch {
      return json({ error: "Invalid refresh request." }, { status: 400 });
    }

    const supabase = createSupabaseClient(accessToken);
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user?.id) {
      return json({ error: "Authentication required." }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();

    if (profileError) {
      return json({ error: "Unable to verify owner access." }, { status: 500 });
    }

    if (profile?.role !== "owner") {
      return json({ error: "Owner access required." }, { status: 403 });
    }

    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("id, bgg_id")
      .eq("id", payload.gameId)
      .single();

    if (gameError || !game) {
      return json({ error: "Game not found." }, { status: 404 });
    }

    if (!game.bgg_id) {
      return json({ error: "This game does not have a BGG id yet." }, { status: 400 });
    }

    try {
      const bggThing = await fetchBggThing(game.bgg_id, fetchImpl);
      const metadata = mapBggThingToGameMetadata(bggThing);

      const updateResult = await supabase
        .from("games")
        .update?.(metadata)
        .eq("id", payload.gameId);

      if (updateResult?.error) {
        return json({ error: "Unable to update game metadata." }, { status: 500 });
      }

      return json({ metadata });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to refresh BGG metadata.";
      return json({ error: message }, { status: 502 });
    }
  };
}

const handleBggRefresh = createBggRefreshHandler();

export default handleBggRefresh;
