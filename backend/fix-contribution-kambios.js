require('dotenv').config();
const { Kambio } = require('./src/models');
const { sequelize } = require('./src/config/database');
const { Op } = require('sequelize');

async function fixContributionKambios() {
  try {
    await sequelize.authenticate();
    console.log('✓ Connected to database');

    // Update all kambios with "Contribución al Pozo" in description to be 'debit'
    const [updatedCount] = await Kambio.update(
      { transaction_type: 'debit' },
      {
        where: {
          description: {
            [Op.like]: '%Contribución al Pozo%'
          }
        }
      }
    );

    console.log(`✓ Updated ${updatedCount} contribution kambios to 'debit' type`);

    // Update all kambios with "Recibido del Pozo" or "Reembolso" in description to be 'credit'
    const [updatedCount2] = await Kambio.update(
      { transaction_type: 'credit' },
      {
        where: {
          description: {
            [Op.or]: [
              { [Op.like]: '%Recibido del Pozo%' },
              { [Op.like]: '%Reembolso de contribución al Pozo%' }
            ]
          }
        }
      }
    );

    console.log(`✓ Updated ${updatedCount2} received/refund kambios to 'credit' type`);

    // Show updated kambios
    const kambios = await Kambio.findAll({
      where: {
        description: {
          [Op.or]: [
            { [Op.like]: '%Contribución al Pozo%' },
            { [Op.like]: '%Recibido del Pozo%' },
            { [Op.like]: '%Reembolso%' }
          ]
        }
      },
      attributes: ['id', 'amount', 'transaction_type', 'description'],
      order: [['created_at', 'DESC']]
    });

    console.log('\nUpdated pool kambios:');
    kambios.forEach(k => {
      console.log({
        amount: k.amount,
        type: k.transaction_type,
        description: k.description?.substring(0, 60)
      });
    });

    console.log('\n✅ Pool kambios fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing pool kambios:', error);
    process.exit(1);
  }
}

fixContributionKambios();
