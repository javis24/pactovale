import { DataTypes } from 'sequelize';
import sequelize from '@/lib/db';
import User from './User';

const Loan = sequelize.define('Loan', {
  amount: { type: DataTypes.FLOAT, allowNull: false },
  status: { 
    type: DataTypes.ENUM('pendiente', 'aprobado', 'pagado', 'rechazado'), 
    defaultValue: 'pendiente' 
  },
  paymentsMade: { type: DataTypes.INTEGER, defaultValue: 0 }, 
  totalPayments: { type: DataTypes.INTEGER, defaultValue: 12 }, 
  requestDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

Loan.belongsTo(User);
User.hasMany(Loan);
Loan.sync({ alter: true }).catch(err => console.error("Error creando tabla Loan:", err));

export default Loan;