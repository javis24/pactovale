import { NextResponse } from 'next/server';
import sequelize from '@/lib/db';
import User from '@/models/User'; 

export async function GET() {
  try {
   
    await sequelize.authenticate();
    console.log('Conexión establecida correctamente.');


    await sequelize.sync({ alter: true });

    return NextResponse.json({ message: 'Tablas creadas y DB sincronizada correctamente' });
  } catch (error) {
    console.error('Error al sincronizar:', error);
    return NextResponse.json({ 
        message: 'Error conectando a la BD', 
        error: error.message 
    }, { status: 500 });
  }
}