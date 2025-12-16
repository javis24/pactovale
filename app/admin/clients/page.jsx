"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Search, User, Phone, MapPin, DollarSign, FileText, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ClientsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
        // FILTRO CLAVE: Solo mostramos role === 'user'
        const onlyClients = data.filter(user => user.role === 'user');
        setClients(onlyClients);
      }
    } catch (error) {
      console.error("Error cargando clientes");
    } finally {
      setLoading(false);
    }
  };

  // Filtrado de búsqueda
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función auxiliar para obtener URL de documentos (se usa dentro del map)
  const getDocUrl = (client, type) => {
    if (!client.Documents) return null;
    const doc = client.Documents.find(d => d.type === type);
    return doc ? doc.url : null;
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
        
        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-[#ff5aa4]">
                <p className="text-gray-400 text-xs font-bold uppercase">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-800">{clients.length}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-blue-400 opacity-60">
                <p className="text-gray-400 text-xs font-bold uppercase">Préstamos Activos</p>
                <p className="text-2xl font-bold text-gray-800">--</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-green-400 opacity-60">
                <p className="text-gray-400 text-xs font-bold uppercase">Cobrado Hoy</p>
                <p className="text-2xl font-bold text-gray-800">$0.00</p>
            </div>
        </div>

        {/* GRID DE TARJETAS DE CLIENTES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => {
            
            // Lógica para obtener la selfie de ESTE cliente específico
            const selfieUrl = getDocUrl(client, 'selfie');

            return (
              <div key={client.id} className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition border border-transparent hover:border-pink-100 group">
                
                {/* Encabezado de la Tarjeta */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                      
                      {/* Avatar: Muestra Selfie si existe, si no, la Inicial */}
                      <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#ff5aa4] flex items-center justify-center font-bold text-lg overflow-hidden border border-pink-100">
                          {selfieUrl ? (
                             <img src={selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
                          ) : (
                             client.name.charAt(0).toUpperCase()
                          )}
                      </div>

                      <div>
                          <h3 className="font-bold text-gray-800">{client.name}</h3>
                          <p className="text-xs text-gray-400">ID: {client.id}</p>
                      </div>
                  </div>
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full">
                      ACTIVO
                  </span>
                </div>

                {/* Información */}
                <div className="space-y-3 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                      <Phone size={16} className="text-pink-300" />
                      {client.whatsapp}
                  </div>
                  <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-pink-300 mt-1" />
                      <span className="line-clamp-2">{client.address}, CP: {client.zipCode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <FileText size={16} className="text-pink-300" />
                      <span className="text-gray-400 italic">Sin préstamos activos</span>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <Link 
                      href={`/admin/clients/${client.id}`}
                      className="py-2 rounded-xl text-gray-500 font-bold text-xs bg-gray-50 hover:bg-gray-100 transition flex items-center justify-center border border-gray-100"
                  >
                      Ver Perfil
                  </Link>
                  <button 
                      onClick={() => alert("Próximamente: Crear préstamo para " + client.name)}
                      className="py-2 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-pink-200 group-hover:shadow-pink-300"
                      style={{ backgroundColor: theme.primary }}
                  >
                      <DollarSign size={14} />
                      Préstamo
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {filteredClients.length === 0 && (
            <div className="text-center py-20">
                <User size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-400">No se encontraron clientes registrados.</p>
            </div>
        )}

      </div>
    </div>
  );
}