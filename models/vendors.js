'use strict';

var bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const vendors = sequelize.define('vendors', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: DataTypes.STRING,
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    hooks: {
      beforeValidate: hashPassword
    }
  });
  return vendors;
};

function hashPassword(Vendors) {
  if (Vendors.changed('password')) {
    return bcrypt.hash(Vendors.password, 10).then(function (password) {
      Vendors.password = password;
    });
  }
}
