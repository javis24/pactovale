import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Loan from '@/models/Loan';

export async function POST(request) {
  try {
    // 1. Seguridad: Solo admin
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

    // 3. Verificar que no se haya pagado ya todo
    if (loan.paymentsMade >= loan.totalPayments) {
        return NextResponse.json({ message: 'Este préstamo ya está liquidado.' }, { status: 400 });
    }

    // 4. REGISTRAR PAGO (Sumar 1)
    const newPaymentsMade = loan.paymentsMade + 1;
    let newStatus = loan.status;

    // Si completó los pagos, cambiamos estatus a 'pagado'
    if (newPaymentsMade >= loan.totalPayments) {
        newStatus = 'pagado';
    }

    await loan.update({
      paymentsMade: newPaymentsMade,
      status: newStatus
    });

    return NextResponse.json({ 
        message: 'Pago registrado correctamente', 
        paymentsMade: newPaymentsMade,
        status: newStatus 
    });

  } catch (error) {
    console.error("Error registrando pago:", error);
    return NextResponse.json({ message: 'Error interno' }, { status: 500 });
  }
}