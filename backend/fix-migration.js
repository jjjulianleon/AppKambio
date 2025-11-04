const { sequelize } = require('./src/config/database');

async function fixMigration() {
  try {
    console.log('🔧 Fixing transaction_type column...');
    
    // Drop existing columns if they exist with wrong type
    console.log('1. Dropping existing columns...');
    await sequelize.query(`
      ALTER TABLE kambios DROP COLUMN IF EXISTS transaction_type CASCADE;
    `);
    
    await sequelize.query(`
      ALTER TABLE kambios DROP COLUMN IF EXISTS pool_contribution_id CASCADE;
    `);

    // Drop and recreate ENUM type to ensure it's correct
    console.log('2. Recreating ENUM type...');
    await sequelize.query(`
      DROP TYPE IF EXISTS enum_kambios_transaction_type CASCADE;
    `);
    
    await sequelize.query(`
      CREATE TYPE enum_kambios_transaction_type AS ENUM ('credit', 'debit');
    `);

    // Add transaction_type column with correct ENUM type
    console.log('3. Adding transaction_type column...');
    await sequelize.query(`
      ALTER TABLE kambios 
      ADD COLUMN transaction_type enum_kambios_transaction_type NOT NULL DEFAULT 'credit';
    `);

    // Add pool_contribution_id column
    console.log('4. Adding pool_contribution_id column...');
    await sequelize.query(`
      ALTER TABLE kambios 
      ADD COLUMN pool_contribution_id UUID REFERENCES pool_contributions(id) ON DELETE SET NULL;
    `);
    
    console.log('✅ Migration fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

fixMigration();
