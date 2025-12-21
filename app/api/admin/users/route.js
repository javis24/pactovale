import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import User from '@/models/User';
import Loan from '@/models/Loan'; 

export async function GET() {
  try {
 
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const users = await User.findAll({
      include: [{ 
          model: Loan,
     
      }], 
      order: [['createdAt', 'DESC']] 
    });

    return NextResponse.json(users);

  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: 'Error al obtener usuarios' }, { status: 500 });
  }
}