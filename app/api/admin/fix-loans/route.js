import { NextResponse } from 'next/server';
import Loan from '@/models/Loan';

const LOAN_TABLE = {
  1000: { 6: 266, 8: 208, 10: 178 },
  1500: { 6: 385, 8: 299, 10: 254 },
  2000: { 6: 504, 8: 389, 10: 329 },
  2500: { 6: 624, 8: 480, 10: 405 },
  3000: { 6: 743, 8: 570, 10: 480 },
  3500: { 6: 862, 8: 661, 10: 556 },
  4000: { 6: 982, 8: 751, 10: 631 },
  4500: { 8: 842, 10: 707 },
  5000: { 8: 932, 10: 782 },
  5500: { 8: 1023, 10: 858 },
  6000: { 8: 1113, 10: 933 },
  6500: { 10: 1009 },
  7000: { 10: 1084 },
  7500: { 10: 1160 },
  8000: { 10: 1235 },
  8500: { 10: 1311 },
  9000: { 10: 1386 },
  9500: { 10: 1462 },
  10000: { 10: 1537 }
};

export async function GET() {
  try {
    const loans = await Loan.findAll();
    let updatedCount = 0;

    for (const loan of loans) {
      const amount = loan.amount;       
      const term = loan.totalPayments;  

      // --- CORRECCIÓN ---
      // Si el pago quincenal es IGUAL al monto total, está mal. Lo forzamos a recalcular.
      // O si queremos forzar a todos para asegurarnos, quitamos la validación.
      
      let correctPayment = 0;

      if (LOAN_TABLE[amount] && LOAN_TABLE[amount][term]) {
          correctPayment = LOAN_TABLE[amount][term];
      } else {
          // Fallback
          const baseRate = 1.6; 
          correctPayment = Math.ceil((amount * baseRate) / term);
      }

      // Solo actualizamos si el valor actual es diferente al correcto
      if (loan.paymentAmount !== correctPayment) {
          console.log(`Corrigiendo préstamo ID ${loan.id}: ${loan.paymentAmount} -> ${correctPayment}`);
          await loan.update({ paymentAmount: correctPayment });
          updatedCount++;
      }
    }

    return NextResponse.json({ 
        message: 'Corrección de montos finalizada', 
        updated: updatedCount 
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}