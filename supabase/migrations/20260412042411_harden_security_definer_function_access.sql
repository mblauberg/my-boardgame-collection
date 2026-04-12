revoke execute on function public.get_account_security_summary(uuid) from anon, authenticated;
revoke execute on function public.merge_user_data(uuid, uuid) from anon, authenticated;
revoke execute on function public.sync_account_email(uuid, text, boolean, timestamp with time zone) from anon, authenticated;
revoke execute on function public.sync_account_identity(uuid, uuid, text, text, text, text, boolean) from anon, authenticated;

grant execute on function public.get_account_security_summary(uuid) to service_role;
grant execute on function public.merge_user_data(uuid, uuid) to service_role;
grant execute on function public.sync_account_email(uuid, text, boolean, timestamp with time zone) to service_role;
grant execute on function public.sync_account_identity(uuid, uuid, text, text, text, text, boolean) to service_role;
