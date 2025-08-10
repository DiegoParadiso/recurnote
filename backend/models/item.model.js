import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js'; 
import { User } from './user.model.js';

export const Item = sequelize.define('Item', {
  date: {
    type: DataTypes.DATEONLY,  // solo fecha
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
  }
}, {
  timestamps: true, 
  tableName: 'items',
});

// Relaciones
User.hasMany(Item, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Item.belongsTo(User, { foreignKey: 'user_id' });
