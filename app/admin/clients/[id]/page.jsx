"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, MapPin, CreditCard, FileCheck, User, Download, Calendar, DollarSign, Clock } from "lucide-react";

export default function ClientProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const theme = { primary: "#ff5aa4", bg: "#f8fafc" };

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
          const users = await res.json();
          const found = users.find(u => u.id.toString() === id);
          setClient(found);
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    if (id) fetchClientData();
  }, [id]);

  const handleAuthorize = async (loanId) => {
    if(!confirm("¿Confirmas que se ha realizado la transferencia bancaria al cliente?")) return;
    
    setProcessing(true);
    try {
        const res = await fetch('/api/admin/approve-loan', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ loanId })
        });

        if(res.ok) {
            alert("✅ Préstamo marcado como DEPOSITADO. El cliente ya puede ver su calendario.");
            window.location.reload();
        } else {
            alert("Error al autorizar.");
        }
    } catch (error) { alert("Error de conexión"); } finally { setProcessing(false); }
  };

  const getDocUrl = (type) => {
    if (!client) return null;
    const doc = client.Documents ? client.Documents.find(d => d.type === type) : null;
    return doc ? doc.url : (client[type] || null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-10 h-10 border-4 border-pink-200 border-t-[#ff5aa4] rounded-full animate-spin"></div></div>;
  if (!client) return <div className="min-h-screen flex flex-col items-center justify-center gap-4"><p className="text-gray-500">Cliente no encontrado</p><Link href="/admin/clients" className="text-[#ff5aa4] font-bold underline">Volver a la lista</Link></div>;

  const ineFrontUrl = getDocUrl('ineFront') || getDocUrl('ine_front');
  const ineBackUrl = getDocUrl('ineBack') || getDocUrl('ine_back');
  const selfieUrl = getDocUrl('selfie');
  const signatureUrl = getDocUrl('signature');

  const loans = client.Loans ? [...client.Loans].reverse() : [];
  const activeLoan = loans.find(l => l.status === 'aprobado' || l.status === 'pendiente');

  return (
    <div className="min-h-screen font-sans pb-10" style={{ backgroundColor: theme.bg }}>
      
      {/* HEADER */}
      <div className="relative bg-[#ff5aa4] pb-32 pt-8 px-6 shadow-lg">
         <div className="max-w-5xl mx-auto flex items-start justify-between">
            <Link href="/admin/clients" className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition backdrop-blur-sm"><ArrowLeft size={24} /></Link>
            <span className="bg-green-400/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm backdrop-blur-md">CLIENTE ACTIVO</span>
         </div>
         <div className="flex flex-col items-center mt-4 text-white">
            <div className="w-28 h-28 rounded-full border-4 border-white/30 bg-white flex items-center justify-center shadow-2xl mb-4 overflow-hidden relative">
               {selfieUrl ? <img src={selfieUrl} alt="Selfie" className="w-full h-full object-cover" /> : <span className="text-4xl font-bold text-[#ff5aa4]">{client.name.charAt(0).toUpperCase()}</span>}
            </div>
            <h1 className="text-3xl font-bold text-center px-4">{client.name}</h1>
            <p className="opacity-90 mt-1 flex items-center gap-2 text-sm"><span className="bg-white/20 px-2 py-0.5 rounded text-xs">ID: {client.id}</span>{client.email}</p>
         </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-20 space-y-6">
        
        {/* FILA 1: Info y Banco */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contacto */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b pb-2">Datos de Contacto</h3>
                <div className="space-y-5">
                    <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-[#ff5aa4]"><Phone size={20} /></div><div><p className="text-xs text-gray-400">WhatsApp</p><a href={`https://wa.me/${client.whatsapp}`} target="_blank" className="font-bold text-gray-800 hover:text-[#ff5aa4]">{client.whatsapp}</a></div></div>
                    <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-[#ff5aa4]"><MapPin size={20} /></div><div><p className="text-xs text-gray-400">Domicilio</p><p className="font-bold text-gray-800 leading-tight">{client.address}</p></div></div>
                    <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-[#ff5aa4]"><Calendar size={20} /></div><div><p className="text-xs text-gray-400">Registro</p><p className="font-bold text-gray-800">{new Date(client.createdAt).toLocaleDateString()}</p></div></div>
                </div>
            </div>

            {/* Banco y Préstamo Solicitado */}
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-lg text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2"><CreditCard size={16} /> Datos Bancarios</h3>
                    <div className="mb-4"><p className="text-xs text-gray-400 mb-1">Banco Destino</p><p className="text-2xl font-bold tracking-wide">{client.bankName || "No registrado"}</p></div>
                    <div><p className="text-xs text-gray-400 mb-2">Cuenta / CLABE</p><div className="bg-white/10 p-4 rounded-xl font-mono text-lg tracking-wider flex items-center justify-between">{client.accountNumber || "------------------"}<button onClick={() => {navigator.clipboard.writeText(client.accountNumber); alert("Copiado!");}} className="text-gray-400 hover:text-white" title="Copiar"><span className="text-xs font-sans">COPIAR</span></button></div></div>
                </div>

                {/* TARJETA DE RESUMEN DE PRÉSTAMO (NUEVO) */}
                {activeLoan && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#ff5aa4]"></div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><DollarSign size={16} /> Solicitud Actual</h3>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-3xl font-bold text-gray-800">${activeLoan.amount}</p>
                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><Clock size={14}/> {activeLoan.totalPayments} Quincenas</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${activeLoan.status === 'aprobado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {activeLoan.status}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Documentos */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b pb-2">Expediente Digital</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <DocThumbnail title="INE Frente" url={ineFrontUrl} />
                <DocThumbnail title="INE Reverso" url={ineBackUrl} />
                <DocThumbnail title="Selfie" url={selfieUrl} />
                <div className="col-span-1"><p className="text-xs font-bold text-gray-500 mb-2">Firma Pagaré</p>{signatureUrl ? (<div className="h-32 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex items-center justify-center p-2 cursor-pointer hover:bg-white transition" onClick={() => window.open(signatureUrl)}><img src={signatureUrl} className="max-w-full max-h-full opacity-80" alt="Firma" /></div>) : (<div className="h-32 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400"><span className="text-xs">Pendiente</span></div>)}</div>
            </div>
        </div>

        {/* BOTÓN DE ACCIÓN */}
        {activeLoan && activeLoan.status === 'pendiente' ? (
             <div className="pb-10 animate-pulse">
                <button 
                    onClick={() => handleAuthorize(activeLoan.id)}
                    disabled={processing}
                    className="w-full py-5 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-green-200 transition transform active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {processing ? "Procesando..." : <><FileCheck size={24} /> Confirmar Transferencia y Activar Préstamo</>}
                </button>
            </div>
        ) : null}

      </div>
    </div>
  );
}

function DocThumbnail({ title, url }) {
    return (
        <div className="col-span-1 flex flex-col">
            <p className="text-xs font-bold text-gray-500 mb-2">{title}</p>
            {url ? (
                <div className="h-32 bg-gray-100 rounded-xl overflow-hidden relative group cursor-pointer border border-gray-200" onClick={() => window.open(url, '_blank')}>
                    <img src={url} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" alt={title} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white"><Download size={20} /></div>
                </div>
            ) : (
                <div className="h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-1"><User size={20} className="opacity-20" /><span className="text-[10px] uppercase font-bold">Pendiente</span></div>
            )}
        </div>
    );
}