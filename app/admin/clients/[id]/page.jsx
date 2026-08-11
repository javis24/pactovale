"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, MapPin, CreditCard, FileCheck, User, DollarSign, Clock, CheckCircle, MessageCircle, FileText, WalletCards, X } from "lucide-react";
import dynamic from "next/dynamic";
import ContractDocument from "@/app/components/ContractPDF";
import {
  buildPaymentSchedule,
  formatPaymentDate,
  getApprovalAmountOptions,
  getFirstPaymentDate,
  getLoanPaymentAmount,
} from "@/lib/loanRules";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <span className="text-xs text-gray-400">Cargando PDF...</span> }
);

export default function ClientProfilePage() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [approvalAmount, setApprovalAmount] = useState("");

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

  const sendWhatsApp = (phoneNumber, message) => {
    let cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length === 10) cleanNumber = `52${cleanNumber}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanNumber}?text=${encodedMessage}`, '_blank');
  };

  const handleAuthorize = async (loanId) => {
    setProcessing(true);
    try {
        const res = await fetch('/api/admin/approve-loan', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ loanId, approvedAmount: Number(approvalAmount) })
        });
        if(res.ok) {
            const data = await res.json();
            const firstPayment = formatPaymentDate(data.firstPaymentDate);
            const msg = `¡Hola ${client.name}! 👋\n\n¡Felicidades! 🎉 Tu préstamo por $${Number(data.amount).toLocaleString('es-MX')} fue aprobado y depositado. Tu pago quincenal será de $${Number(data.paymentAmount).toLocaleString('es-MX')} y el primer vencimiento será el ${firstPayment}.\n\nPuedes ver tu calendario de pagos aquí: https://pactovale.com/portal`;
            sendWhatsApp(client.whatsapp, msg);
            alert("✅ Préstamo autorizado con el monto disponible en caja.");
            window.location.reload();
        } else {
            const data = await res.json();
            alert(data.message || "Error al autorizar.");
        }
    } catch { alert("Error de conexión"); } finally { setProcessing(false); }
  };

  const handleRegisterPayment = async (loanId, paymentNumber) => {
    if(!confirm(`¿Confirmas el pago de la Quincena #${paymentNumber}?`)) return;
    setProcessing(true);
    try {
        const res = await fetch('/api/admin/register-payment', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ loanId })
        });
        if(res.ok) { 
            const msg = `Hola ${client.name} 👋\n\nConfirmamos recibido tu pago de la Quincena #${paymentNumber}. ✅`;
            sendWhatsApp(client.whatsapp, msg);
            alert("✅ Pago registrado."); 
            window.location.reload(); 
        } else { const d = await res.json(); alert(d.message); }
    } catch { alert("Error de conexión"); } finally { setProcessing(false); }
  };

  const handleReminder = (paymentNumber, date) => {
      const dateStr = formatPaymentDate(date);
      const msg = `Hola ${client.name} 👋\n\nRecordatorio: Tu pago de la Quincena #${paymentNumber} vence el *${dateStr}*. ⏳`;
      sendWhatsApp(client.whatsapp, msg);
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
  const displayedPaymentAmount =
  activeLoan?.status === 'pendiente'
    ? getLoanPaymentAmount(
        activeLoan.amount,
        activeLoan.totalPayments
      ) ?? Number(activeLoan.paymentAmount || 0)
    : Number(activeLoan?.paymentAmount || 0);
  const schedule = activeLoan && activeLoan.status === 'aprobado'
    ? buildPaymentSchedule({
        startDate: activeLoan.startDate,
        totalPayments: activeLoan.totalPayments,
        paymentsMade: activeLoan.paymentsMade,
      })
    : [];
  const nextPayment = schedule.find(p => p.status === 'pendiente');
  const requestedAmount = Number(activeLoan?.requestedAmount || activeLoan?.amount || 0);
  const approvalOptions = activeLoan
    ? getApprovalAmountOptions(requestedAmount, activeLoan.totalPayments)
    : [];
  const selectedPaymentAmount = activeLoan
    ? getLoanPaymentAmount(Number(approvalAmount), activeLoan.totalPayments)
    : null;
  const estimatedFirstPayment = getFirstPaymentDate(new Date());

  const openApproval = () => {
    const initialAmount = approvalOptions[0] || requestedAmount;
    setApprovalAmount(String(initialAmount));
    setApprovalOpen(true);
  };

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
            <button 
                onClick={() => sendWhatsApp(client.whatsapp, `Hola ${client.name}, nos comunicamos de Pactovale...`)}
                className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg transition"
            >
                <MessageCircle size={16} /> Abrir Chat WhatsApp
            </button>
         </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-20 space-y-6">
        
        {/* Info y Banco */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b pb-2">Datos de Contacto</h3>
                <div className="space-y-5">
                    <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-[#ff5aa4]"><Phone size={20} /></div><div><p className="text-xs text-gray-400">WhatsApp</p><a href={`https://wa.me/${client.whatsapp}`} target="_blank" className="font-bold text-gray-800 hover:text-[#ff5aa4]">{client.whatsapp}</a></div></div>
                    <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-[#ff5aa4]"><MapPin size={20} /></div><div><p className="text-xs text-gray-400">Domicilio</p><p className="font-bold text-gray-800 leading-tight">{client.address}</p></div></div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-lg text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2"><CreditCard size={16} /> Datos Bancarios</h3>
                    <div className="mb-4"><p className="text-xs text-gray-400 mb-1">Banco Destino</p><p className="text-2xl font-bold tracking-wide">{client.bankName || "No registrado"}</p></div>
                    <div><p className="text-xs text-gray-400 mb-2">Cuenta / CLABE</p><div className="bg-white/10 p-4 rounded-xl font-mono text-lg tracking-wider flex items-center justify-between">{client.accountNumber || "------------------"}<button onClick={() => {navigator.clipboard.writeText(client.accountNumber); alert("Copiado!");}} className="text-gray-400 hover:text-white" title="Copiar"><span className="text-xs font-sans">COPIAR</span></button></div></div>
                </div>

                {activeLoan && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#ff5aa4]"></div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><DollarSign size={16} /> Préstamo Actual</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${activeLoan.status === 'aprobado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{activeLoan.status}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">
                                  {activeLoan.status === 'aprobado' ? 'Monto autorizado' : 'Monto solicitado'}
                                </p>
                                <p className="text-3xl font-bold text-gray-800">${Number(activeLoan.amount).toLocaleString('es-MX')}</p>
                                {activeLoan.status === 'aprobado' && requestedAmount !== Number(activeLoan.amount) && (
                                  <p className="mt-1 text-xs font-semibold text-gray-400 line-through">
                                    Solicitado: ${requestedAmount.toLocaleString('es-MX')}
                                  </p>
                                )}
                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><Clock size={14}/> {activeLoan.totalPayments} Quincenas</p>
                                <p className="mt-1 text-sm font-bold text-[#e9478d]">
                                  ${displayedPaymentAmount.toLocaleString('es-MX')} por quincena
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-gray-400 mb-1">PROGRESO</p>
                                <p className="text-xl font-bold text-[#ff5aa4]">{activeLoan.paymentsMade} / {activeLoan.totalPayments}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* --- CONTROL DE COBRANZA --- */}
        {activeLoan && activeLoan.status === 'aprobado' && (
             <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b pb-2 flex items-center gap-2">
                    <CheckCircle size={18} /> Control de Pagos
                </h3>

                {nextPayment ? (
                    <div className="bg-pink-50 border border-pink-100 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#ff5aa4] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                                {nextPayment.number}
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-800">Próximo Pago: Quincena {nextPayment.number}</h4>
                                <p className="text-sm text-gray-600">Fecha esperada: {formatPaymentDate(nextPayment.date)}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <button 
                                onClick={() => handleReminder(nextPayment.number, nextPayment.date)}
                                className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 px-4 py-3 rounded-xl font-bold shadow-sm flex items-center gap-2"
                            >
                                <MessageCircle size={20} /> <span className="hidden sm:inline">Recordar</span>
                            </button>
                            <button 
                                onClick={() => handleRegisterPayment(activeLoan.id, nextPayment.number)}
                                disabled={processing}
                                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
                            >
                                {processing ? "..." : "✅ Registrar Pago"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-green-100 text-green-800 p-4 rounded-xl text-center font-bold mb-6">
                        🎉 ¡Préstamo Liquidado!
                    </div>
                )}

                <div className="border rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">#</th>
                                <th className="px-4 py-3">Fecha</th>
                                <th className="px-4 py-3 text-right">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {schedule.map((pay) => (
                                <tr key={pay.number} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-bold text-gray-600">{pay.number}</td>
                                    <td className="px-4 py-3 text-gray-600">{formatPaymentDate(pay.date)}</td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${pay.status === 'pagado' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                            {pay.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
        )}

        {/* --- DOCUMENTACIÓN LEGAL --- */}
        {activeLoan && activeLoan.status === 'aprobado' && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b pb-2 flex items-center gap-2">
              <FileText size={18} /> Documentación Legal
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div>
                <h4 className="text-lg font-bold text-gray-800">Contrato de Préstamo</h4>
                <p className="text-sm text-gray-600">Incluye términos, condiciones y pagaré firmado.</p>
              </div>
              <PDFDownloadLink
                document={<ContractDocument client={client} loan={activeLoan} />}
                fileName={`Contrato_${client.name.replace(/\s+/g, '_')}.pdf`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition flex items-center gap-2"
              >
                {({ loading }) => loading ? 'Generando...' : <><FileText size={20} /> Descargar PDF</>}
              </PDFDownloadLink>
            </div>
          </div>
        )}

        {/* Documentos Visuales */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b pb-2">Expediente Digital</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <DocThumbnail title="INE Frente" url={ineFrontUrl} fileName={`INE_Frente_${client.name}.jpg`} />
                <DocThumbnail title="INE Reverso" url={ineBackUrl} fileName={`INE_Reverso_${client.name}.jpg`} />
                <DocThumbnail title="Selfie" url={selfieUrl} fileName={`Selfie_${client.name}.jpg`} />
                <div className="col-span-1"><p className="text-xs font-bold text-gray-500 mb-2">Firma Pagaré</p>{signatureUrl ? (<div className="h-32 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex items-center justify-center p-2"><img src={signatureUrl} className="max-w-full max-h-full opacity-80" alt="Firma" /></div>) : (<div className="h-32 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400"><span className="text-xs">Pendiente</span></div>)}</div>
            </div>
        </div>

        {/* BOTÓN DE ACTIVACIÓN (Si pendiente) */}
        {activeLoan && activeLoan.status === 'pendiente' ? (
             <div className="pb-10 animate-pulse">
                <button 
                    onClick={openApproval}
                    disabled={processing}
                    className="w-full py-5 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-green-200 transition active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {processing ? "Procesando..." : <><FileCheck size={24} /> Revisar monto y autorizar</>}
                </button>
            </div>
        ) : null}

      </div>

      {approvalOpen && activeLoan?.status === 'pendiente' && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6">
          <div role="dialog" aria-modal="true" aria-labelledby="approval-title" className="max-h-[92dvh] w-full overflow-y-auto rounded-t-[30px] bg-white p-6 shadow-2xl sm:max-w-lg sm:rounded-[30px] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                  <WalletCards size={24} />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-600">Disponibilidad en caja</p>
                <h2 id="approval-title" className="mt-1 text-2xl font-black text-gray-900">Autorizar préstamo</h2>
              </div>
              <button type="button" onClick={() => setApprovalOpen(false)} aria-label="Cerrar" className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">
                <X size={21} />
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-500">Monto solicitado</span>
                <strong className="text-lg text-gray-900">${requestedAmount.toLocaleString('es-MX')}</strong>
              </div>
              <div className="mt-2 flex items-center justify-between gap-4">
                <span className="text-sm text-gray-500">Plazo solicitado</span>
                <strong className="text-gray-900">{activeLoan.totalPayments} quincenas</strong>
              </div>
            </div>

            <label htmlFor="approvalAmount" className="mt-6 block text-sm font-bold text-gray-700">Monto disponible para autorizar</label>
            <select
              id="approvalAmount"
              value={approvalAmount}
              onChange={(event) => setApprovalAmount(event.target.value)}
              className="mt-2 min-h-14 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base font-bold text-gray-900 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
            >
              {approvalOptions.map((amount) => (
                <option key={amount} value={amount}>
                  ${amount.toLocaleString('es-MX')} — pago de ${getLoanPaymentAmount(amount, activeLoan.totalPayments).toLocaleString('es-MX')}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-relaxed text-gray-400">Solo se muestran montos compatibles con el plazo elegido y que no superan la solicitud.</p>

            {selectedPaymentAmount !== null && (
              <div className="mt-5 rounded-2xl border border-pink-100 bg-pink-50 p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400">Pago quincenal</p>
                    <p className="mt-1 text-xl font-black text-[#e9478d]">${selectedPaymentAmount.toLocaleString('es-MX')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400">Total programado</p>
                    <p className="mt-1 text-xl font-black text-gray-900">${(selectedPaymentAmount * activeLoan.totalPayments).toLocaleString('es-MX')}</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-pink-100 pt-4 text-sm text-gray-600">
                  Primer pago estimado: <strong>{formatPaymentDate(estimatedFirstPayment)}</strong>. Después vencerá únicamente los días 15 y 30.
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
              <button type="button" onClick={() => setApprovalOpen(false)} disabled={processing} className="min-h-13 flex-1 rounded-2xl border border-gray-200 px-5 font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                Cancelar
              </button>
              <button type="button" onClick={() => handleAuthorize(activeLoan.id)} disabled={processing || selectedPaymentAmount === null} className="min-h-13 flex-[1.35] rounded-2xl bg-green-500 px-5 font-bold text-white shadow-lg shadow-green-200 hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50">
                {processing ? "Autorizando..." : `Autorizar $${Number(approvalAmount || 0).toLocaleString('es-MX')}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DocThumbnail({ title, url, fileName }) {
    const handleDownload = (e) => {
        e.stopPropagation();
        if (!url) return;
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || 'documento.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="col-span-1 flex flex-col group">
            <p className="text-xs font-bold text-gray-500 mb-2">{title}</p>
            {url ? (
                <div className="relative h-32 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md">
                    <img src={url} className="w-full h-full object-cover" alt={title} />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <button onClick={() => window.open(url, '_blank')} className="bg-white text-gray-800 px-3 py-1 rounded-full text-xs font-bold hover:bg-gray-100">👁️ Ver</button>
                        <button onClick={handleDownload} className="bg-[#ff5aa4] text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-pink-600">⬇️ Bajar</button>
                    </div>
                </div>
            ) : (
                <div className="h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-1"><User size={20} className="opacity-20" /><span className="text-[10px]">Pendiente</span></div>
            )}
        </div>
    );
}