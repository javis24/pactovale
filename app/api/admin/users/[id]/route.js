import { NextResponse } from 'next/server';
import User from '@/models/User';
import { getServerSession } from "next-auth";
import { handler } from "@/app/api/auth/[...nextauth]/route";

// DELETE: Eliminar usuario
export async function DELETE(request, { params }) {
  try {
    // Seguridad
    const session = await getServerSession(handler);
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;
    await User.destroy({ where: { id } });

    return NextResponse.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    return NextResponse.json({ message: 'Error al eliminar' }, { status: 500 });
  }
}


export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(handler);
    if (session?.user?.role !== 'admin') return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

    const { id } = params;
    const body = await request.json(); 

    await User.update({ role: body.role }, { where: { id } });

    return NextResponse.json({ message: 'Rol actualizado' });
  } catch (error) {
    return NextResponse.json({ message: 'Error al actualizar' }, { status: 500 });
  }
}