const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceRole) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRole);

async function testSupabaseConnection() {
  console.log("Testing Supabase connection...");
  try {
    // Simple connection test
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    console.log("✅ Supabase connection successful");
    return true;
  } catch (error) {
    console.error("❌ Supabase connection failed:", error.message);
    return false;
  }
}

async function getDatabaseSchema() {
  console.log("Attempting to fetch database schema...");
  try {
    // Try to get tables from pg_catalog
    const { data: tables, error: tablesError } = await supabase
      .from('pg_catalog.pg_tables')
      .select('schemaname, tablename, tableowner')
      .eq('schemaname', 'public');

    if (tablesError) {
      console.log("❌ Cannot access pg_catalog.pg_tables:", tablesError.message);

      // Try information_schema with rpc
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_table_info');
      if (rpcError) {
        console.log("ℹ️  Supabase connected, but schema introspection is limited.");
        console.log("   Supabase restricts system table queries for security.");
        console.log("   Use Supabase dashboard for full schema information.");
        console.log("   Or create custom RPC functions for programmatic access.");
        return null;
      }

      console.log("✅ Retrieved schema via RPC:");
      console.log(JSON.stringify(rpcData, null, 2));
      return rpcData;
    }

    console.log("✅ Retrieved schema from pg_catalog:");
    console.log(JSON.stringify(tables, null, 2));
    return tables;
  } catch (error) {
    console.error("❌ Failed to fetch schema:", error.message);
    console.log("   Note: Supabase has security restrictions on system table access");
    return null;
  }
}

async function main() {
  console.log("=== Supabase Testing Script ===\n");

  const connected = await testSupabaseConnection();
  if (!connected) {
    process.exit(1);
  }

  console.log();
  await getDatabaseSchema();

  console.log("\n=== Test Complete ===");
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testSupabaseConnection, getDatabaseSchema };
