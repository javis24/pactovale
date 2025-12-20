import { DataTypes } from 'sequelize';
import sequelize from '@/lib/db';

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  
  // Datos contacto
  address: { type: DataTypes.STRING, allowNull: false },
  zipCode: { type: DataTypes.STRING(10), allowNull: false },
  whatsapp: { type: DataTypes.STRING(20), allowNull: false },
  gender: { type: DataTypes.ENUM('hombre', 'mujer', 'otro'), allowNull: false },


  bankName: { type: DataTypes.STRING, allowNull: true },
  accountNumber: { type: DataTypes.STRING, allowNull: true },

  ineFront: { type: DataTypes.TEXT('long'), allowNull: true },
  ineBack: { type: DataTypes.TEXT('long'), allowNull: true },
  selfie: { type: DataTypes.TEXT('long'), allowNull: true },
  signature: { type: DataTypes.TEXT('long'), allowNull: true },

  role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' }
}, { timestamps: true });


User.sync({ alter: true }).catch(err => console.error(err));

export default User;