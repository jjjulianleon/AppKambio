const { sequelize } = require('./src/config/database');
const { User, Transaction, ExpenseCategory } = require('./src/models');
const aiService = require('./src/services/aiService');

async function seedAiTransactions() {
  console.log('🤖 Seeding AI Mock Transactions for ALL users...\n');

  try {
    await sequelize.authenticate();
    console.log('✓ Database connected\n');

    // 1. Find ALL users
    const users = await User.findAll();

    if (users.length === 0) {
      console.error('❌ No users found in database. Please create a user first.');
      process.exit(1);
    }

    console.log(`👥 Found ${users.length} users. Generating data for each...`);

    for (const user of users) {
      console.log(`\n👤 Processing user: ${user.email} (ID: ${user.id})`);

      // 2. Generate mock data using AI
      console.log('   🧠 Asking OpenAI for "gastos hormiga" data...');
      const mockTransactions = await aiService.generateMockTransactions(20); // Reduced count per user to be faster
      console.log(`   ✓ Generated ${mockTransactions.length} mock transactions`);

      // 3. Insert into database
      console.log('   💾 Saving to database...');

      let savedCount = 0;
      for (const t of mockTransactions) {
        // Try to find or create category
        // Try to find or create category
        const [category] = await ExpenseCategory.findOrCreate({
          where: {
            category_name: t.category,
            user_id: user.id
          },
          defaults: {
            category_name: t.category,
            user_id: user.id,
            default_amount: parseFloat(t.amount)
          }
        });

        await Transaction.create({
          user_id: user.id,
          amount: parseFloat(t.amount),
          description: t.description,
          category: t.category, // Storing as string as per current model
          transaction_date: new Date(t.date) // Using DATE type
        });
        savedCount++;
      }
      console.log(`   ✅ Saved ${savedCount} transactions for ${user.email}`);
    }

    console.log(`\n✅ Successfully seeded transactions for all users!`);
    console.log('📊 You can now test the AI Insights endpoint.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedAiTransactions();
