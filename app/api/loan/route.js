import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import User from '@/models/User';
import Loan from '@/models/Loan';
import { getLoanPaymentAmount } from '@/lib/loanRules';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

    const body = await request.json();

    const { 
      amount, term,
      bankName, accountNumber, 
      signature, ineFront, ineBack, selfie, addressProof
    } = body;

    const requestedAmount = Number(amount);
    const totalPayments = Number(term);
    const paymentAmount = getLoanPaymentAmount(requestedAmount, totalPayments);

    if (paymentAmount === null) {
      return NextResponse.json({ message: 'El monto o el plazo seleccionado no es válido' }, { status: 400 });
    }

    if (typeof addressProof !== 'string' || !addressProof.startsWith('data:image/')) {
      return NextResponse.json({
        message: 'Debes subir una fotografía válida de tu comprobante de domicilio reciente'
      }, { status: 400 });
    }

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
      addressProof,
      signature: signature || user.signature,
      bankName: bankName,
      accountNumber: accountNumber
    });


    const newLoan = await Loan.create({
      amount: requestedAmount,
      requestedAmount,
      status: 'pendiente',
      UserId: user.id,
      totalPayments,
      paymentAmount,
      paymentsMade: 0
    });

    return NextResponse.json({ message: 'Solicitud guardada con éxito', loanId: newLoan.id }, { status: 201 });

  } catch (error) {
    console.error("Error API Loan:", error);
    return NextResponse.json({ message: 'Error interno: ' + error.message }, { status: 500 });
  }
}