'use strict';
module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    middle_name: DataTypes.STRING,
    last_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: DataTypes.STRING,
    contact: DataTypes.STRING,
    email: DataTypes.STRING,
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {});
  return users;
};

function hashPassword(Users) {
  if (Users.changed('password')) {
    return bcrypt.hash(Users.password, 10).then(function (password) {
      Users.password = password;
    });
  }
}
