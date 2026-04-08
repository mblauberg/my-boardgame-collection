import type { User, Session } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  email: string | null;
  role: "owner" | "viewer";
  created_at: string;
  updated_at: string;
}

export interface SessionState {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ProfileState {
  profile: Profile | null;
  isOwner: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
}
