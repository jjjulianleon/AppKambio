'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // First, check if columns already exist and drop them if VARCHAR type
    await queryInterface.sequelize.query(`
      ALTER TABLE kambios DROP COLUMN IF EXISTS transaction_type CASCADE;
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TABLE kambios DROP COLUMN IF EXISTS pool_contribution_id CASCADE;
    `);

    // Create ENUM type
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE enum_kambios_transaction_type AS ENUM ('credit', 'debit');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Add transaction_type column with ENUM type
    await queryInterface.sequelize.query(`
      ALTER TABLE kambios 
      ADD COLUMN transaction_type enum_kambios_transaction_type NOT NULL DEFAULT 'credit';
    `);

    // Add pool_contribution_id column
    await queryInterface.sequelize.query(`
      ALTER TABLE kambios 
      ADD COLUMN pool_contribution_id UUID REFERENCES pool_contributions(id) ON DELETE SET NULL;
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('kambios', 'pool_contribution_id');
    await queryInterface.removeColumn('kambios', 'transaction_type');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_kambios_transaction_type";');
  }
};
