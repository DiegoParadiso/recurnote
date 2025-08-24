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
  is_vip: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
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
  },
  account_status: {
    type: DataTypes.ENUM('pending', 'active', 'suspended', 'deleted'),
    allowNull: false,
    defaultValue: 'pending',
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  preferences: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});
