// Check Database Structure Script
const mysql = require('mysql2/promise');
const config = require('./migrate-config');

async function checkDatabaseStructure() {
  let connection;
  
  try {
    console.log('🔍 Checking MySQL database structure...\n');
    
    // Connect to MySQL
    connection = await mysql.createConnection(config.mysql);
    console.log('✅ Connected to MySQL\n');
    
    // Get all tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Available tables:');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`  ${index + 1}. ${tableName}`);
    });
    
    console.log('\n🔍 Checking table structures:\n');
    
    // Check each table structure
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`📊 Table: ${tableName}`);
      
      try {
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        console.log('   Columns:');
        columns.forEach(col => {
          console.log(`     - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `[${col.Key}]` : ''}`);
        });
        
        // Get sample data
        const [sampleData] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 2`);
        if (sampleData.length > 0) {
          console.log('   Sample data:');
          console.log(`     ${JSON.stringify(sampleData[0], null, 6)}`);
        }
        
        console.log('');
      } catch (error) {
        console.log(`   ❌ Error checking table: ${error.message}\n`);
      }
    }
    
    console.log('✅ Database structure check completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Review the table structures above');
    console.log('2. Update the migration script to match your column names');
    console.log('3. Run the migration again');
    
  } catch (error) {
    console.error('❌ Error checking database structure:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabaseStructure();
