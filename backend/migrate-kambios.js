const { sequelize } = require('./src/config/database');

async function migrate() {
  try {
    console.log('Adding transaction_type column...');
    await sequelize.query(`
      ALTER TABLE kambios 
      ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(10) DEFAULT 'credit';
    `);
    
    console.log('Adding pool_contribution_id column...');
    await sequelize.query(`
      ALTER TABLE kambios 
      ADD COLUMN IF NOT EXISTS pool_contribution_id UUID 
      REFERENCES pool_contributions(id) ON DELETE SET NULL;
    `);
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrate();
