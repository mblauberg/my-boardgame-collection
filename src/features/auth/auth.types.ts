import type { User, Session } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  email: string | null;
  role: "owner" | "viewer";
  username: string | null;
  is_profile_public: boolean;
  is_collection_public: boolean;
  is_saved_public: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface SessionState extends AuthState {
  session: Session | null;
  user: User | null;
}

export interface ProfileState extends AuthState {
  profile: Profile | null;
  isOwner: boolean;
  error: Error | null;
}
