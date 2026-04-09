create or replace function public.ensure_slug()
returns trigger
language plpgsql
as $$
declare
  v_bgg_id text;
begin
  if new.slug is null or btrim(new.slug) = '' then
    new.slug := public.slugify(new.name);
  else
    new.slug := public.slugify(new.slug);
  end if;

  v_bgg_id := to_jsonb(new)->>'bgg_id';
  if v_bgg_id is not null and btrim(v_bgg_id) <> '' then
    new.slug := new.slug || '-' || v_bgg_id;
  end if;

  return new;
end;
$$;
