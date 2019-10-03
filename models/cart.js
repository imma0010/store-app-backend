'use strict';
module.exports = (sequelize, DataTypes) => {
  const cart = sequelize.define('cart', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    }
  }, {});
  return cart;
};
