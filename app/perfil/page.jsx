import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import Link from "next/link";
import User from "@/models/User";
import Loan from "@/models/Loan";
import LogoutButton from "@/app/components/LogoutButton"; // <--- Importamos el botón aquí

export default async function UserProfile() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/portal");

  // Traer datos de la BD
  const userData = await User.findOne({
    where: { email: session.user.email },
    include: [{ model: Loan, order: [['createdAt', 'DESC']] }]
  });
  
  const user = JSON.parse(JSON.stringify(userData));
  const loans = user.Loans || [];

  // Préstamo activo (aprobado o pendiente)
  const activeLoan = loans.find(l => l.status === 'aprobado' || l.status === 'pendiente');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* TARJETA DE USUARIO + LOGOUT */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Hola, {user.name} 👋</h1>
            <p className="text-gray-500 text-sm mb-2">{user.email}</p>
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full uppercase font-bold tracking-wide">
              Cliente Verificado
            </span>
          </div>

          {/* Botón de Cerrar Sesión (Componente Cliente) */}
          <div>
            <LogoutButton />
          </div>
        </div>

        {/* ACCIÓN PRINCIPAL: SOLICITAR PRÉSTAMO */}
        <div className="flex justify-end">
          {!activeLoan || activeLoan.status === 'pagado' || activeLoan.status === 'rechazado' ? (
             // ✅ CAMBIO: Ahora apunta a /loan-request
             <Link href="/loan-request">
               <button className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-4 rounded-xl shadow-lg font-bold text-lg flex items-center gap-2 transition-all transform hover:scale-105">
                 <span>💰</span> Solicitar Nuevo Préstamo
               </button>
             </Link>
          ) : (
            <div className="w-full bg-yellow-50 text-yellow-800 px-4 py-3 rounded-lg border border-yellow-200 text-sm font-medium text-center">
              ⚠️ Tienes una solicitud en curso, no puedes pedir otra hasta finalizarla.
            </div>
          )}
        </div>

        {/* SECCIÓN DE PRÉSTAMO ACTIVO (PROGRESO) */}
        {activeLoan && activeLoan.status === 'aprobado' && (
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Tu Préstamo Activo</h3>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">En Progreso</span>
            </div>
            
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Pagos realizados</span>
              <span className="font-bold text-gray-900">{activeLoan.paymentsMade} de {activeLoan.totalPayments}</span>
            </div>
            
            {/* Barra de progreso */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
              <div 
                className="bg-green-500 h-4 rounded-full transition-all duration-500 relative"
                style={{ width: `${(activeLoan.paymentsMade / activeLoan.totalPayments) * 100}%` }}
              >
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
               <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400 uppercase">Monto Total</p>
                  <p className="font-bold text-xl text-gray-800">${activeLoan.amount}</p>
               </div>
               <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400 uppercase">Restante</p>
                  {/* Cálculo simple del restante aproximado */}
                  <p className="font-bold text-xl text-gray-800">
                    ${Math.round(activeLoan.amount - ((activeLoan.amount / activeLoan.totalPayments) * activeLoan.paymentsMade))}
                  </p>
               </div>
            </div>
          </div>
        )}

        {/* HISTORIAL */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-700">Historial de Solicitudes</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-400 uppercase font-bold text-xs">
                <tr>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Monto</th>
                  <th className="px-6 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loans.length > 0 ? loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{new Date(loan.requestDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">${loan.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                        ${loan.status === 'aprobado' ? 'bg-green-100 text-green-700' : 
                          loan.status === 'pendiente' ? 'bg-yellow-100 text-yellow-700' : 
                          loan.status === 'rechazado' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}
                      `}>
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-gray-400 italic">
                      Aún no tienes historial de préstamos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}