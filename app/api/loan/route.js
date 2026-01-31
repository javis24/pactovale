import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import User from '@/models/User';
import Loan from '@/models/Loan';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

    const body = await request.json();

    const { 
      amount, term, payment, 
      bankName, accountNumber, 
      signature, ineFront, ineBack, selfie 
    } = body;

    const user = await User.findOne({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });

    const activeLoan = await Loan.findOne({ 
        where: { UserId: user.id, status: ['pendiente', 'aprobado'] } 
    });

    if (activeLoan) {
        return NextResponse.json({ message: 'Ya tienes un préstamo en curso' }, { status: 400 });
    }

    await user.update({
      ineFront: ineFront || user.ineFront,
      ineBack: ineBack || user.ineBack,
      selfie: selfie || user.selfie,
      signature: signature || user.signature,
      bankName: bankName,
      accountNumber: accountNumber
    });


    const newLoan = await Loan.create({
      amount: parseFloat(amount),
      status: 'pendiente',
      UserId: user.id,
      totalPayments: parseInt(term), 
      paymentAmount: parseFloat(payment),
      paymentsMade: 0
    });

    return NextResponse.json({ message: 'Solicitud guardada con éxito', loanId: newLoan.id }, { status: 201 });

  } catch (error) {
    console.error("Error API Loan:", error);
    return NextResponse.json({ message: 'Error interno: ' + error.message }, { status: 500 });
  }
}