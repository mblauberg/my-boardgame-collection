import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = join(
  process.cwd(),
  "supabase/migrations/20260412042411_harden_security_definer_function_access.sql",
);

describe("supabase privileged function access hardening", () => {
  it("revokes anon/authenticated execute access for privileged account-security functions", () => {
    const source = readFileSync(migrationPath, "utf8");

    expect(source).toContain(
      'revoke execute on function public.get_account_security_summary(uuid) from anon, authenticated;',
    );
    expect(source).toContain(
      'revoke execute on function public.merge_user_data(uuid, uuid) from anon, authenticated;',
    );
    expect(source).toContain(
      'revoke execute on function public.sync_account_email(uuid, text, boolean, timestamp with time zone) from anon, authenticated;',
    );
    expect(source).toContain(
      'revoke execute on function public.sync_account_identity(uuid, uuid, text, text, text, text, boolean) from anon, authenticated;',
    );
  });

  it("keeps service-role execution explicit for privileged account-security functions", () => {
    const source = readFileSync(migrationPath, "utf8");

    expect(source).toContain(
      "grant execute on function public.get_account_security_summary(uuid) to service_role;",
    );
    expect(source).toContain(
      "grant execute on function public.merge_user_data(uuid, uuid) to service_role;",
    );
    expect(source).toContain(
      "grant execute on function public.sync_account_email(uuid, text, boolean, timestamp with time zone) to service_role;",
    );
    expect(source).toContain(
      "grant execute on function public.sync_account_identity(uuid, uuid, text, text, text, text, boolean) to service_role;",
    );
  });
});
