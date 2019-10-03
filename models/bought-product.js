'use strict';
module.exports = (sequelize, DataTypes) => {
  const bought_product = sequelize.define('bought-product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    }
  }, {});
  return bought_product;
};
