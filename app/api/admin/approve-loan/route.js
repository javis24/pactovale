import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Loan from '@/models/Loan';

export async function POST(request) {
  try {
    // 1. Verificar Admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { loanId } = await request.json();

    // 2. Buscar Préstamo
    const loan = await Loan.findByPk(loanId);
    if (!loan) {
      return NextResponse.json({ message: 'Préstamo no encontrado' }, { status: 404 });
    }

    // 3. APROBAR
    await loan.update({
      status: 'aprobado',
      startDate: new Date() // Guarda la fecha de hoy como inicio
    });

    return NextResponse.json({ message: 'Autorizado' });

  } catch (error) {
    console.error("Error en API approve-loan:", error);
    return NextResponse.json({ message: 'Error interno' }, { status: 500 });
  }
}