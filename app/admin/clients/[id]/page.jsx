"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, MapPin, CreditCard, FileCheck, User, Download, Calendar } from "lucide-react";

export default function ClientProfilePage() {
  const { id } = useParams(); // Obtenemos el ID de la URL (ej: 2)
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  // Colores del tema
  const theme = {
    primary: "#ff5aa4",
    bg: "#f8fafc",
    white: "#ffffff"
  };

  useEffect(() => {
    // Nota: En un sistema real grande, harías un endpoint específico /api/admin/users/[id]
    // Aquí reutilizamos la lista completa y filtramos por simplicidad.
    const fetchClientData = async () => {
      try {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
          const users = await res.json();
          // Buscamos el usuario cuyo ID coincida con el de la URL
          const found = users.find(u => u.id.toString() === id);
          setClient(found);
        }
      } catch (error) {
        console.error("Error al cargar perfil", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchClientData();
  }, [id]);

  // Función para extraer la URL de la foto desde el array de Documents
  const getDocUrl = (type) => {
    if (!client || !client.Documents) return null;
    const doc = client.Documents.find(d => d.type === type);
    return doc ? doc.url : null;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-pink-200 border-t-[#ff5aa4] rounded-full animate-spin"></div>
    </div>
  );

  if (!client) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Cliente no encontrado</p>
        <Link href="/admin/clients" className="text-[#ff5aa4] font-bold underline">Volver a la lista</Link>
    </div>
  );

  // Extraemos las URLs para usarlas fácil en el HTML
  const ineFrontUrl = getDocUrl('ine_front');
  const ineBackUrl = getDocUrl('ine_back');
  const selfieUrl = getDocUrl('selfie');
  const signatureUrl = getDocUrl('signature');

  return (
    <div className="min-h-screen font-sans pb-10" style={{ backgroundColor: theme.bg }}>
      
      {/* --- HEADER SUPERIOR --- */}
      <div className="relative bg-[#ff5aa4] pb-32 pt-8 px-6 shadow-lg">
         <div className="max-w-5xl mx-auto flex items-start justify-between">
            {/* Botón Volver */}
            <Link href="/admin/clients" className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition backdrop-blur-sm">
                <ArrowLeft size={24} />
            </Link>
            
            {/* Etiqueta de Estado */}
            <span className="bg-green-400/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm backdrop-blur-md">
                CLIENTE ACTIVO
            </span>
         </div>

         {/* Información Principal Centrada */}
         <div className="flex flex-col items-center mt-4 text-white">
            <div className="w-28 h-28 rounded-full border-4 border-white/30 bg-white flex items-center justify-center shadow-2xl mb-4 overflow-hidden relative">
                {selfieUrl ? (
                    <img src={selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-4xl font-bold text-[#ff5aa4]">{client.name.charAt(0).toUpperCase()}</span>
                )}
            </div>
            <h1 className="text-3xl font-bold text-center px-4">{client.name}</h1>
            <p className="opacity-90 mt-1 flex items-center gap-2 text-sm">
                <span className="bg-white/20 px-2 py-0.5 rounded text-xs">ID: {client.id}</span>
                {client.email}
            </p>
         </div>
      </div>

      {/* --- CONTENIDO TARJETAS (Overlap effect) --- */}
      <div className="max-w-5xl mx-auto px-4 -mt-20 space-y-6">
        
        {/* FILA 1: Información Personal y Bancaria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Tarjeta de Contacto */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b pb-2">Datos de Contacto</h3>
                <div className="space-y-5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-[#ff5aa4]">
                            <Phone size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Teléfono / WhatsApp</p>
                            <a href={`https://wa.me/${client.whatsapp}`} target="_blank" className="font-bold text-gray-800 hover:text-[#ff5aa4] transition">
                                {client.whatsapp}
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-[#ff5aa4]">
                            <MapPin size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Domicilio</p>
                            <p className="font-bold text-gray-800 leading-tight">{client.address}</p>
                            <p className="text-xs text-gray-500 mt-0.5">CP: {client.zipCode}</p>
                        </div>
                    </div>

                     <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-[#ff5aa4]">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Registrado desde</p>
                            <p className="font-bold text-gray-800">
                                {new Date(client.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tarjeta Bancaria */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-lg text-white relative overflow-hidden">
                {/* Decoración de fondo */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
                
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                    <CreditCard size={16} /> Datos Bancarios
                </h3>

                <div className="mb-8">
                    <p className="text-xs text-gray-400 mb-1">Banco Destino</p>
                    <p className="text-2xl font-bold tracking-wide">{client.bankName || "No registrado"}</p>
                </div>

                <div>
                    <p className="text-xs text-gray-400 mb-2">Cuenta / CLABE</p>
                    <div className="bg-white/10 p-4 rounded-xl font-mono text-lg tracking-wider flex items-center justify-between">
                        {client.accountNumber || "------------------"}
                        <button 
                            onClick={() => {navigator.clipboard.writeText(client.accountNumber); alert("Copiado!");}}
                            className="text-gray-400 hover:text-white"
                            title="Copiar"
                        >
                            <span className="text-xs font-sans">COPIAR</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* FILA 2: Documentación Visual */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b pb-2">Expediente Digital</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Componente de Miniatura de Documento */}
                <DocThumbnail title="INE Frente" url={ineFrontUrl} />
                <DocThumbnail title="INE Reverso" url={ineBackUrl} />
                <DocThumbnail title="Selfie Verificación" url={selfieUrl} />
                
                {/* Firma (Visualización especial) */}
                <div className="col-span-1">
                    <p className="text-xs font-bold text-gray-500 mb-2">Firma Pagaré</p>
                    {signatureUrl ? (
                        <div className="h-32 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex items-center justify-center p-2 cursor-pointer hover:bg-white transition" onClick={() => window.open(signatureUrl)}>
                            <img src={signatureUrl} className="max-w-full max-h-full opacity-80" alt="Firma" />
                        </div>
                    ) : (
                        <div className="h-32 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400">
                           <span className="text-xs">Pendiente</span>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Botón de Acción Final */}
        <div className="pb-10">
            <button 
                onClick={() => alert("Aquí iría la lógica para aprobar el préstamo y marcarlo como depositado.")}
                className="w-full py-5 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-green-200 transition transform active:scale-95 flex items-center justify-center gap-3"
            >
                <FileCheck size={24} />
                Validar Documentos y Autorizar Depósito
            </button>
        </div>

      </div>
    </div>
  );
}

// Sub-componente para mostrar las fotos pequeñas
function DocThumbnail({ title, url }) {
    return (
        <div className="col-span-1 flex flex-col">
            <p className="text-xs font-bold text-gray-500 mb-2">{title}</p>
            {url ? (
                <div 
                    className="h-32 bg-gray-100 rounded-xl overflow-hidden relative group cursor-pointer border border-gray-200"
                    onClick={() => window.open(url, '_blank')}
                >
                    <img src={url} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" alt={title} />
                    
                    {/* Overlay al pasar mouse */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                        <Download size={20} />
                    </div>
                </div>
            ) : (
                <div className="h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-1">
                    <User size={20} className="opacity-20" />
                    <span className="text-[10px] uppercase font-bold">Pendiente</span>
                </div>
            )}
        </div>
    );
}