import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { shouldRetrySupabaseQuery } from "../../lib/supabase/runtimeErrors";
import { syncAccountSession } from "../auth/accountSecurityApi";
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

async function fetchCurrentAccountContext(
  supabase: ReturnType<typeof getSupabaseBrowserClient>,
) {
  const { data, error } = await supabase.rpc("get_current_account_context");
  if (error) throw error;
  return data?.[0] ?? null;
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
      const firstRow = await fetchCurrentAccountContext(supabase);
      if (firstRow) {
        return mapCurrentAccountContext(firstRow);
      }

      await syncAccountSession();
      const retryRow = await fetchCurrentAccountContext(supabase);
      if (!retryRow) return null;

      return mapCurrentAccountContext(retryRow);
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
