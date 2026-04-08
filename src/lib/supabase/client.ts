import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../types/database";
import { readPublicEnv } from "../env";

let browserClient: ReturnType<typeof createClient<Database>> | undefined;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    const { supabaseUrl, supabaseAnonKey } = readPublicEnv();
    browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }

  return browserClient;
}
