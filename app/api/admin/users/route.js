import { NextResponse } from 'next/server';
import User from '@/models/User';
import Document from '@/models/Document'; // Importar
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    User.hasMany(Document, { foreignKey: 'userId' });
    Document.belongsTo(User, { foreignKey: 'userId' });

    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      include: [ { model: Document } ] 
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: 'Error al obtener usuarios' }, { status: 500 });
  }
}