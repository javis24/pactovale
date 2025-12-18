import { NextResponse } from 'next/server';
import User from '@/models/User';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions"; 

// DELETE: Eliminar usuario
export async function DELETE(request, { params }) {
  try {

    const session = await getServerSession(authOptions); 
    
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;
    await User.destroy({ where: { id } });

    return NextResponse.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error al eliminar' }, { status: 500 });
  }
}

// PUT: Actualizar rol
export async function PUT(request, { params }) {
  try {
    // CAMBIO 3: Usar authOptions aquí también
    const session = await getServerSession(authOptions);
    
    if (session?.user?.role !== 'admin') return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

    const { id } = params;
    const body = await request.json(); 

    await User.update({ role: body.role }, { where: { id } });

    return NextResponse.json({ message: 'Rol actualizado' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error al actualizar' }, { status: 500 });
  }
}