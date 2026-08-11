import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import {
  getFirstPaymentDate,
  getLoanPaymentAmount,
} from "@/lib/loanRules";

import Loan from "@/models/Loan";

export async function POST(request) {
  try {
    // Verificar que sea administrador
    const session =
      await getServerSession(authOptions);

    if (
      !session ||
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        {
          message: "No autorizado",
        },
        {
          status: 401,
        }
      );
    }

    // approvedAmount llegará cuando el administrador
    // seleccione el monto disponible en caja
    const {
      loanId,
      approvedAmount,
    } = await request.json();

    // Buscar el préstamo
    const loan = await Loan.findByPk(loanId);

    if (!loan) {
      return NextResponse.json(
        {
          message: "Préstamo no encontrado",
        },
        {
          status: 404,
        }
      );
    }

    // Evitar que se autorice dos veces
    if (loan.status !== "pendiente") {
      return NextResponse.json(
        {
          message:
            "Este préstamo ya fue procesado",
        },
        {
          status: 400,
        }
      );
    }

    // Recuperar el monto originalmente solicitado
    const requestedAmount = Number(
      loan.requestedAmount || loan.amount
    );

    // Si el panel todavía no envía approvedAmount,
    // se utilizará el monto completo solicitado
    const authorizedAmount = Number(
      approvedAmount ?? requestedAmount
    );

    // No permitir montos inválidos o mayores
    // al monto solicitado
    if (
      !Number.isFinite(authorizedAmount) ||
      authorizedAmount <= 0 ||
      authorizedAmount > requestedAmount
    ) {
      return NextResponse.json(
        {
          message:
            "El monto autorizado no es válido",
        },
        {
          status: 400,
        }
      );
    }

    // Calcular el pago correspondiente
    const paymentAmount =
      getLoanPaymentAmount(
        authorizedAmount,
        loan.totalPayments
      );

    if (paymentAmount === null) {
      return NextResponse.json(
        {
          message:
            "El monto autorizado no está disponible para el plazo solicitado",
        },
        {
          status: 400,
        }
      );
    }

    const approvedAt = new Date();

    const firstPaymentDate =
      getFirstPaymentDate(approvedAt);

    // Autorizar y guardar el monto definitivo
    await loan.update({
      requestedAmount,
      amount: authorizedAmount,
      paymentAmount,
      status: "aprobado",
      startDate: approvedAt,
    });

    return NextResponse.json({
      message: "Autorizado",
      amount: authorizedAmount,
      requestedAmount,
      paymentAmount,
      firstPaymentDate:
        firstPaymentDate.toISOString(),
    });
  } catch (error) {
    console.error(
      "Error en API approve-loan:",
      error
    );

    return NextResponse.json(
      {
        message: "Error interno",
      },
      {
        status: 500,
      }
    );
  }
}