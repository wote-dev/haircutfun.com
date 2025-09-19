// Quick fix for the database column name mismatch
// This will update the table creation scripts to use consistent column names

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing column name inconsistencies...\n');

// Files that need to be updated
const filesToFix = [
  'create-tables.js',
  'check-tables.js'
];

filesToFix.forEach(filename => {
  const filePath = path.join(__dirname, filename);
  
  if (fs.existsSync(filePath)) {
    console.log(`📝 Updating ${filename}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace haircut_generations with generations_used
    const updatedContent = content.replace(/haircut_generations/g, 'generations_used');
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✅ Fixed column names in ${filename}`);
    } else {
      console.log(`ℹ️ No changes needed in ${filename}`);
    }
  } else {
    console.log(`⚠️ File not found: ${filename}`);
  }
});

console.log('\n🎉 Column name fixes completed!');
console.log('\nThe main issue is likely RLS (Row Level Security) policies.');
console.log('Your app is getting 406/401 errors because:');
console.log('1. The user is not authenticated properly');
console.log('2. RLS policies are blocking access');
console.log('3. The service role is not being used for backend operations');
console.log('\n💡 Quick solutions:');
console.log('1. Make sure users are properly logged in');
console.log('2. Use service role key for server-side operations');
console.log('3. Check if RLS policies allow the operations you\'re trying to perform');