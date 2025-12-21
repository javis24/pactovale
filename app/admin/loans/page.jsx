"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function LoansMonitorPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Tema
  const theme = { primary: "#ff5aa4" };

  useEffect(() => {
    // Simulamos traer todos los usuarios y filtramos los que tienen préstamos
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/users'); // Asegúrate que tu API traiga la relación { include: [Loan] }
        if (res.ok) {
          const data = await res.json();
          // Filtramos solo usuarios que tengan al menos 1 préstamo
          const withLoans = data.filter(u => u.Loans && u.Loans.length > 0);
          setClients(withLoans);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Función para determinar el estado de salud del préstamo (Semáforo)
  // Nota: Aquí podrías usar lógica real de fechas si las tuvieras.
  const getHealthStatus = (loan) => {
    if (loan.status === 'pagado') return { color: 'bg-gray-100 text-gray-500', icon: <CheckCircle size={14}/>, label: 'Finalizado' };
    if (loan.status === 'pendiente') return { color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={14}/>, label: 'Autorización' };
    
    // Lógica simulada: Si lleva menos de la mitad de pagos es "Normal", si no, "Alerta" (puedes ajustar esto)
    const progress = loan.paymentsMade / loan.totalPayments;
    if (progress >= 1) return { color: 'bg-green-100 text-green-700', icon: <CheckCircle size={14}/>, label: 'Al corriente' };
    
    return { color: 'bg-green-50 text-green-700', icon: <ActivityIcon />, label: 'Activo' };
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Monitor de Cobranza</h1>
            <p className="text-gray-500">Supervisa el progreso y cumplimiento de pagos.</p>
        </div>
        
        {/* Buscador */}
        <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Buscar cliente..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#ff5aa4] w-full md:w-80 shadow-sm"
            />
        </div>
      </div>

      {/* TABLA DE PRÉSTAMOS */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Cliente</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Monto Total</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Progreso de Pagos</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Estatus</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {loading ? (
                        <tr><td colSpan="5" className="px-6 py-8 text-center">Cargando datos...</td></tr>
                    ) : filteredClients.length > 0 ? (
                        filteredClients.map(client => {
                            // Tomamos el préstamo más reciente o activo
                            const activeLoan = client.Loans.find(l => l.status === 'aprobado' || l.status === 'pendiente') || client.Loans[client.Loans.length - 1];
                            const health = getHealthStatus(activeLoan);
                            const percent = Math.round((activeLoan.paymentsMade / activeLoan.totalPayments) * 100) || 0;

                            return (
                                <tr key={client.id} className="hover:bg-gray-50 transition group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-pink-100 text-[#ff5aa4] font-bold flex items-center justify-center">
                                                {client.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{client.name}</p>
                                                <p className="text-xs text-gray-400">{client.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-800">${activeLoan.amount}</p>
                                        <p className="text-xs text-gray-400">{activeLoan.totalPayments} Quincenas</p>
                                    </td>

                                    <td className="px-6 py-4 w-64">
                                        <div className="flex justify-between text-xs font-bold mb-1">
                                            <span className="text-gray-600">{activeLoan.paymentsMade} de {activeLoan.totalPayments}</span>
                                            <span className="text-[#ff5aa4]">{percent}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${percent === 100 ? 'bg-green-500' : 'bg-[#ff5aa4]'}`} 
                                                style={{ width: `${percent}%` }}
                                            ></div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${health.color}`}>
                                            {health.icon} {health.label}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <Link href={`/admin/clients/${client.id}`}>
                                            <button className="text-gray-400 hover:text-[#ff5aa4] font-bold text-sm transition flex items-center gap-1">
                                                Ver Perfil
                                            </button>
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">No hay préstamos activos.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

function ActivityIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
    )
}