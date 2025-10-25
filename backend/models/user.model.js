import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50],
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
      notEmpty: true
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [8, 128],
      notEmpty: true
    }
  },
  avatar_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_vip: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  preferences: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  
  // Campos para verificación con código
  verification_code: {
    type: DataTypes.STRING(6),
    allowNull: true,
  },
  verification_code_expires: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  email_verification_token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email_verification_expires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  password_reset_token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password_reset_expires: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'Users',
  timestamps: true
});