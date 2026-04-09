type ErrorLike = {
  code?: string;
  message?: string;
  status?: number;
};

const MAX_RETRY_ATTEMPTS = 2;

function toErrorLike(error: unknown): ErrorLike {
  if (error instanceof Error) {
    return { message: error.message };
  }

  if (typeof error === "object" && error !== null) {
    const candidate = error as ErrorLike;
    return {
      code: candidate.code,
      message: candidate.message,
      status: candidate.status,
    };
  }

  return {};
}

function isMissingPublicEnvError(error: unknown) {
  return toErrorLike(error).message?.includes("Missing required public environment variables");
}

function isSchemaCacheMiss(error: unknown) {
  const candidate = toErrorLike(error);
  return candidate.status === 404 || candidate.code === "PGRST205";
}

function isAuthOrPermissionError(error: unknown) {
  const status = toErrorLike(error).status;
  return status === 400 || status === 401 || status === 403;
}

export function shouldRetrySupabaseQuery(failureCount: number, error: unknown) {
  if (isMissingPublicEnvError(error) || isSchemaCacheMiss(error) || isAuthOrPermissionError(error)) {
    return false;
  }

  return failureCount < MAX_RETRY_ATTEMPTS;
}

export function getSupabaseQueryErrorMessage(error: unknown, resourceLabel: string) {
  if (isMissingPublicEnvError(error)) {
    return "Supabase is not configured for this app yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.";
  }

  if (isSchemaCacheMiss(error)) {
    return `The configured Supabase project is missing the tables for this ${resourceLabel}. Apply schema.sql, then seed the project with npm run migrate:generate and npm run migrate:import after setting SUPABASE_SERVICE_ROLE_KEY in your local environment.`;
  }

  return `Unable to load the ${resourceLabel}. Check your Supabase configuration and try again.`;
}
