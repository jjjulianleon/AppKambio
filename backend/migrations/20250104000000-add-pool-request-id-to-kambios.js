'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('kambios', 'pool_request_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'pool_requests',
        key: 'id'
      },
      onDelete: 'SET NULL',
      comment: 'ID de la solicitud del pozo si es un crédito por solicitud completada'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('kambios', 'pool_request_id');
  }
};
