const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class ProductTag extends Model {}

ProductTag.init(
  {
    product_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'product', // Name of the referenced model
        key: 'id', // Key in the referenced model
      },
      allowNull: false, // Ensures that this field cannot be null
    },
    tag_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'tag', // Name of the referenced model
        key: 'id', // Key in the referenced model
      },
      allowNull: false, // Ensures that this field cannot be null
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'product_tag',
  }
);

module.exports = ProductTag;
