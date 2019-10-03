'use strict';
module.exports = (sequelize, DataTypes) => {
  const ratings = sequelize.define('ratings', {
    rating: {
      type: DataTypes.NUMBER,
      allowNull: false
    }
  }, {});
  ratings.associate = function(models) {
    // associations can be defined here
  };
  return ratings;
};
