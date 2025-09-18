const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!SUPABASE_URL);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!SERVICE_ROLE_KEY);
  console.error('\nPlease check your .env file and ensure these variables are set.');
  process.exit(1);
}

console.log('Supabase URL:', SUPABASE_URL);
console.log('Service Role Key:', SERVICE_ROLE_KEY ? 'Present' : 'Missing');

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function executeSqlFile(filePath) {
  console.log(`\n📄 Reading migration file: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Migration file not found: ${filePath}`);
    return;
  }
  
  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(`📝 SQL content length: ${sql.length} characters`);
  
  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
  
  console.log(`🔧 Executing ${statements.length} SQL statements...`);
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (statement.trim()) {
      try {
        console.log(`   ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error);
          // Continue with other statements
        } else {
          console.log(`   ✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.error(`❌ Exception in statement ${i + 1}:`, err.message);
        // Continue with other statements
      }
    }
  }
}

async function applyMigrations() {
  try {
    console.log('🚀 Starting database migration process...');
    
    // Apply initial schema migration
    const initialMigration = path.join(__dirname, 'supabase', 'migrations', '20240101000000_initial_schema.sql');
    await executeSqlFile(initialMigration);
    
    // Apply generated images migration
    const imagesMigration = path.join(__dirname, 'supabase', 'migrations', '20240102000000_add_generated_images.sql');
    await executeSqlFile(imagesMigration);
    
    console.log('\n🎉 Migration process completed!');
    console.log('\n🔍 Testing table creation...');
    
    // Test if tables were created
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['user_profiles', 'subscriptions', 'usage_tracking']);
    
    if (error) {
      console.error('❌ Error checking tables:', error);
    } else {
      console.log('✅ Tables found:', tables.map(t => t.table_name));
    }
    
  } catch (error) {
    console.error('❌ Migration process failed:', error);
    process.exit(1);
  }
}

applyMigrations();