export const accountKeys = {
  all: () => ["account"] as const,
  current: (userId?: string) => ["account", "current", userId] as const,
};
