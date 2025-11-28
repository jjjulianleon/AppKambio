const { sequelize } = require('./src/config/database');
const { User, Transaction, Goal, Kambio, SavingsPool, PoolMember, Nudge, Split, BattlePassProgress } = require('./src/models');
const bcrypt = require('bcryptjs');

const USERS_TO_CREATE = [
    'julianleon@usfq.edu.ec',
    'stevenparedes@usfq.edu.ec',
    'estuardoparedes@usfq.edu.ec',
    'alexisvaca@usfq.edu.ec'
];

const DEFAULT_PASSWORD = 'KAMBIO2025!';

async function resetAndSeedUsers() {
    console.log('⚠️  STARTING DATABASE RESET AND USER SEEDING ⚠️\n');

    try {
        await sequelize.authenticate();
        console.log('✓ Database connected\n');

        // 1. Re-create database schema (Drops all tables and creates them again)
        console.log('🗑️  Dropping and re-creating all tables...');

        await sequelize.sync({ force: true });

        console.log('✓ Database schema reset successfully\n');

        // 2. Create new users
        console.log('👥 Creating new users...');

        const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

        for (const email of USERS_TO_CREATE) {
            const fullName = email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // Simple name generator

            await User.create({
                email: email,
                password_hash: passwordHash,
                full_name: fullName
            });

            console.log(`   ✅ Created user: ${email}`);
        }

        console.log('\n✨ Database reset and seeding completed successfully!');
        console.log(`   Password for all users: ${DEFAULT_PASSWORD}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting database:', error);
        process.exit(1);
    }
}

resetAndSeedUsers();
