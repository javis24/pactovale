import { DataTypes } from 'sequelize';
import sequelize from '@/lib/db';

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // ESTA ES LA PARTE QUE FALTABA:
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Debe coincidir con el nombre de tabla de usuarios
      key: 'id',
    }
  },
  type: {
    type: DataTypes.ENUM('ine_front', 'ine_back', 'selfie', 'signature'),
    allowNull: false,
  },
  url: {
    type: DataTypes.TEXT('long'), 
    allowNull: false,
  }
}, {
  timestamps: true,
});

Document.sync({ alter: true }).catch(err => console.error(err));

export default Document;