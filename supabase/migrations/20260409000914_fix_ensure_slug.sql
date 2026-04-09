create or replace function public.ensure_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or btrim(new.slug) = '' then
    -- When a BGG ID is provided, append it to prevent duplicate slug collision (e.g. Dune vs Dune)
    new.slug := public.slugify(new.name) || 
      case 
        when new.bgg_id is not null then '-' || new.bgg_id::text
        else ''
      end;
  else
    new.slug := public.slugify(new.slug);
  end if;
  return new;
end;
$$;
