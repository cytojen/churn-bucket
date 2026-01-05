import { createClient } from "@supabase/supabase-js";
import { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please create a .env.local file with:\n" +
    "NEXT_PUBLIC_SUPABASE_URL=your-supabase-url\n" +
    "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key\n\n" +
    "Get these from your Supabase project settings at https://app.supabase.com"
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

