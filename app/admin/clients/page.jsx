"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Search, User, Phone, MapPin, DollarSign, FileText, ArrowLeft, CheckCircle, Clock, PieChart } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ClientsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados para métricas globales
  const [stats, setStats] = useState({
    activeLoansCount: 0,
    totalPaymentsReceived: 0
  });

  const theme = {
    primary: "#ff5aa4",
    bg: "#fff0f7",
    white: "#ffffff"
  };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/portal");
    if (status === "authenticated") fetchClients();
  }, [status]);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        // 1. Filtrar solo usuarios (no admins)
        const onlyClients = data.filter(user => user.role === 'user');
        
        setClients(onlyClients);
        calculateStats(onlyClients);
      }
    } catch (error) {
      console.error("Error cargando clientes");
    } finally {
      setLoading(false);
    }
  };

  // --- CÁLCULO DE MÉTRICAS GLOBALES ---
  const calculateStats = (clientsData) => {
    let activeCount = 0;
    let paymentsCount = 0;

    clientsData.forEach(client => {
        if (client.Loans) {
            // Buscamos préstamo aprobado
            const active = client.Loans.find(l => l.status === 'aprobado');
            if (active) {
                activeCount++;
                paymentsCount += active.paymentsMade; // Sumamos los pagos ya realizados
            }
        }
    });

    setStats({
        activeLoansCount: activeCount,
        totalPaymentsReceived: paymentsCount
    });
  };

  // Filtrado de búsqueda
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDocUrl = (client, type) => {
    if (!client.Documents && !client[type]) return null;
    // Prioridad: Documents array -> Columna directa en User table
    const doc = client.Documents ? client.Documents.find(d => d.type === type) : null;
    return doc ? doc.url : client[type];
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#ff5aa4] font-bold">Cargando Carteras...</div>;

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: theme.bg }}>
      
      {/* HEADER */}
      <div className="bg-white shadow-sm p-6 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition">
                <ArrowLeft className="text-gray-500" />
            </Link>
            <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <User className="text-[#ff5aa4]" /> Carteras de Clientes
                </h1>
                <p className="text-sm text-gray-500">Gestión de préstamos y perfiles</p>
            </div>
          </div>
          
          {/* Barra de Búsqueda */}
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-pink-200 focus:outline-none focus:border-[#ff5aa4]"
            />
            <Search className="absolute left-3 top-2.5 text-pink-300" size={18} />
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-10">
        
        {/* Estadísticas Rápidas (AHORA CON DATOS REALES) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-[#ff5aa4]">
                <p className="text-gray-400 text-xs font-bold uppercase">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-800">{clients.length}</p>
            </div>
            
            {/* Préstamos Activos Reales */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-blue-400">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase">Préstamos Activos</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.activeLoansCount}</p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-full text-blue-400">
                        <PieChart size={24} />
                    </div>
                </div>
            </div>

            {/* Pagos Realizados Reales */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-green-400">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase">Pagos Recibidos</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.totalPaymentsReceived} <span className="text-sm font-normal text-gray-400">Quincenas</span></p>
                    </div>
                    <div className="bg-green-50 p-2 rounded-full text-green-400">
                        <CheckCircle size={24} />
                    </div>
                </div>
            </div>
        </div>

        {/* GRID DE TARJETAS DE CLIENTES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => {
            
            const selfieUrl = getDocUrl(client, 'selfie');
            
            // Lógica para detectar estado del préstamo
            const loans = client.Loans || [];
            const activeLoan = loans.find(l => l.status === 'aprobado');
            const pendingLoan = loans.find(l => l.status === 'pendiente');

            return (
              <div key={client.id} className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition border border-transparent hover:border-pink-100 group relative overflow-hidden">
                
                {/* Indicador de Estado (Banda lateral) */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${activeLoan ? 'bg-green-400' : pendingLoan ? 'bg-yellow-400' : 'bg-gray-200'}`}></div>

                {/* Encabezado */}
                <div className="flex justify-between items-start mb-4 pl-2">
                  <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#ff5aa4] flex items-center justify-center font-bold text-lg overflow-hidden border border-pink-100">
                          {selfieUrl ? (
                             <img src={selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
                          ) : (
                             client.name.charAt(0).toUpperCase()
                          )}
                      </div>
                      <div>
                          <h3 className="font-bold text-gray-800 truncate max-w-[120px]">{client.name.split(" ")[0]} {client.name.split(" ")[1] || ""}</h3>
                          <p className="text-xs text-gray-400">ID: {client.id}</p>
                      </div>
                  </div>
                  
                  {/* Etiqueta de Estado Dinámica */}
                  {activeLoan ? (
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <DollarSign size={10} /> ACTIVO
                      </span>
                  ) : pendingLoan ? (
                      <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <Clock size={10} /> PENDIENTE
                      </span>
                  ) : (
                      <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-full">
                          INACTIVO
                      </span>
                  )}
                </div>

                {/* Información de Contacto */}
                <div className="space-y-2 text-sm text-gray-600 mb-6 pl-2">
                  <div className="flex items-center gap-2">
                      <Phone size={14} className="text-pink-300" />
                      {client.whatsapp}
                  </div>
                  <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-pink-300 mt-1" />
                      <span className="line-clamp-1 text-xs">{client.address}</span>
                  </div>
                  
                  {/* SECCIÓN CLAVE: Resumen Financiero en la Tarjeta */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                      {activeLoan ? (
                          <div className="flex justify-between items-center text-sm">
                              <div>
                                  <p className="text-xs text-gray-400">Préstamo</p>
                                  <p className="font-bold text-gray-800">${activeLoan.amount}</p>
                              </div>
                              <div className="text-right">
                                  <p className="text-xs text-gray-400">Progreso</p>
                                  <p className="font-bold text-[#ff5aa4]">{activeLoan.paymentsMade}/{activeLoan.totalPayments} Pagos</p>
                              </div>
                          </div>
                      ) : pendingLoan ? (
                          <div className="text-center bg-yellow-50 rounded-lg p-2">
                              <p className="text-xs font-bold text-yellow-700">Solicitud por ${pendingLoan.amount}</p>
                              <p className="text-[10px] text-yellow-600">Requiere aprobación</p>
                          </div>
                      ) : (
                          <div className="flex items-center gap-2 text-gray-400 text-xs">
                              <FileText size={14} />
                              <span>Sin deuda actual</span>
                          </div>
                      )}
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="grid grid-cols-1 pl-2">
                  <Link 
                      href={`/admin/clients/${client.id}`}
                      className="py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-pink-200 hover:shadow-lg active:scale-95"
                      style={{ backgroundColor: theme.primary }}
                  >
                      Ver Expediente Completo
                  </Link>
                </div>

              </div>
            );
          })}
        </div>

        {filteredClients.length === 0 && (
            <div className="text-center py-20">
                <User size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-400">No se encontraron clientes.</p>
            </div>
        )}

      </div>
    </div>
  );
}