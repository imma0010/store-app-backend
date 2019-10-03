'use strict';
module.exports = (sequelize, DataTypes) => {
  const admin = sequelize.define('admin', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {});
  return admin;
};

function hashPassword(Admin) {
  if (Admin.changed('password')) {
    return bcrypt.hash(Admin.password, 10).then(function (password) {
      Admin.password = password;
    });
  }
}
