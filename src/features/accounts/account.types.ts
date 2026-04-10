export interface AccountContext {
  id: string;
  primaryEmail: string | null;
  primaryAuthUserId: string;
}

export interface AccountState {
  account: AccountContext | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
}
