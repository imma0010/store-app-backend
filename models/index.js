'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Categories = db.sequelize.import('./categories.js');
db.Vendors = db.sequelize.import('./vendors.js');
db.Products = db.sequelize.import('./products.js');
db.Users = db.sequelize.import('./users.js');
db.Comments = db.sequelize.import('./comments.js');
db.BoughtProduct = db.sequelize.import('./bought-product.js');
db.Carts = db.sequelize.import('./cart.js');
db.Admin = db.sequelize.import('./comments.js');
db.Ratings = db.sequelize.import('./ratings.js');

db.Categories.hasMany(db.Products, {as: 'Categories', foreignKey: 'category_id'});
db.Products.belongsTo(db.Categories, {foreignKey: 'category_id'});
db.Vendors.hasMany(db.Products, {as: 'Vendors', foreignKey: 'vendor_id'});
db.Products.belongsTo(db.Vendors, {foreignKey: 'vendor_id'});
db.Users.hasMany(db.Comments, {as: 'User', foreignKey: 'user_id'});
db.Comments.belongsTo(db.Users, {foreignKey: 'user_id'});
db.Products.hasMany(db.Comments, { as: 'Comments', foreignKey: 'comment_id'});
db.Comments.belongsTo(db.Products, {foreignKey: 'comment_id'});
db.Users.hasMany(db.BoughtProduct, {as: 'Users', foreignKey: 'user_id'});
db.BoughtProduct.belongsTo(db.Users, {foreignKey: 'user_id'});
db.Products.hasMany(db.BoughtProduct, {as: 'Products', foreignKey: 'product_id'});
db.BoughtProduct.belongsTo(db.Users, {foreignKey: 'user_id'});
db.Users.hasMany(db.Carts, {as: 'user', foreignKey: 'user_id'});
db.Carts.belongsTo(db.Users, {foreignKey: 'user_id'});
db.Products.hasMany(db.Carts, {as: 'products',foreignKey: 'product_id'});
db.Carts.belongsTo(db.Products, {foreignKey: 'product_id'});
db.Users.hasMany(db.Ratings, {as: 'users', foreignKey: 'user_id'});
db.Ratings.belongsTo(db.Users, {foreignKey: 'user_id'});
db.Products.hasMany(db.Ratings, {as: 'PROducts',foreignKey: 'product_id'});
db.Ratings.belongsTo(db.Products, {foreignKey: 'product_id'});

module.exports = db;
