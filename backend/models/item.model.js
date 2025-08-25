import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js'; 
import { User } from './user.model.js';

export const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User, // Correct: reference the Sequelize model (table "Users")
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  x: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: false,
  },
  y: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: false,
  },
  rotation: {
    type: DataTypes.NUMERIC(10, 2),
    defaultValue: 0,
  },
  rotation_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  item_data: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'items',
  timestamps: true
});

// Relaciones
User.hasMany(Item, { foreignKey: 'user_id', onDelete: 'CASCADE', sourceKey: 'id', as: 'items' });
Item.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id', as: 'user' });
