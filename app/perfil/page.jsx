import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import Link from "next/link";
import User from "@/models/User";
import Loan from "@/models/Loan";
import LogoutButton from "@/app/components/LogoutButton"; 

export default async function UserProfile() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/portal");

  const userData = await User.findOne({
    where: { email: session.user.email },
    include: [{ model: Loan, order: [['createdAt', 'DESC']] }]
  });
  
  const user = JSON.parse(JSON.stringify(userData));
  const loans = user.Loans || [];
  const activeLoan = loans.find(l => l.status === 'aprobado' || l.status === 'pendiente');

  // --- LÓGICA DE CALENDARIO CORREGIDA (SOLUCIÓN ERROR HYDRATION) ---
  const getNextPaymentDates = (startDate, totalPayments, paymentsMade) => {
    if (!startDate) return [];
    
    // Forzamos la fecha para evitar problemas de zona horaria
    const start = new Date(startDate);
    const startDay = start.getUTCDate(); // Usamos UTC para ser consistentes
    let dates = [];
    
    // 1. Determinar primer pago
    let currentPaymentDate = new Date(start);
    
    if (startDay < 27) {
        // Ajustamos al día 30 del mismo mes
        currentPaymentDate.setUTCDate(30); 
    } else {
        // Sumamos 15 días
        currentPaymentDate.setUTCDate(start.getUTCDate() + 15);
    }

    // 2. Generar pagos
    for (let i = 1; i <= totalPayments; i++) {
        // Clonamos la fecha para no modificar la referencia
        const payDate = new Date(currentPaymentDate);
        
        dates.push({
            number: i,
            // Convertimos a string ISO simple para evitar discrepancias de hidratación
            dateString: payDate.toLocaleDateString('es-MX', { 
                day: 'numeric', 
                month: 'short',
                timeZone: 'UTC' // 👈 CLAVE: Forzamos UTC para que coincida Server y Cliente
            }),
            status: i <= paymentsMade ? 'pagado' : 'pendiente'
        });

        // Siguiente quincena (+15 días)
        currentPaymentDate.setUTCDate(currentPaymentDate.getUTCDate() + 15);
    }
    return dates;
  };

  const schedule = activeLoan && activeLoan.status === 'aprobado' 
    ? getNextPaymentDates(activeLoan.startDate || activeLoan.createdAt, activeLoan.totalPayments, activeLoan.paymentsMade)
    : [];

  const nextPayment = schedule.find(p => p.status === 'pendiente');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* ENCABEZADO */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Hola, {user.name} 👋</h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
          <LogoutButton />
        </div>

        {/* ACCIÓN PRINCIPAL */}
        {!activeLoan || activeLoan.status === 'pagado' || activeLoan.status === 'rechazado' ? (
             <div className="flex justify-end">
                 <Link href="/loan-request">
                   <button className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-4 rounded-xl shadow-lg font-bold text-lg flex items-center gap-2 transition-all transform hover:scale-105">
                     <span>💰</span> Solicitar Nuevo Préstamo
                   </button>
                 </Link>
             </div>
        ) : null}

        {/* ESTADO 1: EN REVISIÓN */}
        {activeLoan && activeLoan.status === 'pendiente' && (
             <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center animate-fade-in">
                 <div className="w-20 h-20 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                     <span className="text-4xl">⏳</span>
                 </div>
                 <h3 className="text-xl font-bold text-blue-800">Solicitud en Revisión</h3>
                 <p className="text-blue-600 mt-2 max-w-md mx-auto">
                    Estamos validando tus documentos.
                 </p>
                 <div className="flex justify-center gap-4 mt-6">
                    <div className="px-4 py-2 bg-white rounded-lg border border-blue-100 text-sm">
                        <p className="text-gray-400 text-xs">Monto</p>
                        <p className="font-bold text-gray-800">${activeLoan.amount}</p>
                    </div>
                    <div className="px-4 py-2 bg-white rounded-lg border border-blue-100 text-sm">
                        <p className="text-gray-400 text-xs">Pago Quincenal</p>
                        <p className="font-bold text-blue-600">${activeLoan.paymentAmount || "Calculando..."}</p>
                    </div>
                 </div>
             </div>
        )}

        {/* ESTADO 2: APROBADO */}
        {activeLoan && activeLoan.status === 'aprobado' && (
          <div className="space-y-6 animate-fade-in">
            
            <div className="bg-green-500 rounded-2xl p-6 shadow-xl shadow-green-200 text-white relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
                <div className="flex items-center gap-5 relative z-10">
                    <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                        <span className="text-3xl">🏦</span>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">¡Dinero Depositado!</h3>
                        <p className="opacity-95 text-sm mt-1">
                            Tu préstamo de <strong>${activeLoan.amount}</strong> está activo.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-[#ff5aa4]">
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold">Monto Total</p>
                        <p className="text-lg font-bold text-gray-800">${activeLoan.amount}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold">Pago Quincenal</p>
                        <p className="text-lg font-bold text-[#ff5aa4]">${activeLoan.paymentAmount || "0.00"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold">Restante</p>
                        <p className="text-lg font-bold text-gray-800">
                            ${ Math.round((activeLoan.totalPayments - activeLoan.paymentsMade) * (activeLoan.paymentAmount || 0)) }
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold">Próximo Pago</p>
                        <p className="text-lg font-bold text-blue-600">
                            {nextPayment ? nextPayment.dateString : "✅"}
                        </p>
                    </div>
                </div>
                
                {/* Calendario */}
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Calendario de Pagos</div>
                    <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                        {schedule.map((pay) => (
                            <div key={pay.number} className="flex justify-between items-center p-4 hover:bg-gray-50 transition">
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${pay.status === 'pagado' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                        {pay.number}
                                    </div>
                                    <div>
                                        {/* Usamos dateString pre-calculado para evitar el error de hidratación */}
                                        <p className="text-sm font-bold text-gray-700 capitalize">
                                            {pay.dateString}
                                        </p>
                                        <p className="text-xs text-gray-400">Monto: ${activeLoan.paymentAmount}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide ${pay.status === 'pagado' ? 'text-green-600 bg-green-50' : 'text-orange-500 bg-orange-50'}`}>
                                    {pay.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}