import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2'; 

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',

    dialectModule: mysql2, 

    
    port: 3306,
    logging: false,
    dialectOptions: {
      ssl: {
        require: false,
        rejectUnauthorized: false
      }
    }
  }
);

export default sequelize;