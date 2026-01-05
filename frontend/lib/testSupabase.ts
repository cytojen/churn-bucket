// Test utility to verify Supabase connection and data
import { supabase } from "./supabase";

export async function testSupabaseConnection() {
  console.log("Testing Supabase connection...");
  
  try {
    const { data, error, count } = await supabase
      .from("data")
      .select("*", { count: "exact" })
      .limit(5);

    if (error) {
      console.error("Supabase error:", error);
      return { success: false, error };
    }

    console.log("Supabase connected successfully!");
    console.log(`Total rows in database: ${count}`);
    console.log("Sample data (first 5 rows):");
    console.table(data);
    
    return { success: true, data, count };
  } catch (err) {
    console.error("Connection failed:", err);
    return { success: false, error: err };
  }
}
