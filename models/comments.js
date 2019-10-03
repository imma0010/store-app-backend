'use strict';
module.exports = (sequelize, DataTypes) => {
  const comments = sequelize.define('comments', {
    comment: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {});
  return comments;
};
