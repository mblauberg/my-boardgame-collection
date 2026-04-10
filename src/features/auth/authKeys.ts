import { accountKeys } from "../accounts/accountKeys";

export const authKeys = {
  session: () => ["auth", "session"] as const,
  account: accountKeys.current,
  profile: (accountId?: string) => ["auth", "profile", accountId] as const,
};
