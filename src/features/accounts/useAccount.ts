import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { shouldRetrySupabaseQuery } from "../../lib/supabase/runtimeErrors";
import { useSession } from "../auth/useSession";
import { accountKeys } from "./accountKeys";
import type { AccountContext, AccountState } from "./account.types";
import type { Database } from "../../types/database";

type CurrentAccountContextRow =
  Database["public"]["Functions"]["get_current_account_context"]["Returns"][number];

function mapCurrentAccountContext(row: CurrentAccountContextRow): AccountContext {
  return {
    id: row.account_id,
    primaryEmail: row.primary_email,
    primaryAuthUserId: row.primary_auth_user_id,
  };
}

export function useAccount(): AccountState {
  const { user, isAuthenticated, isLoading: sessionLoading } = useSession();

  const {
    data: account,
    isLoading: accountLoading,
    error,
  } = useQuery({
    queryKey: accountKeys.current(user?.id),
    retry: shouldRetrySupabaseQuery,
    queryFn: async () => {
      if (!user?.id) return null;

      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("get_current_account_context");

      if (error) throw error;
      const row = data?.[0];
      if (!row) return null;

      return mapCurrentAccountContext(row);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });

  return {
    account: account ?? null,
    isAuthenticated,
    isLoading: sessionLoading || accountLoading,
    error: error as Error | null,
  };
}
