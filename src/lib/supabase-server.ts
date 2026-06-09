import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Pool, type QueryResultRow } from "pg";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  "";

let databasePool: Pool | undefined;
let publicClient: SupabaseClient | undefined;
let adminClient: SupabaseClient | undefined;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && (process.env.DATABASE_URL || publishableKey));
}

export function getPostgresPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL belum dikonfigurasi.");
  }
  if (!databasePool) {
    databasePool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      application_name: "jbd-commerce",
    });
  }
  return databasePool;
}

export async function queryPostgres<T extends QueryResultRow>(
  text: string,
  values: unknown[] = [],
) {
  return getPostgresPool().query<T>(text, values);
}

export function getSupabasePublicClient() {
  if (!supabaseUrl || !publishableKey) {
    throw new Error("Supabase URL atau publishable key belum dikonfigurasi.");
  }
  if (!publicClient) {
    publicClient = createClient(supabaseUrl, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return publicClient;
}

export function getSupabaseAdminClient() {
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "";
  if (!supabaseUrl || !secretKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY belum dikonfigurasi. Ambil secret key dari Supabase Dashboard > Project Settings > API Keys.",
    );
  }
  if (!adminClient) {
    adminClient = createClient(supabaseUrl, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}

export function getPublicStorageUrl(path: string, bucket = "commerce-media") {
  return getSupabasePublicClient().storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
