'use strict';
module.exports = (sequelize, DataTypes) => {
  const bought_product = sequelize.define('bought-product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    isDelivered: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }, 
    isReceived: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {});
  return bought_product;
};
