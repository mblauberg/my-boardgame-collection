export const authKeys = {
  session: () => ["auth", "session"] as const,
  profile: (userId?: string) => ["auth", "profile", userId] as const,
};
