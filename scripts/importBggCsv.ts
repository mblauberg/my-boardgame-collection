#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import { createReadStream } from "fs";
import { parse } from "csv-parse";
import { pathToFileURL } from "url";
import { config } from "dotenv";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export type BggCsvRecord = {
  id: string;
  name: string;
  yearpublished: string;
  rank: string;
  bayesaverage: string;
  average: string;
  usersrated: string;
  is_expansion: string;
  abstracts_rank: string;
  cgs_rank: string;
  childrensgames_rank: string;
  familygames_rank: string;
  partygames_rank: string;
  strategygames_rank: string;
  thematic_rank: string;
  wargames_rank: string;
};

function getSupabaseAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

function parseNullableInt(val: string) {
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? null : parsed;
}

function parseNullableFloat(val: string) {
  const parsed = parseFloat(val);
  return isNaN(parsed) ? null : parsed;
}

function parseNullablePositiveInt(val: string) {
  const parsed = parseNullableInt(val);
  if (parsed === null || parsed <= 0) return null;
  return parsed;
}

export function mapBggCsvRecord(record: BggCsvRecord, importedAt: string) {
  return {
    bgg_id: parseNullableInt(record.id),
    name: record.name,
    published_year: parseNullableInt(record.yearpublished),
    bgg_rank: parseNullablePositiveInt(record.rank),
    bgg_bayesaverage: parseNullableFloat(record.bayesaverage),
    bgg_rating: parseNullableFloat(record.average),
    bgg_usersrated: parseNullableInt(record.usersrated),
    is_expansion: record.is_expansion === "1",
    abstracts_rank: parseNullablePositiveInt(record.abstracts_rank),
    cgs_rank: parseNullablePositiveInt(record.cgs_rank),
    childrensgames_rank: parseNullablePositiveInt(record.childrensgames_rank),
    familygames_rank: parseNullablePositiveInt(record.familygames_rank),
    partygames_rank: parseNullablePositiveInt(record.partygames_rank),
    strategygames_rank: parseNullablePositiveInt(record.strategygames_rank),
    thematic_rank: parseNullablePositiveInt(record.thematic_rank),
    wargames_rank: parseNullablePositiveInt(record.wargames_rank),
    bgg_data_source: "bgg_csv",
    bgg_data_updated_at: importedAt,
    bgg_snapshot_payload: record,
  };
}

export async function importBggCsv() {
  const supabase = getSupabaseAdminClient();
  const filePath = "data/boardgames_ranks.csv";
  const importedAt = new Date().toISOString();
  
  console.log(`Starting CSV import from ${filePath}...`);
  
  const parser = createReadStream(filePath).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
    })
  );

  let batch: any[] = [];
  const BATCH_SIZE = 1000;
  let totalProcessed = 0;

  for await (const record of parser) {
    const row = mapBggCsvRecord(record as BggCsvRecord, importedAt);

    if (row.bgg_id === null || !row.name) {
      continue;
    }

    batch.push(row);

    if (batch.length >= BATCH_SIZE) {
      const { error } = await supabase.rpc("import_bgg_games_batch", { batch });
      if (error) {
        console.error("Batch insertion error:", error);
        throw error;
      }
      totalProcessed += batch.length;
      console.log(`Processed ${totalProcessed} rows...`);
      batch = [];
    }
  }

  // Insert any remaining items
  if (batch.length > 0) {
    const { error } = await supabase.rpc("import_bgg_games_batch", { batch });
    if (error) {
      console.error("Batch insertion error:", error);
      throw error;
    }
    totalProcessed += batch.length;
    console.log(`Processed ${totalProcessed} rows...`);
  }

  console.log(`✓ CSV import complete. Total rows: ${totalProcessed}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  importBggCsv().catch(console.error);
}
