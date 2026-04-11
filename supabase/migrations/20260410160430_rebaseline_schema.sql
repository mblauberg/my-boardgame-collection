


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."current_account_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select coalesce(
    (
      select ai.account_id
      from public.account_identities ai
      where ai.auth_user_id = auth.uid()
      limit 1
    ),
    (
      select a.id
      from public.accounts a
      where a.id = auth.uid()
      limit 1
    )
  );
$$;


ALTER FUNCTION "public"."current_account_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_slug"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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


ALTER FUNCTION "public"."ensure_slug"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_account_security_summary"("p_account_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_primary_email text;
  v_secondary_emails jsonb := '[]'::jsonb;
  v_identities jsonb := '[]'::jsonb;
  v_passkeys jsonb := '[]'::jsonb;
begin
  select ae.email_original
  into v_primary_email
  from public.account_emails ae
  where ae.account_id = p_account_id
    and ae.is_primary = true
  order by ae.created_at asc
  limit 1;

  select coalesce(
    jsonb_agg(
      jsonb_build_object('email', ae.email_original)
      order by ae.created_at asc
    ),
    '[]'::jsonb
  )
  into v_secondary_emails
  from public.account_emails ae
  where ae.account_id = p_account_id
    and (v_primary_email is null or ae.email_normalized <> lower(btrim(v_primary_email)));

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'provider', identity_row.provider,
        'email', identity_row.provider_email
      )
      order by identity_row.provider
    ),
    '[]'::jsonb
  )
  into v_identities
  from (
    select distinct on (ai.provider)
      ai.provider,
      ai.provider_email
    from public.account_identities ai
    where ai.account_id = p_account_id
      and ai.provider is not null
    order by ai.provider, ai.last_seen_at desc
  ) as identity_row;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'device_name', p.device_name,
        'last_used_at', p.last_used_at,
        'created_at', p.created_at
      )
      order by p.created_at desc
    ),
    '[]'::jsonb
  )
  into v_passkeys
  from public.passkeys p
  where p.account_id = p_account_id;

  return jsonb_build_object(
    'primaryEmail', v_primary_email,
    'secondaryEmails', v_secondary_emails,
    'identities', v_identities,
    'passkeys', v_passkeys
  );
end;
$$;


ALTER FUNCTION "public"."get_account_security_summary"("p_account_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_account_context"() RETURNS TABLE("account_id" "uuid", "primary_auth_user_id" "uuid", "primary_email" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select
    a.id as account_id,
    a.primary_auth_user_id,
    ae.email_original as primary_email
  from public.accounts a
  left join public.account_emails ae
    on ae.account_id = a.id
   and ae.is_primary = true
  where a.id = public.current_account_id()
  limit 1;
$$;


ALTER FUNCTION "public"."get_current_account_context"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_public_library"("p_username" "text", "p_list_type" "text") RETURNS TABLE("profile_id" "uuid", "username" "text", "library_entry_id" "uuid", "game_id" "uuid", "game_name" "text", "game_slug" "text", "bgg_id" integer, "bgg_url" "text", "bgg_rating" numeric, "bgg_weight" numeric, "players_min" integer, "players_max" integer, "play_time_min" integer, "play_time_max" integer, "category" "text", "summary" "text", "is_expansion_included" boolean, "image_url" "text", "published_year" integer, "saved_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if p_list_type not in ('collection', 'saved') then
    raise exception 'Invalid list type: %', p_list_type;
  end if;

  return query
  select
    p.id as profile_id,
    p.username,
    le.id as library_entry_id,
    g.id as game_id,
    g.name as game_name,
    g.slug as game_slug,
    g.bgg_id,
    g.bgg_url,
    g.bgg_rating,
    g.bgg_weight,
    g.players_min,
    g.players_max,
    g.play_time_min,
    g.play_time_max,
    g.category,
    g.summary,
    g.is_expansion_included,
    g.image_url,
    g.published_year,
    le.created_at as saved_at
  from public.profiles p
  join public.accounts a on a.id = p.id
  join public.library_entries le on le.account_id = a.id
  join public.games g on g.id = le.game_id
  where p.is_profile_public = true
    and p.username = lower(btrim(p_username))
    and (
      (p_list_type = 'collection' and p.is_collection_public = true and le.is_in_collection = true)
      or (p_list_type = 'saved'      and p.is_saved_public = true and le.is_saved = true)
    )
  order by le.created_at desc, g.name asc;
end;
$$;


ALTER FUNCTION "public"."get_public_library"("p_username" "text", "p_list_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_public_profile"("p_username" "text") RETURNS TABLE("id" "uuid", "username" "text", "is_profile_public" boolean, "is_collection_public" boolean, "is_saved_public" boolean)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select
    a.id,
    p.username,
    p.is_profile_public,
    p.is_collection_public,
    p.is_saved_public
  from public.profiles p
  join public.accounts a on a.id = p.id
  where p.is_profile_public = true
    and p.username = lower(btrim(p_username))
  limit 1;
$$;


ALTER FUNCTION "public"."get_public_profile"("p_username" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."import_bgg_games_batch"("batch" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.is_owner() and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'Owner role required';
  end if;

  insert into public.games (
    bgg_id,
    name,
    published_year,
    bgg_rank,
    bgg_bayesaverage,
    bgg_rating,
    bgg_usersrated,
    is_expansion,
    abstracts_rank,
    cgs_rank,
    childrensgames_rank,
    familygames_rank,
    partygames_rank,
    strategygames_rank,
    thematic_rank,
    wargames_rank,
    bgg_data_source,
    bgg_data_updated_at,
    bgg_snapshot_payload,
    status
  )
  select
    (item->>'bgg_id')::integer,
    item->>'name',
    (item->>'published_year')::integer,
    (item->>'bgg_rank')::integer,
    (item->>'bgg_bayesaverage')::numeric,
    (item->>'bgg_rating')::numeric,
    (item->>'bgg_usersrated')::integer,
    (item->>'is_expansion')::boolean,
    (item->>'abstracts_rank')::integer,
    (item->>'cgs_rank')::integer,
    (item->>'childrensgames_rank')::integer,
    (item->>'familygames_rank')::integer,
    (item->>'partygames_rank')::integer,
    (item->>'strategygames_rank')::integer,
    (item->>'thematic_rank')::integer,
    (item->>'wargames_rank')::integer,
    coalesce(item->>'bgg_data_source', 'bgg_csv'),
    (item->>'bgg_data_updated_at')::timestamptz,
    item->'bgg_snapshot_payload',
    'archived'
  from jsonb_array_elements(batch) as item
  on conflict (bgg_id) where bgg_id is not null
  do update set
    name = coalesce(public.games.name, excluded.name),
    published_year = excluded.published_year,
    bgg_rank = excluded.bgg_rank,
    bgg_bayesaverage = excluded.bgg_bayesaverage,
    bgg_rating = coalesce(public.games.bgg_rating, excluded.bgg_rating),
    bgg_usersrated = excluded.bgg_usersrated,
    is_expansion = excluded.is_expansion,
    abstracts_rank = excluded.abstracts_rank,
    cgs_rank = excluded.cgs_rank,
    childrensgames_rank = excluded.childrensgames_rank,
    familygames_rank = excluded.familygames_rank,
    partygames_rank = excluded.partygames_rank,
    strategygames_rank = excluded.strategygames_rank,
    thematic_rank = excluded.thematic_rank,
    wargames_rank = excluded.wargames_rank,
    bgg_data_source = excluded.bgg_data_source,
    bgg_data_updated_at = excluded.bgg_data_updated_at,
    bgg_snapshot_payload = excluded.bgg_snapshot_payload,
    updated_at = now()
  where public.games.bgg_data_updated_at is null
    or excluded.bgg_data_updated_at is null
    or excluded.bgg_data_updated_at >= public.games.bgg_data_updated_at;
end;
$$;


ALTER FUNCTION "public"."import_bgg_games_batch"("batch" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_owner"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.profiles p
    where p.id = public.current_account_id()
      and p.role = 'owner'
  );
$$;


ALTER FUNCTION "public"."is_owner"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."merge_user_data"("p_from_user_id" "uuid", "p_to_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if p_from_user_id is null or p_to_user_id is null then
    raise exception 'Both user IDs are required';
  end if;

  if p_from_user_id = p_to_user_id then
    return;
  end if;

  insert into public.library_entries (
    account_id,
    game_id,
    is_saved,
    is_loved,
    is_in_collection,
    sentiment,
    notes,
    priority,
    created_at,
    updated_at
  )
  select
    p_to_user_id,
    le.game_id,
    le.is_saved,
    le.is_loved,
    le.is_in_collection,
    le.sentiment,
    le.notes,
    le.priority,
    le.created_at,
    le.updated_at
  from public.library_entries le
  where le.account_id = p_from_user_id
  on conflict do nothing;

  insert into public.user_tags (
    account_id,
    name,
    slug,
    colour,
    created_at,
    updated_at
  )
  select
    p_to_user_id,
    ut.name,
    ut.slug,
    ut.colour,
    ut.created_at,
    ut.updated_at
  from public.user_tags ut
  where ut.account_id = p_from_user_id
  on conflict do nothing;

  insert into public.user_game_tags (
    library_entry_id,
    user_tag_id,
    created_at
  )
  select
    target_le.id as library_entry_id,
    target_ut.id as user_tag_id,
    ugt.created_at
  from public.user_game_tags ugt
  join public.library_entries source_le
    on source_le.id = ugt.library_entry_id
   and source_le.account_id = p_from_user_id
  join public.library_entries target_le
    on target_le.account_id = p_to_user_id
   and target_le.game_id = source_le.game_id
  join public.user_tags source_ut
    on source_ut.id = ugt.user_tag_id
   and source_ut.account_id = p_from_user_id
  join public.user_tags target_ut
    on target_ut.account_id = p_to_user_id
   and target_ut.slug = source_ut.slug
  on conflict do nothing;

  delete from public.library_entries where account_id = p_from_user_id;
  delete from public.user_tags where account_id = p_from_user_id;
end;
$$;


ALTER FUNCTION "public"."merge_user_data"("p_from_user_id" "uuid", "p_to_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."normalize_profile_username"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.username is null or btrim(new.username) = '' then
    new.username := null;
  else
    new.username := lower(btrim(new.username));
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."normalize_profile_username"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."library_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "account_id" "uuid" NOT NULL,
    "game_id" "uuid" NOT NULL,
    "is_saved" boolean DEFAULT false NOT NULL,
    "is_loved" boolean DEFAULT false NOT NULL,
    "is_in_collection" boolean DEFAULT false NOT NULL,
    "sentiment" "text",
    "notes" "text",
    "priority" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "library_entries_priority_check" CHECK ((("priority" IS NULL) OR ("priority" >= 1))),
    CONSTRAINT "library_entries_saved_collection_exclusive" CHECK ((NOT ("is_saved" AND "is_in_collection"))),
    CONSTRAINT "library_entries_sentiment_check" CHECK (("sentiment" = ANY (ARRAY['like'::"text", 'dislike'::"text", 'neutral'::"text"])))
);


ALTER TABLE "public"."library_entries" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."save_bgg_game_for_account"("p_account_id" "uuid", "p_bgg_id" integer, "p_name" "text", "p_slug" "text", "p_bgg_url" "text", "p_image_url" "text" DEFAULT NULL::"text", "p_published_year" integer DEFAULT NULL::integer, "p_players_min" integer DEFAULT NULL::integer, "p_players_max" integer DEFAULT NULL::integer, "p_play_time_min" integer DEFAULT NULL::integer, "p_play_time_max" integer DEFAULT NULL::integer, "p_bgg_rating" numeric DEFAULT NULL::numeric, "p_bgg_weight" numeric DEFAULT NULL::numeric, "p_summary" "text" DEFAULT NULL::"text", "p_is_saved" boolean DEFAULT true, "p_is_loved" boolean DEFAULT false, "p_is_in_collection" boolean DEFAULT false, "p_sentiment" "text" DEFAULT NULL::"text", "p_notes" "text" DEFAULT NULL::"text") RETURNS "public"."library_entries"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_game public.games%rowtype;
  v_library_entry public.library_entries%rowtype;
  v_slug text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if public.current_account_id() <> p_account_id and not public.is_owner() then
    raise exception 'Cannot save a game for another account';
  end if;

  if p_bgg_id is null then
    raise exception 'BGG ID is required';
  end if;

  if p_name is null or btrim(p_name) = '' then
    raise exception 'Game name is required';
  end if;

  if p_bgg_url is null or btrim(p_bgg_url) = '' then
    raise exception 'BGG URL is required';
  end if;

  if p_sentiment is not null and p_sentiment not in ('like', 'dislike', 'neutral') then
    raise exception 'Invalid sentiment: %', p_sentiment;
  end if;

  v_slug := public.slugify(coalesce(nullif(btrim(p_slug), ''), p_name));
  if v_slug = '' then
    raise exception 'Slug cannot be empty';
  end if;

  if public.is_owner() then
    insert into public.games (
      name, slug, bgg_id, bgg_url, bgg_rating, bgg_weight,
      players_min, players_max, play_time_min, play_time_max,
      summary, image_url, published_year
    )
    values (
      p_name, v_slug, p_bgg_id, p_bgg_url, p_bgg_rating, p_bgg_weight,
      p_players_min, p_players_max, p_play_time_min, p_play_time_max,
      p_summary, p_image_url, p_published_year
    )
    on conflict (bgg_id) where bgg_id is not null
    do update set
      name           = excluded.name,
      slug           = excluded.slug,
      bgg_url        = excluded.bgg_url,
      bgg_rating     = coalesce(excluded.bgg_rating, games.bgg_rating),
      bgg_weight     = coalesce(excluded.bgg_weight, games.bgg_weight),
      players_min    = coalesce(excluded.players_min, games.players_min),
      players_max    = coalesce(excluded.players_max, games.players_max),
      play_time_min  = coalesce(excluded.play_time_min, games.play_time_min),
      play_time_max  = coalesce(excluded.play_time_max, games.play_time_max),
      summary        = coalesce(excluded.summary, games.summary),
      image_url      = coalesce(excluded.image_url, games.image_url),
      published_year = coalesce(excluded.published_year, games.published_year),
      updated_at     = now()
    returning * into v_game;
  else
    insert into public.games (
      name, slug, bgg_id, bgg_url, summary, image_url, published_year,
      players_min, players_max, play_time_min, play_time_max
    )
    values (
      p_name, v_slug, p_bgg_id, p_bgg_url, p_summary, p_image_url, p_published_year,
      p_players_min, p_players_max, p_play_time_min, p_play_time_max
    )
    on conflict (bgg_id) where bgg_id is not null
    do update set
      summary        = coalesce(excluded.summary, games.summary),
      image_url      = coalesce(games.image_url, excluded.image_url),
      published_year = coalesce(excluded.published_year, games.published_year),
      players_min    = coalesce(excluded.players_min, games.players_min),
      players_max    = coalesce(excluded.players_max, games.players_max),
      play_time_min  = coalesce(excluded.play_time_min, games.play_time_min),
      play_time_max  = coalesce(excluded.play_time_max, games.play_time_max),
      updated_at     = now()
    returning * into v_game;

    if v_game.id is null then
      select * into v_game from public.games where bgg_id = p_bgg_id;
    end if;
  end if;

  insert into public.library_entries (
    account_id, game_id, is_saved, is_loved, is_in_collection, sentiment, notes
  )
  values (
    p_account_id, v_game.id, p_is_saved, p_is_loved, p_is_in_collection, p_sentiment, p_notes
  )
  on conflict (account_id, game_id)
  do update
    set is_saved         = excluded.is_saved,
        is_loved         = excluded.is_loved,
        is_in_collection = excluded.is_in_collection,
        sentiment        = excluded.sentiment,
        notes            = excluded.notes,
        updated_at       = now()
  returning * into v_library_entry;

  return v_library_entry;
end;
$$;


ALTER FUNCTION "public"."save_bgg_game_for_account"("p_account_id" "uuid", "p_bgg_id" integer, "p_name" "text", "p_slug" "text", "p_bgg_url" "text", "p_image_url" "text", "p_published_year" integer, "p_players_min" integer, "p_players_max" integer, "p_play_time_min" integer, "p_play_time_max" integer, "p_bgg_rating" numeric, "p_bgg_weight" numeric, "p_summary" "text", "p_is_saved" boolean, "p_is_loved" boolean, "p_is_in_collection" boolean, "p_sentiment" "text", "p_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_public_profiles"("prefix" "text" DEFAULT ''::"text") RETURNS TABLE("username" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select p.username
  from public.profiles p
  join public.accounts a on a.id = p.id
  where p.is_profile_public = true
    and p.username is not null
    and lower(p.username) like lower(coalesce(prefix, '')) || '%'
  order by p.username asc
  limit 10;
$$;


ALTER FUNCTION "public"."search_public_profiles"("prefix" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."slugify"("input" "text") RETURNS "text"
    LANGUAGE "sql" IMMUTABLE
    AS $$
  select trim(both '-' from regexp_replace(lower(coalesce(input, '')), '[^a-z0-9]+', '-', 'g'));
$$;


ALTER FUNCTION "public"."slugify"("input" "text") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."game_metadata_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "game_id" "uuid" NOT NULL,
    "account_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "image_url" "text",
    "summary" "text",
    "published_year" integer,
    "players_min" integer,
    "players_max" integer,
    "play_time_min" integer,
    "play_time_max" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "game_metadata_requests_has_payload" CHECK ((("image_url" IS NOT NULL) OR ("summary" IS NOT NULL) OR ("published_year" IS NOT NULL) OR ("players_min" IS NOT NULL) OR ("players_max" IS NOT NULL) OR ("play_time_min" IS NOT NULL) OR ("play_time_max" IS NOT NULL))),
    CONSTRAINT "game_metadata_requests_image_url_https_check" CHECK ((("image_url" IS NULL) OR ("image_url" ~~ 'https://%'::"text"))),
    CONSTRAINT "game_metadata_requests_play_time_check" CHECK ((("play_time_min" IS NULL) OR ("play_time_max" IS NULL) OR ("play_time_min" <= "play_time_max"))),
    CONSTRAINT "game_metadata_requests_players_check" CHECK ((("players_min" IS NULL) OR ("players_max" IS NULL) OR ("players_min" <= "players_max"))),
    CONSTRAINT "game_metadata_requests_published_year_range_check" CHECK ((("published_year" IS NULL) OR ("published_year" <= 2100))),
    CONSTRAINT "game_metadata_requests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."game_metadata_requests" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."submit_game_metadata_request"("p_game_id" "uuid", "p_image_url" "text" DEFAULT NULL::"text", "p_summary" "text" DEFAULT NULL::"text", "p_published_year" integer DEFAULT NULL::integer, "p_players_min" integer DEFAULT NULL::integer, "p_players_max" integer DEFAULT NULL::integer, "p_play_time_min" integer DEFAULT NULL::integer, "p_play_time_max" integer DEFAULT NULL::integer) RETURNS "public"."game_metadata_requests"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_game public.games%rowtype;
  v_request public.game_metadata_requests%rowtype;
  v_image_url text;
  v_summary text;
  v_published_year integer;
  v_players_min integer;
  v_players_max integer;
  v_play_time_min integer;
  v_play_time_max integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if p_game_id is null then
    raise exception 'Game ID is required';
  end if;

  select *
  into v_game
  from public.games
  where id = p_game_id
    and (hidden = false or public.is_owner());

  if v_game.id is null then
    raise exception 'Game not found or not accessible';
  end if;

  if public.is_owner() then
    raise exception 'Owners should update metadata directly';
  end if;

  v_image_url := case when v_game.image_url is null then nullif(btrim(p_image_url), '') else null end;
  v_summary := case when v_game.summary is null then nullif(btrim(p_summary), '') else null end;
  v_published_year := case when v_game.published_year is null then p_published_year else null end;
  v_players_min := case when v_game.players_min is null then p_players_min else null end;
  v_players_max := case when v_game.players_max is null then p_players_max else null end;
  v_play_time_min := case when v_game.play_time_min is null then p_play_time_min else null end;
  v_play_time_max := case when v_game.play_time_max is null then p_play_time_max else null end;

  if v_image_url is null
    and v_summary is null
    and v_published_year is null
    and v_players_min is null
    and v_players_max is null
    and v_play_time_min is null
    and v_play_time_max is null then
    raise exception 'No missing fields available for request';
  end if;

  insert into public.game_metadata_requests (
    game_id,
    account_id,
    image_url,
    summary,
    published_year,
    players_min,
    players_max,
    play_time_min,
    play_time_max
  )
  values (
    p_game_id,
    public.current_account_id(),
    v_image_url,
    v_summary,
    v_published_year,
    v_players_min,
    v_players_max,
    v_play_time_min,
    v_play_time_max
  )
  returning * into v_request;

  return v_request;
end;
$$;


ALTER FUNCTION "public"."submit_game_metadata_request"("p_game_id" "uuid", "p_image_url" "text", "p_summary" "text", "p_published_year" integer, "p_players_min" integer, "p_players_max" integer, "p_play_time_min" integer, "p_play_time_max" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_account_email"("p_account_id" "uuid", "p_email" "text", "p_is_primary" boolean DEFAULT false, "p_verified_at" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_email_normalized text;
begin
  if p_account_id is null then
    raise exception 'p_account_id is required';
  end if;

  if p_email is null or btrim(p_email) = '' then
    return;
  end if;

  v_email_normalized := lower(btrim(p_email));

  if p_is_primary then
    update public.account_emails
    set is_primary = false
    where account_id = p_account_id;
  end if;

  insert into public.account_emails (
    account_id,
    email_original,
    email_normalized,
    is_primary,
    verified_at
  )
  values (
    p_account_id,
    btrim(p_email),
    v_email_normalized,
    p_is_primary,
    coalesce(p_verified_at, now())
  )
  on conflict (email_normalized) do update
    set account_id = excluded.account_id,
        email_original = excluded.email_original,
        verified_at = greatest(excluded.verified_at, account_emails.verified_at),
        is_primary = case
          when excluded.is_primary then true
          else account_emails.is_primary
        end;

  if p_is_primary then
    update public.account_emails
    set is_primary = email_normalized = v_email_normalized
    where account_id = p_account_id;
  end if;
end;
$$;


ALTER FUNCTION "public"."sync_account_email"("p_account_id" "uuid", "p_email" "text", "p_is_primary" boolean, "p_verified_at" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_account_identity"("p_account_id" "uuid", "p_auth_user_id" "uuid", "p_auth_identity_id" "text", "p_provider" "text", "p_provider_subject" "text", "p_provider_email" "text", "p_provider_email_verified" boolean DEFAULT NULL::boolean) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_auth_identity_id text;
  v_provider text;
  v_provider_subject text;
  v_provider_email text;
begin
  if p_account_id is null then
    raise exception 'p_account_id is required';
  end if;

  if p_auth_user_id is null then
    raise exception 'p_auth_user_id is required';
  end if;

  v_provider := nullif(lower(btrim(coalesce(p_provider, ''))), '');
  v_provider_subject := nullif(btrim(coalesce(p_provider_subject, '')), '');
  v_provider_email := nullif(lower(btrim(coalesce(p_provider_email, ''))), '');
  v_auth_identity_id := nullif(btrim(coalesce(p_auth_identity_id, '')), '');

  if v_auth_identity_id is null then
    if v_provider is not null and v_provider_subject is not null then
      v_auth_identity_id := v_provider || ':' || v_provider_subject;
    else
      v_auth_identity_id := p_auth_user_id::text;
    end if;
  end if;

  insert into public.account_identities (
    account_id,
    auth_user_id,
    auth_identity_id,
    provider,
    provider_subject,
    provider_email,
    provider_email_verified,
    linked_at,
    last_seen_at
  )
  values (
    p_account_id,
    p_auth_user_id,
    v_auth_identity_id,
    v_provider,
    v_provider_subject,
    v_provider_email,
    p_provider_email_verified,
    now(),
    now()
  )
  on conflict (auth_identity_id) do update
    set account_id = excluded.account_id,
        auth_user_id = excluded.auth_user_id,
        provider = coalesce(excluded.provider, account_identities.provider),
        provider_subject = coalesce(excluded.provider_subject, account_identities.provider_subject),
        provider_email = coalesce(excluded.provider_email, account_identities.provider_email),
        provider_email_verified = coalesce(
          excluded.provider_email_verified,
          account_identities.provider_email_verified
        ),
        last_seen_at = now();

  if coalesce(p_provider_email_verified, false) and v_provider_email is not null then
    perform public.sync_account_email(
      p_account_id,
      v_provider_email,
      false,
      now()
    );
  end if;
end;
$$;


ALTER FUNCTION "public"."sync_account_identity"("p_account_id" "uuid", "p_auth_user_id" "uuid", "p_auth_identity_id" "text", "p_provider" "text", "p_provider_subject" "text", "p_provider_email" "text", "p_provider_email_verified" boolean) OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."games" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "bgg_id" integer,
    "bgg_url" "text",
    "status" "text" DEFAULT 'archived'::"text" NOT NULL,
    "buy_priority" integer,
    "bgg_rating" numeric(3,1),
    "bgg_weight" numeric(3,1),
    "bgg_rank" integer,
    "bgg_bayesaverage" numeric(5,2),
    "bgg_usersrated" integer,
    "is_expansion" boolean,
    "abstracts_rank" integer,
    "cgs_rank" integer,
    "childrensgames_rank" integer,
    "familygames_rank" integer,
    "partygames_rank" integer,
    "strategygames_rank" integer,
    "thematic_rank" integer,
    "wargames_rank" integer,
    "bgg_data_source" "text",
    "bgg_data_updated_at" timestamp with time zone,
    "bgg_snapshot_payload" "jsonb",
    "players_min" integer,
    "players_max" integer,
    "play_time_min" integer,
    "play_time_max" integer,
    "category" "text",
    "summary" "text",
    "notes" "text",
    "recommendation_verdict" "text",
    "recommendation_colour" "text",
    "gap_reason" "text",
    "is_expansion_included" boolean DEFAULT false NOT NULL,
    "image_url" "text",
    "published_year" integer,
    "search_vector" "tsvector" GENERATED ALWAYS AS ("setweight"("to_tsvector"('"english"'::"regconfig", COALESCE("name", ''::"text")), 'A'::"char")) STORED,
    "hidden" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "games_bgg_rating_check" CHECK ((("bgg_rating" IS NULL) OR (("bgg_rating" >= 0.0) AND ("bgg_rating" <= 10.0)))),
    CONSTRAINT "games_bgg_url_format_check" CHECK ((("bgg_url" IS NULL) OR ("bgg_url" ~~ 'https://boardgamegeek.com/%'::"text"))),
    CONSTRAINT "games_bgg_weight_check" CHECK ((("bgg_weight" IS NULL) OR (("bgg_weight" >= 0.0) AND ("bgg_weight" <= 5.0)))),
    CONSTRAINT "games_buy_priority_check" CHECK ((("buy_priority" IS NULL) OR ("buy_priority" >= 1))),
    CONSTRAINT "games_image_url_https_check" CHECK ((("image_url" IS NULL) OR ("image_url" ~~ 'https://%'::"text"))),
    CONSTRAINT "games_play_time_check" CHECK ((("play_time_min" IS NULL) OR ("play_time_max" IS NULL) OR ("play_time_min" <= "play_time_max"))),
    CONSTRAINT "games_players_check" CHECK ((("players_min" IS NULL) OR ("players_max" IS NULL) OR ("players_min" <= "players_max"))),
    CONSTRAINT "games_published_year_range_check" CHECK ((("published_year" IS NULL) OR ("published_year" <= 2100))),
    CONSTRAINT "games_status_check" CHECK (("status" = ANY (ARRAY['owned'::"text", 'buy'::"text", 'new_rec'::"text", 'cut'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."games" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_game_missing_metadata"("p_game_id" "uuid", "p_image_url" "text" DEFAULT NULL::"text", "p_summary" "text" DEFAULT NULL::"text") RETURNS "public"."games"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_game public.games%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if p_game_id is null then
    raise exception 'Game ID is required';
  end if;

  update public.games
  set
    image_url = coalesce(image_url, nullif(btrim(p_image_url), '')),
    summary = coalesce(summary, nullif(btrim(p_summary), '')),
    updated_at =
      case
        when coalesce(image_url, nullif(btrim(p_image_url), '')) is distinct from image_url
          or coalesce(summary, nullif(btrim(p_summary), '')) is distinct from summary
        then now()
        else updated_at
      end
  where id = p_game_id
    and (hidden = false or public.is_owner())
  returning * into v_game;

  if v_game.id is null then
    raise exception 'Game not found or not editable';
  end if;

  return v_game;
end;
$$;


ALTER FUNCTION "public"."update_game_missing_metadata"("p_game_id" "uuid", "p_image_url" "text", "p_summary" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_game_missing_metadata"("p_game_id" "uuid", "p_image_url" "text" DEFAULT NULL::"text", "p_summary" "text" DEFAULT NULL::"text", "p_published_year" integer DEFAULT NULL::integer, "p_players_min" integer DEFAULT NULL::integer, "p_players_max" integer DEFAULT NULL::integer, "p_play_time_min" integer DEFAULT NULL::integer, "p_play_time_max" integer DEFAULT NULL::integer) RETURNS "public"."games"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_game public.games%rowtype;
  v_image_url text;
  v_summary text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_owner() and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'Owner role required';
  end if;

  if p_game_id is null then
    raise exception 'Game ID is required';
  end if;

  v_image_url := nullif(btrim(p_image_url), '');
  v_summary := nullif(btrim(p_summary), '');

  update public.games
  set
    image_url = coalesce(image_url, v_image_url),
    summary = coalesce(summary, v_summary),
    published_year = coalesce(published_year, p_published_year),
    players_min = coalesce(players_min, p_players_min),
    players_max = coalesce(players_max, p_players_max),
    play_time_min = coalesce(play_time_min, p_play_time_min),
    play_time_max = coalesce(play_time_max, p_play_time_max),
    updated_at =
      case
        when coalesce(image_url, v_image_url) is distinct from image_url
          or coalesce(summary, v_summary) is distinct from summary
          or coalesce(published_year, p_published_year) is distinct from published_year
          or coalesce(players_min, p_players_min) is distinct from players_min
          or coalesce(players_max, p_players_max) is distinct from players_max
          or coalesce(play_time_min, p_play_time_min) is distinct from play_time_min
          or coalesce(play_time_max, p_play_time_max) is distinct from play_time_max
        then now()
        else updated_at
      end
  where id = p_game_id
  returning * into v_game;

  if v_game.id is null then
    raise exception 'Game not found';
  end if;

  return v_game;
end;
$$;


ALTER FUNCTION "public"."update_game_missing_metadata"("p_game_id" "uuid", "p_image_url" "text", "p_summary" "text", "p_published_year" integer, "p_players_min" integer, "p_players_max" integer, "p_play_time_min" integer, "p_play_time_max" integer) OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."account_emails" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "account_id" "uuid" NOT NULL,
    "email_original" "text" NOT NULL,
    "email_normalized" "text" NOT NULL,
    "is_primary" boolean DEFAULT false NOT NULL,
    "verified_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."account_emails" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."account_identities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "account_id" "uuid" NOT NULL,
    "auth_user_id" "uuid" NOT NULL,
    "auth_identity_id" "text",
    "provider" "text",
    "provider_subject" "text",
    "provider_email" "text",
    "provider_email_verified" boolean,
    "linked_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_seen_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."account_identities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."accounts" (
    "id" "uuid" NOT NULL,
    "primary_auth_user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_merge_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "from_account_id" "uuid" NOT NULL,
    "to_email" "text" NOT NULL,
    "token_hash" "text" NOT NULL,
    "expires_at" timestamp with time zone DEFAULT ("now"() + '01:00:00'::interval) NOT NULL,
    "used_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."email_merge_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."game_tags" (
    "game_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."game_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."passkey_challenges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "account_id" "uuid",
    "challenge" "text" NOT NULL,
    "expires_at" timestamp with time zone DEFAULT ("now"() + '00:05:00'::interval) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."passkey_challenges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."passkeys" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "account_id" "uuid" NOT NULL,
    "credential_id" "text" NOT NULL,
    "public_key" "text" NOT NULL,
    "counter" bigint DEFAULT 0 NOT NULL,
    "transports" "text"[],
    "device_name" "text",
    "last_used_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."passkeys" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "role" "text" DEFAULT 'viewer'::"text" NOT NULL,
    "username" "text",
    "is_profile_public" boolean DEFAULT false NOT NULL,
    "is_collection_public" boolean DEFAULT false NOT NULL,
    "is_saved_public" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "profiles_public_collection_requires_username_check" CHECK (((NOT "is_collection_public") OR ("username" IS NOT NULL))),
    CONSTRAINT "profiles_public_profile_requires_username_check" CHECK (((NOT "is_profile_public") OR ("username" IS NOT NULL))),
    CONSTRAINT "profiles_public_saved_requires_username_check" CHECK (((NOT "is_saved_public") OR ("username" IS NOT NULL))),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['owner'::"text", 'viewer'::"text"]))),
    CONSTRAINT "profiles_username_lowercase_check" CHECK ((("username" IS NULL) OR ("username" = "lower"("username"))))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "tag_type" "text",
    "colour" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_game_tags" (
    "library_entry_id" "uuid" NOT NULL,
    "user_tag_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_game_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "account_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "colour" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_tags" OWNER TO "postgres";


ALTER TABLE ONLY "public"."account_emails"
    ADD CONSTRAINT "account_emails_email_normalized_key" UNIQUE ("email_normalized");



ALTER TABLE ONLY "public"."account_emails"
    ADD CONSTRAINT "account_emails_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."account_identities"
    ADD CONSTRAINT "account_identities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_primary_auth_user_id_key" UNIQUE ("primary_auth_user_id");



ALTER TABLE ONLY "public"."email_merge_tokens"
    ADD CONSTRAINT "email_merge_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_merge_tokens"
    ADD CONSTRAINT "email_merge_tokens_token_hash_key" UNIQUE ("token_hash");



ALTER TABLE ONLY "public"."game_metadata_requests"
    ADD CONSTRAINT "game_metadata_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."game_tags"
    ADD CONSTRAINT "game_tags_pkey" PRIMARY KEY ("game_id", "tag_id");



ALTER TABLE ONLY "public"."games"
    ADD CONSTRAINT "games_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."games"
    ADD CONSTRAINT "games_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."library_entries"
    ADD CONSTRAINT "library_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."library_entries"
    ADD CONSTRAINT "library_entries_user_id_game_id_key" UNIQUE ("account_id", "game_id");



ALTER TABLE ONLY "public"."passkey_challenges"
    ADD CONSTRAINT "passkey_challenges_challenge_key" UNIQUE ("challenge");



ALTER TABLE ONLY "public"."passkey_challenges"
    ADD CONSTRAINT "passkey_challenges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."passkeys"
    ADD CONSTRAINT "passkeys_credential_id_key" UNIQUE ("credential_id");



ALTER TABLE ONLY "public"."passkeys"
    ADD CONSTRAINT "passkeys_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."user_game_tags"
    ADD CONSTRAINT "user_game_tags_pkey" PRIMARY KEY ("library_entry_id", "user_tag_id");



ALTER TABLE ONLY "public"."user_tags"
    ADD CONSTRAINT "user_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_tags"
    ADD CONSTRAINT "user_tags_user_id_name_key" UNIQUE ("account_id", "name");



ALTER TABLE ONLY "public"."user_tags"
    ADD CONSTRAINT "user_tags_user_id_slug_key" UNIQUE ("account_id", "slug");



CREATE INDEX "email_merge_tokens_expires_at_idx" ON "public"."email_merge_tokens" USING "btree" ("expires_at");



CREATE INDEX "email_merge_tokens_from_account_id_idx" ON "public"."email_merge_tokens" USING "btree" ("from_account_id");



CREATE UNIQUE INDEX "idx_account_emails_one_primary_per_account" ON "public"."account_emails" USING "btree" ("account_id") WHERE ("is_primary" = true);



CREATE UNIQUE INDEX "idx_account_identities_auth_identity_id" ON "public"."account_identities" USING "btree" ("auth_identity_id");



CREATE INDEX "idx_account_identities_provider_email_normalized" ON "public"."account_identities" USING "btree" ("lower"("btrim"("provider_email"))) WHERE ("provider_email" IS NOT NULL);



CREATE UNIQUE INDEX "idx_account_identities_provider_subject" ON "public"."account_identities" USING "btree" ("provider", "provider_subject") WHERE (("provider" IS NOT NULL) AND ("provider_subject" IS NOT NULL));



CREATE INDEX "idx_game_metadata_requests_account_id" ON "public"."game_metadata_requests" USING "btree" ("account_id");



CREATE INDEX "idx_game_metadata_requests_game_id" ON "public"."game_metadata_requests" USING "btree" ("game_id");



CREATE INDEX "idx_game_metadata_requests_status" ON "public"."game_metadata_requests" USING "btree" ("status");



CREATE INDEX "idx_game_tags_tag_id" ON "public"."game_tags" USING "btree" ("tag_id");



CREATE UNIQUE INDEX "idx_games_bgg_id_unique" ON "public"."games" USING "btree" ("bgg_id") WHERE ("bgg_id" IS NOT NULL);



CREATE INDEX "idx_games_buy_priority" ON "public"."games" USING "btree" ("buy_priority");



CREATE INDEX "idx_games_hidden" ON "public"."games" USING "btree" ("hidden");



CREATE INDEX "idx_games_name" ON "public"."games" USING "btree" ("name");



CREATE INDEX "idx_games_search_vector" ON "public"."games" USING "gin" ("search_vector");



CREATE INDEX "idx_games_status" ON "public"."games" USING "btree" ("status");



CREATE INDEX "idx_library_entries_account_id" ON "public"."library_entries" USING "btree" ("account_id");



CREATE INDEX "idx_library_entries_game_id" ON "public"."library_entries" USING "btree" ("game_id");



CREATE UNIQUE INDEX "idx_profiles_username_normalized" ON "public"."profiles" USING "btree" ("lower"("username")) WHERE (("username" IS NOT NULL) AND ("btrim"("username") <> ''::"text"));



CREATE INDEX "idx_tags_tag_type" ON "public"."tags" USING "btree" ("tag_type");



CREATE INDEX "idx_user_game_tags_user_tag_id" ON "public"."user_game_tags" USING "btree" ("user_tag_id");



CREATE INDEX "idx_user_tags_account_id" ON "public"."user_tags" USING "btree" ("account_id");



CREATE INDEX "passkey_challenges_account_id_idx" ON "public"."passkey_challenges" USING "btree" ("account_id");



CREATE INDEX "passkey_challenges_expires_at_idx" ON "public"."passkey_challenges" USING "btree" ("expires_at");



CREATE INDEX "passkeys_account_id_idx" ON "public"."passkeys" USING "btree" ("account_id");



CREATE OR REPLACE TRIGGER "trg_accounts_set_updated_at" BEFORE UPDATE ON "public"."accounts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_game_metadata_requests_set_updated_at" BEFORE UPDATE ON "public"."game_metadata_requests" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_games_ensure_slug" BEFORE INSERT OR UPDATE ON "public"."games" FOR EACH ROW EXECUTE FUNCTION "public"."ensure_slug"();



CREATE OR REPLACE TRIGGER "trg_games_set_updated_at" BEFORE UPDATE ON "public"."games" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_library_entries_set_updated_at" BEFORE UPDATE ON "public"."library_entries" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_profiles_normalize_username" BEFORE INSERT OR UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."normalize_profile_username"();



CREATE OR REPLACE TRIGGER "trg_profiles_set_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_tags_ensure_slug" BEFORE INSERT OR UPDATE ON "public"."tags" FOR EACH ROW EXECUTE FUNCTION "public"."ensure_slug"();



CREATE OR REPLACE TRIGGER "trg_tags_set_updated_at" BEFORE UPDATE ON "public"."tags" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_user_tags_ensure_slug" BEFORE INSERT OR UPDATE ON "public"."user_tags" FOR EACH ROW EXECUTE FUNCTION "public"."ensure_slug"();



CREATE OR REPLACE TRIGGER "trg_user_tags_set_updated_at" BEFORE UPDATE ON "public"."user_tags" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."account_emails"
    ADD CONSTRAINT "account_emails_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."account_identities"
    ADD CONSTRAINT "account_identities_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."account_identities"
    ADD CONSTRAINT "account_identities_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_primary_auth_user_id_fkey" FOREIGN KEY ("primary_auth_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."email_merge_tokens"
    ADD CONSTRAINT "email_merge_tokens_from_account_id_fkey" FOREIGN KEY ("from_account_id") REFERENCES "public"."accounts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."game_metadata_requests"
    ADD CONSTRAINT "game_metadata_requests_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."game_metadata_requests"
    ADD CONSTRAINT "game_metadata_requests_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."game_tags"
    ADD CONSTRAINT "game_tags_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."game_tags"
    ADD CONSTRAINT "game_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."library_entries"
    ADD CONSTRAINT "library_entries_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."library_entries"
    ADD CONSTRAINT "library_entries_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."passkey_challenges"
    ADD CONSTRAINT "passkey_challenges_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."passkeys"
    ADD CONSTRAINT "passkeys_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_game_tags"
    ADD CONSTRAINT "user_game_tags_library_entry_id_fkey" FOREIGN KEY ("library_entry_id") REFERENCES "public"."library_entries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_game_tags"
    ADD CONSTRAINT "user_game_tags_user_tag_id_fkey" FOREIGN KEY ("user_tag_id") REFERENCES "public"."user_tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_tags"
    ADD CONSTRAINT "user_tags_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE CASCADE;



ALTER TABLE "public"."account_emails" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "account_emails_select_own_or_owner" ON "public"."account_emails" FOR SELECT TO "authenticated" USING ((("account_id" = "public"."current_account_id"()) OR "public"."is_owner"()));



ALTER TABLE "public"."account_identities" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "account_identities_select_own_or_owner" ON "public"."account_identities" FOR SELECT TO "authenticated" USING ((("account_id" = "public"."current_account_id"()) OR "public"."is_owner"()));



ALTER TABLE "public"."accounts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "accounts_select_own_or_owner" ON "public"."accounts" FOR SELECT TO "authenticated" USING ((("id" = "public"."current_account_id"()) OR "public"."is_owner"()));



ALTER TABLE "public"."email_merge_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."game_metadata_requests" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "game_metadata_requests_insert_own" ON "public"."game_metadata_requests" FOR INSERT TO "authenticated" WITH CHECK ((("public"."current_account_id"() = "account_id") AND ("status" = 'pending'::"text")));



CREATE POLICY "game_metadata_requests_owner_delete" ON "public"."game_metadata_requests" FOR DELETE TO "authenticated" USING ("public"."is_owner"());



CREATE POLICY "game_metadata_requests_owner_update" ON "public"."game_metadata_requests" FOR UPDATE TO "authenticated" USING ("public"."is_owner"()) WITH CHECK ("public"."is_owner"());



CREATE POLICY "game_metadata_requests_select_own_or_owner" ON "public"."game_metadata_requests" FOR SELECT TO "authenticated" USING ((("public"."current_account_id"() = "account_id") OR "public"."is_owner"()));



ALTER TABLE "public"."game_tags" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "game_tags_owner_delete" ON "public"."game_tags" FOR DELETE TO "authenticated" USING ("public"."is_owner"());



CREATE POLICY "game_tags_owner_insert" ON "public"."game_tags" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_owner"());



CREATE POLICY "game_tags_owner_update" ON "public"."game_tags" FOR UPDATE TO "authenticated" USING ("public"."is_owner"()) WITH CHECK ("public"."is_owner"());



CREATE POLICY "game_tags_public_read" ON "public"."game_tags" FOR SELECT USING (true);



ALTER TABLE "public"."games" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "games_owner_delete" ON "public"."games" FOR DELETE TO "authenticated" USING ("public"."is_owner"());



CREATE POLICY "games_owner_insert" ON "public"."games" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_owner"());



CREATE POLICY "games_owner_update" ON "public"."games" FOR UPDATE TO "authenticated" USING ("public"."is_owner"()) WITH CHECK ("public"."is_owner"());



CREATE POLICY "games_public_read" ON "public"."games" FOR SELECT USING ((("hidden" = false) OR "public"."is_owner"()));



ALTER TABLE "public"."library_entries" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "library_entries_delete_own" ON "public"."library_entries" FOR DELETE TO "authenticated" USING (("public"."current_account_id"() = "account_id"));



CREATE POLICY "library_entries_insert_own" ON "public"."library_entries" FOR INSERT TO "authenticated" WITH CHECK (("public"."current_account_id"() = "account_id"));



CREATE POLICY "library_entries_select_own" ON "public"."library_entries" FOR SELECT TO "authenticated" USING (("public"."current_account_id"() = "account_id"));



CREATE POLICY "library_entries_update_own" ON "public"."library_entries" FOR UPDATE TO "authenticated" USING (("public"."current_account_id"() = "account_id")) WITH CHECK (("public"."current_account_id"() = "account_id"));



ALTER TABLE "public"."passkey_challenges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."passkeys" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_insert_own" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("public"."current_account_id"() = "id"));



CREATE POLICY "profiles_select_own" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("public"."current_account_id"() = "id"));



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("public"."current_account_id"() = "id")) WITH CHECK (("public"."current_account_id"() = "id"));



ALTER TABLE "public"."tags" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tags_owner_delete" ON "public"."tags" FOR DELETE TO "authenticated" USING ("public"."is_owner"());



CREATE POLICY "tags_owner_insert" ON "public"."tags" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_owner"());



CREATE POLICY "tags_owner_update" ON "public"."tags" FOR UPDATE TO "authenticated" USING ("public"."is_owner"()) WITH CHECK ("public"."is_owner"());



CREATE POLICY "tags_public_read" ON "public"."tags" FOR SELECT USING (true);



ALTER TABLE "public"."user_game_tags" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_game_tags_delete_own" ON "public"."user_game_tags" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."library_entries" "le"
  WHERE (("le"."id" = "user_game_tags"."library_entry_id") AND ("le"."account_id" = "public"."current_account_id"())))));



CREATE POLICY "user_game_tags_insert_own" ON "public"."user_game_tags" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."library_entries" "le"
  WHERE (("le"."id" = "user_game_tags"."library_entry_id") AND ("le"."account_id" = "public"."current_account_id"())))) AND (EXISTS ( SELECT 1
   FROM "public"."user_tags" "ut"
  WHERE (("ut"."id" = "user_game_tags"."user_tag_id") AND ("ut"."account_id" = "public"."current_account_id"()))))));



CREATE POLICY "user_game_tags_select_own" ON "public"."user_game_tags" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."library_entries" "le"
  WHERE (("le"."id" = "user_game_tags"."library_entry_id") AND ("le"."account_id" = "public"."current_account_id"())))));



ALTER TABLE "public"."user_tags" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_tags_delete_own" ON "public"."user_tags" FOR DELETE TO "authenticated" USING (("public"."current_account_id"() = "account_id"));



CREATE POLICY "user_tags_insert_own" ON "public"."user_tags" FOR INSERT TO "authenticated" WITH CHECK (("public"."current_account_id"() = "account_id"));



CREATE POLICY "user_tags_select_own" ON "public"."user_tags" FOR SELECT TO "authenticated" USING (("public"."current_account_id"() = "account_id"));



CREATE POLICY "user_tags_update_own" ON "public"."user_tags" FOR UPDATE TO "authenticated" USING (("public"."current_account_id"() = "account_id")) WITH CHECK (("public"."current_account_id"() = "account_id"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";































































































































































GRANT ALL ON FUNCTION "public"."current_account_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_account_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_account_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_slug"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_slug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_slug"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_account_security_summary"("p_account_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_account_security_summary"("p_account_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_account_security_summary"("p_account_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_account_context"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_account_context"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_account_context"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_public_library"("p_username" "text", "p_list_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_public_library"("p_username" "text", "p_list_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_public_library"("p_username" "text", "p_list_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_public_profile"("p_username" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_public_profile"("p_username" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_public_profile"("p_username" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."import_bgg_games_batch"("batch" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."import_bgg_games_batch"("batch" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."import_bgg_games_batch"("batch" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_owner"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_owner"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_owner"() TO "service_role";



GRANT ALL ON FUNCTION "public"."merge_user_data"("p_from_user_id" "uuid", "p_to_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."merge_user_data"("p_from_user_id" "uuid", "p_to_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."merge_user_data"("p_from_user_id" "uuid", "p_to_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."normalize_profile_username"() TO "anon";
GRANT ALL ON FUNCTION "public"."normalize_profile_username"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."normalize_profile_username"() TO "service_role";



GRANT ALL ON TABLE "public"."library_entries" TO "anon";
GRANT ALL ON TABLE "public"."library_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."library_entries" TO "service_role";



GRANT ALL ON FUNCTION "public"."save_bgg_game_for_account"("p_account_id" "uuid", "p_bgg_id" integer, "p_name" "text", "p_slug" "text", "p_bgg_url" "text", "p_image_url" "text", "p_published_year" integer, "p_players_min" integer, "p_players_max" integer, "p_play_time_min" integer, "p_play_time_max" integer, "p_bgg_rating" numeric, "p_bgg_weight" numeric, "p_summary" "text", "p_is_saved" boolean, "p_is_loved" boolean, "p_is_in_collection" boolean, "p_sentiment" "text", "p_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."save_bgg_game_for_account"("p_account_id" "uuid", "p_bgg_id" integer, "p_name" "text", "p_slug" "text", "p_bgg_url" "text", "p_image_url" "text", "p_published_year" integer, "p_players_min" integer, "p_players_max" integer, "p_play_time_min" integer, "p_play_time_max" integer, "p_bgg_rating" numeric, "p_bgg_weight" numeric, "p_summary" "text", "p_is_saved" boolean, "p_is_loved" boolean, "p_is_in_collection" boolean, "p_sentiment" "text", "p_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_bgg_game_for_account"("p_account_id" "uuid", "p_bgg_id" integer, "p_name" "text", "p_slug" "text", "p_bgg_url" "text", "p_image_url" "text", "p_published_year" integer, "p_players_min" integer, "p_players_max" integer, "p_play_time_min" integer, "p_play_time_max" integer, "p_bgg_rating" numeric, "p_bgg_weight" numeric, "p_summary" "text", "p_is_saved" boolean, "p_is_loved" boolean, "p_is_in_collection" boolean, "p_sentiment" "text", "p_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."search_public_profiles"("prefix" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_public_profiles"("prefix" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_public_profiles"("prefix" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."slugify"("input" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."slugify"("input" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."slugify"("input" "text") TO "service_role";



GRANT ALL ON TABLE "public"."game_metadata_requests" TO "anon";
GRANT ALL ON TABLE "public"."game_metadata_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."game_metadata_requests" TO "service_role";



GRANT ALL ON FUNCTION "public"."submit_game_metadata_request"("p_game_id" "uuid", "p_image_url" "text", "p_summary" "text", "p_published_year" integer, "p_players_min" integer, "p_players_max" integer, "p_play_time_min" integer, "p_play_time_max" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."submit_game_metadata_request"("p_game_id" "uuid", "p_image_url" "text", "p_summary" "text", "p_published_year" integer, "p_players_min" integer, "p_players_max" integer, "p_play_time_min" integer, "p_play_time_max" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_game_metadata_request"("p_game_id" "uuid", "p_image_url" "text", "p_summary" "text", "p_published_year" integer, "p_players_min" integer, "p_players_max" integer, "p_play_time_min" integer, "p_play_time_max" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_account_email"("p_account_id" "uuid", "p_email" "text", "p_is_primary" boolean, "p_verified_at" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."sync_account_email"("p_account_id" "uuid", "p_email" "text", "p_is_primary" boolean, "p_verified_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_account_email"("p_account_id" "uuid", "p_email" "text", "p_is_primary" boolean, "p_verified_at" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_account_identity"("p_account_id" "uuid", "p_auth_user_id" "uuid", "p_auth_identity_id" "text", "p_provider" "text", "p_provider_subject" "text", "p_provider_email" "text", "p_provider_email_verified" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sync_account_identity"("p_account_id" "uuid", "p_auth_user_id" "uuid", "p_auth_identity_id" "text", "p_provider" "text", "p_provider_subject" "text", "p_provider_email" "text", "p_provider_email_verified" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_account_identity"("p_account_id" "uuid", "p_auth_user_id" "uuid", "p_auth_identity_id" "text", "p_provider" "text", "p_provider_subject" "text", "p_provider_email" "text", "p_provider_email_verified" boolean) TO "service_role";



GRANT ALL ON TABLE "public"."games" TO "anon";
GRANT ALL ON TABLE "public"."games" TO "authenticated";
GRANT ALL ON TABLE "public"."games" TO "service_role";



GRANT ALL ON FUNCTION "public"."update_game_missing_metadata"("p_game_id" "uuid", "p_image_url" "text", "p_summary" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_game_missing_metadata"("p_game_id" "uuid", "p_image_url" "text", "p_summary" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_game_missing_metadata"("p_game_id" "uuid", "p_image_url" "text", "p_summary" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_game_missing_metadata"("p_game_id" "uuid", "p_image_url" "text", "p_summary" "text", "p_published_year" integer, "p_players_min" integer, "p_players_max" integer, "p_play_time_min" integer, "p_play_time_max" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."update_game_missing_metadata"("p_game_id" "uuid", "p_image_url" "text", "p_summary" "text", "p_published_year" integer, "p_players_min" integer, "p_players_max" integer, "p_play_time_min" integer, "p_play_time_max" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_game_missing_metadata"("p_game_id" "uuid", "p_image_url" "text", "p_summary" "text", "p_published_year" integer, "p_players_min" integer, "p_players_max" integer, "p_play_time_min" integer, "p_play_time_max" integer) TO "service_role";


















GRANT ALL ON TABLE "public"."account_emails" TO "anon";
GRANT ALL ON TABLE "public"."account_emails" TO "authenticated";
GRANT ALL ON TABLE "public"."account_emails" TO "service_role";



GRANT ALL ON TABLE "public"."account_identities" TO "anon";
GRANT ALL ON TABLE "public"."account_identities" TO "authenticated";
GRANT ALL ON TABLE "public"."account_identities" TO "service_role";



GRANT ALL ON TABLE "public"."accounts" TO "anon";
GRANT ALL ON TABLE "public"."accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."accounts" TO "service_role";



GRANT ALL ON TABLE "public"."email_merge_tokens" TO "anon";
GRANT ALL ON TABLE "public"."email_merge_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."email_merge_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."game_tags" TO "anon";
GRANT ALL ON TABLE "public"."game_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."game_tags" TO "service_role";



GRANT ALL ON TABLE "public"."passkey_challenges" TO "anon";
GRANT ALL ON TABLE "public"."passkey_challenges" TO "authenticated";
GRANT ALL ON TABLE "public"."passkey_challenges" TO "service_role";



GRANT ALL ON TABLE "public"."passkeys" TO "anon";
GRANT ALL ON TABLE "public"."passkeys" TO "authenticated";
GRANT ALL ON TABLE "public"."passkeys" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."tags" TO "anon";
GRANT ALL ON TABLE "public"."tags" TO "authenticated";
GRANT ALL ON TABLE "public"."tags" TO "service_role";



GRANT ALL ON TABLE "public"."user_game_tags" TO "anon";
GRANT ALL ON TABLE "public"."user_game_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."user_game_tags" TO "service_role";



GRANT ALL ON TABLE "public"."user_tags" TO "anon";
GRANT ALL ON TABLE "public"."user_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."user_tags" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
































--
-- Dumped schema changes for auth and storage
--

CREATE OR REPLACE TRIGGER "on_auth_user_created" AFTER INSERT ON "auth"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_user"();



CREATE POLICY "game-images_delete" ON "storage"."objects" FOR DELETE TO "authenticated" USING ((("bucket_id" = 'game-images'::"text") AND "public"."is_owner"()));



CREATE POLICY "game-images_insert" ON "storage"."objects" FOR INSERT TO "authenticated" WITH CHECK ((("bucket_id" = 'game-images'::"text") AND "public"."is_owner"()));



CREATE POLICY "game-images_public_read" ON "storage"."objects" FOR SELECT USING (("bucket_id" = 'game-images'::"text"));



CREATE POLICY "game-images_update" ON "storage"."objects" FOR UPDATE TO "authenticated" USING ((("bucket_id" = 'game-images'::"text") AND "public"."is_owner"())) WITH CHECK ((("bucket_id" = 'game-images'::"text") AND "public"."is_owner"()));


