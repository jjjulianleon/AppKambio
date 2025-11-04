const { SavingsPool, PoolMembership, User } = require('../models');

/**
 * Initialize default savings pool
 * Creates a default pool and adds all existing users to it
 */
const initializeDefaultPool = async () => {
  try {
    console.log('🔄 Initializing default savings pool...');

    // Check if a pool already exists
    const existingPool = await SavingsPool.findOne({
      where: { is_active: true }
    });

    let pool;
    if (existingPool) {
      console.log('✓ Default pool already exists:', existingPool.name);
      pool = existingPool;
    } else {
      // Create default pool
      pool = await SavingsPool.create({
        name: 'Pozo de Ahorro Principal',
        description: 'Pozo de ahorro compartido para ayudarnos mutuamente',
        is_active: true
      });
      console.log('✓ Default pool created:', pool.name);
    }

    // Get all users
    const users = await User.findAll();
    console.log(`📊 Found ${users.length} users`);

    if (users.length === 0) {
      console.log('⚠️ No users found. Pool created but empty.');
      return pool;
    }

    // Add all users to the pool (if not already members)
    let addedCount = 0;
    let existingCount = 0;

    for (const user of users) {
      const existingMembership = await PoolMembership.findOne({
        where: {
          pool_id: pool.id,
          user_id: user.id
        }
      });

      if (!existingMembership) {
        await PoolMembership.create({
          pool_id: pool.id,
          user_id: user.id,
          role: addedCount === 0 ? 'admin' : 'member', // First user is admin
          is_active: true
        });
        addedCount++;
        console.log(`  ✓ Added ${user.full_name || user.email} to pool`);
      } else {
        existingCount++;
        console.log(`  - ${user.full_name || user.email} already in pool`);
      }
    }

    console.log(`\n✓ Pool initialization complete!`);
    console.log(`  - Pool: ${pool.name}`);
    console.log(`  - New members added: ${addedCount}`);
    console.log(`  - Existing members: ${existingCount}`);
    console.log(`  - Total members: ${addedCount + existingCount}`);

    return pool;
  } catch (error) {
    console.error('✗ Error initializing default pool:', error);
    throw error;
  }
};

/**
 * Add a user to the default pool
 * Used when a new user registers
 */
const addUserToDefaultPool = async (userId) => {
  try {
    // Find default pool
    const pool = await SavingsPool.findOne({
      where: { is_active: true },
      order: [['created_at', 'ASC']]
    });

    if (!pool) {
      console.log('⚠️ No default pool found. Creating one...');
      const newPool = await SavingsPool.create({
        name: 'Pozo de Ahorro Principal',
        description: 'Pozo de ahorro compartido para ayudarnos mutuamente',
        is_active: true
      });
      
      await PoolMembership.create({
        pool_id: newPool.id,
        user_id: userId,
        role: 'admin',
        is_active: true
      });

      console.log('✓ Created new pool and added user as admin');
      return;
    }

    // Check if user is already a member
    const existingMembership = await PoolMembership.findOne({
      where: {
        pool_id: pool.id,
        user_id: userId
      }
    });

    if (existingMembership) {
      console.log('User already in pool');
      return;
    }

    // Add user to pool
    await PoolMembership.create({
      pool_id: pool.id,
      user_id: userId,
      role: 'member',
      is_active: true
    });

    console.log('✓ User added to default pool');
  } catch (error) {
    console.error('Error adding user to default pool:', error);
    // Don't throw - this shouldn't block user registration
  }
};

module.exports = {
  initializeDefaultPool,
  addUserToDefaultPool
};
