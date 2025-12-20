"use client";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Camera, CreditCard, ChevronRight, ChevronLeft, CheckCircle, Image as ImageIcon, ArrowLeft, PenTool, Eraser, DollarSign, Calendar, Calculator } from "lucide-react";
import SignatureCanvas from 'react-signature-canvas';
import Link from "next/link";

// --- DATOS DE LA TABLA "PLATA ORO DIAMANTE" ---
// Digitalización exacta de tu imagen para el cotizador
const LOAN_TABLE = {
  1000: { 6: 266, 8: 208, 10: 178 },
  1500: { 6: 385, 8: 299, 10: 254 },
  2000: { 6: 504, 8: 389, 10: 329 },
  2500: { 6: 624, 8: 480, 10: 405 },
  3000: { 6: 743, 8: 570, 10: 480 },
  3500: { 6: 862, 8: 661, 10: 556 },
  4000: { 6: 982, 8: 751, 10: 631 },
  4500: { 8: 842, 10: 707 },        // No hay 6 quincenas
  5000: { 8: 932, 10: 782 },
  5500: { 8: 1023, 10: 858 },
  6000: { 8: 1113, 10: 933 },
  6500: { 10: 1009 },               // Solo 10 quincenas en adelante
  7000: { 10: 1084 },
  7500: { 10: 1160 },
  8000: { 10: 1235 },
  8500: { 10: 1311 },
  9000: { 10: 1386 },
  9500: { 10: 1462 },
  10000: { 10: 1537 }
};

export default function LoanRequestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const sigCanvas = useRef({});

  // --- ESTADOS ---
  const [step, setStep] = useState(1); // 1: INE, 2: Selfie, 3: Cotizador, 4: Pagaré, 5: Banco
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [compressing, setCompressing] = useState(false);

  // Datos del Préstamo (Cotizador)
  const [loanSelection, setLoanSelection] = useState({
    amount: 1000,    // Monto seleccionado
    term: 6,         // Plazo seleccionado (6, 8, 10)
    payment: 266     // Pago quincenal calculado
  });

  // Datos de Archivos
  const [files, setFiles] = useState({ ineFront: null, ineBack: null, selfie: null });
  const [previews, setPreviews] = useState({ ineFront: null, ineBack: null, selfie: null });

  // Firma
  const [signatureImage, setSignatureImage] = useState(null);

  // Banco
  const [bankData, setBankData] = useState({ bankName: '', accountNumber: '' });

  const theme = { primary: "#ff5aa4", bg: "#f8fafc" };

  if (status === "unauthenticated") router.push("/portal");

  // --- LÓGICA DEL COTIZADOR ---
  const handleAmountChange = (newAmount) => {
    const amount = parseInt(newAmount);
    const availableTerms = LOAN_TABLE[amount];
    
    // Si el plazo actual no existe para este monto (ej: 4500 a 6 q), cambiamos al más cercano
    let newTerm = loanSelection.term;
    if (!availableTerms[newTerm]) {
        // Buscamos el primer plazo disponible (ej: 8 o 10)
        newTerm = parseInt(Object.keys(availableTerms)[0]);
    }

    setLoanSelection({
        amount: amount,
        term: newTerm,
        payment: availableTerms[newTerm]
    });
  };

  const handleTermChange = (newTerm) => {
    const term = parseInt(newTerm);
    setLoanSelection(prev => ({
        ...prev,
        term: term,
        payment: LOAN_TABLE[prev.amount][term]
    }));
  };

  // Función para convertir Archivo -> Texto (Base64)
        const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            if (!file) return resolve(null);
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
        };

  // --- LÓGICA DE COMPRESIÓN IMÁGENES ---
  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 1200;
          let width = img.width; let height = img.height;
          if (width > height) { if (width > maxSize) { height *= maxSize / width; width = maxSize; } } 
          else { if (height > maxSize) { width *= maxSize / height; height = maxSize; } }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            const newFile = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
            resolve(newFile);
          }, 'image/jpeg', 0.7);
        };
      };
    });
  };

  const handleFileChange = async (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setCompressing(true);
      try {
        const compressedFile = await compressImage(file);
        setFiles(prev => ({ ...prev, [field]: compressedFile }));
        setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(compressedFile) }));
      } catch (error) { alert("Error procesando imagen."); } 
      finally { setCompressing(false); }
    }
  };

  // --- LÓGICA DE FIRMA ---
  const handleSaveSignature = () => {
    if (sigCanvas.current.isEmpty()) { alert("Por favor firma el documento."); return; }
    setSignatureImage(sigCanvas.current.getTrimmedCanvas().toDataURL('image/png'));
    setStep(5); // Ir al Banco
  };

  const clearSignature = () => {
    sigCanvas.current.clear();
    setSignatureImage(null);
  };

// --- ENVÍO FINAL CORREGIDO ---
  const handleSubmit = async () => {
    setLoading(true);

    try {
      // 1. Convertir las imágenes a texto (Base64) para enviarlas en JSON
      const ineFrontB64 = await fileToBase64(files.ineFront);
      const ineBackB64 = await fileToBase64(files.ineBack);
      const selfieB64 = await fileToBase64(files.selfie);

      // 2. Preparar el paquete de datos
      const payload = {
        amount: loanSelection.amount,
        term: loanSelection.term,       // Enviamos el plazo
        payment: loanSelection.payment, // Enviamos el pago calculado
        bankName: bankData.bankName,
        accountNumber: bankData.accountNumber,
        signature: signatureImage,      // Ya está en Base64
        ineFront: ineFrontB64,
        ineBack: ineBackB64,
        selfie: selfieB64
      };

      // 3. Enviar a la API correcta (/api/loan)
      const res = await fetch('/api/loan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Importante: Decirle que es JSON
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/perfil'), 3000);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al enviar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center animate-fade-in">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"><CheckCircle size={50} className="text-green-500" /></div>
        <h1 className="text-2xl font-bold text-gray-800">¡Solicitud Completada!</h1>
        <p className="text-gray-500 mt-2">Tu préstamo de ${loanSelection.amount} está siendo procesado.</p>
    </div>
  );

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ backgroundColor: theme.bg }}>
      
      {/* HEADER */}
      <div className="bg-white p-4 flex items-center shadow-sm relative z-20">
        <Link href="/portal" className="p-2 -ml-2 text-gray-400 hover:text-gray-600"><ArrowLeft size={24} /></Link>
        <div className="flex-1 text-center pr-8">
            <h1 className="font-bold text-gray-800">Solicitud de Préstamo</h1>
            <div className="flex justify-center gap-2 mt-2">
                {[1, 2, 3, 4, 5].map(s => (
                    <div key={s} className={`h-1.5 w-6 rounded-full transition-all ${step >= s ? 'bg-[#ff5aa4]' : 'bg-gray-200'}`}></div>
                ))}
            </div>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col max-w-lg mx-auto w-full">
        {compressing && <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm"><div className="bg-white p-4 rounded-xl font-bold">Procesando imagen...</div></div>}
        
        {/* === PASO 1: INE === */}
        {step === 1 && (
          <div className="flex flex-col h-full animate-fade-in">
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">1. Identificación</h2>
                <p className="text-sm text-gray-500">Sube foto de tu INE.</p>
            </div>
            <div className="space-y-4 flex-1">
                <ImageUploadBox label="Frente INE" preview={previews.ineFront} onChange={(e) => handleFileChange(e, 'ineFront')} icon={<ImageIcon />} />
                <ImageUploadBox label="Reverso INE" preview={previews.ineBack} onChange={(e) => handleFileChange(e, 'ineBack')} icon={<ImageIcon />} />
            </div>
            <button onClick={() => setStep(2)} disabled={!files.ineFront || !files.ineBack} className="w-full py-4 mt-6 rounded-xl text-white font-bold shadow-lg disabled:opacity-50" style={{ backgroundColor: theme.primary }}>Siguiente</button>
          </div>
        )}

        {/* === PASO 2: SELFIE === */}
        {step === 2 && (
          <div className="flex flex-col h-full animate-fade-in">
             <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">2. Verificación Facial</h2>
                <p className="text-sm text-gray-500">Tómate una selfie clara.</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
                <label className="relative cursor-pointer group">
                    <input type="file" accept="image/*" capture="user" onChange={(e) => handleFileChange(e, 'selfie')} className="hidden" />
                    <div className={`w-64 h-64 rounded-full border-4 flex items-center justify-center overflow-hidden shadow-xl transition-all ${previews.selfie ? 'border-[#ff5aa4]' : 'border-gray-200 border-dashed bg-gray-50'}`}>
                        {previews.selfie ? <img src={previews.selfie} className="w-full h-full object-cover" /> : <Camera size={60} className="text-gray-400" />}
                    </div>
                </label>
            </div>
            <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="px-6 py-4 rounded-xl border border-gray-200"><ChevronLeft /></button>
                <button onClick={() => setStep(3)} disabled={!files.selfie} className="flex-1 py-4 rounded-xl text-white font-bold shadow-lg disabled:opacity-50" style={{ backgroundColor: theme.primary }}>Siguiente</button>
            </div>
          </div>
        )}

        {/* === PASO 3: COTIZADOR (NUEVO) === */}
        {step === 3 && (
            <div className="flex flex-col h-full animate-fade-in">
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">3. Cotiza tu Préstamo</h2>
                    <p className="text-sm text-gray-500">Elige cuánto necesitas y cuándo pagar.</p>
                </div>

                <div className="flex-1 space-y-6">
                    {/* Selector de Monto */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <label className="block text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
                            <DollarSign size={16} className="text-green-500"/> ¿Cuánto necesitas?
                        </label>
                        <select 
                            value={loanSelection.amount} 
                            onChange={(e) => handleAmountChange(e.target.value)}
                            className="w-full p-4 text-xl font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#ff5aa4] appearance-none"
                        >
                            {Object.keys(LOAN_TABLE).map(amt => (
                                <option key={amt} value={amt}>${amt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Selector de Plazo (Botones) */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <label className="block text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
                            <Calendar size={16} className="text-blue-500"/> Plazo (Quincenas)
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {[6, 8, 10].map(term => {
                                const isAvailable = LOAN_TABLE[loanSelection.amount][term];
                                const isSelected = loanSelection.term === term;
                                return (
                                    <button
                                        key={term}
                                        onClick={() => isAvailable && handleTermChange(term)}
                                        disabled={!isAvailable}
                                        className={`py-3 rounded-xl font-bold text-sm transition-all border-2 
                                            ${isSelected ? 'border-[#ff5aa4] bg-pink-50 text-[#ff5aa4]' : 
                                              isAvailable ? 'border-gray-200 text-gray-600 hover:border-pink-200' : 
                                              'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'}`}
                                    >
                                        {term} Qnas
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Resultado del Cálculo */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-3xl text-white shadow-xl">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400 text-xs uppercase tracking-widest">Tu pago quincenal</span>
                            <Calculator size={20} className="opacity-50"/>
                        </div>
                        <div className="text-4xl font-bold tracking-tight mb-1">
                            ${loanSelection.payment}
                        </div>
                        <p className="text-xs text-gray-400">
                            Total a pagar: ${loanSelection.payment * loanSelection.term}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button onClick={() => setStep(2)} className="px-6 py-4 rounded-xl border border-gray-200"><ChevronLeft /></button>
                    <button onClick={() => setStep(4)} className="flex-1 py-4 rounded-xl text-white font-bold shadow-lg" style={{ backgroundColor: theme.primary }}>
                        Elegir este plan
                    </button>
                </div>
            </div>
        )}

        {/* === PASO 4: PAGARÉ (CON DATOS PRE-LLENADOS) === */}
        {step === 4 && (
            <div className="flex flex-col h-full animate-fade-in">
                <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">4. Firma del Pagaré</h2>
                    <p className="text-sm text-gray-500">Revisa los datos y firma.</p>
                </div>

                <div className="flex-1 border-4 border-double border-green-600 bg-[#f4f9f4] p-4 rounded-lg shadow-sm relative overflow-hidden flex flex-col">
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                        <h1 className="text-6xl font-bold text-green-800 -rotate-45">PAGARÉ</h1>
                    </div>

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-center border-b border-green-600/30 pb-2 mb-4">
                            <span className="font-bold text-green-800 text-lg uppercase tracking-widest">Pagaré</span>
                            <div className="text-right">
                                <p className="text-[10px] text-green-700 font-bold">MONTO PRINCIPAL:</p>
                                <div className="text-green-900 font-bold text-xl font-mono">
                                    ${loanSelection.amount}.00
                                </div>
                            </div>
                        </div>

                        <div className="text-xs text-green-900 text-justify leading-relaxed mb-4">
                            <p>
                                Por este <strong>PAGARÉ</strong> me obligo incondicionalmente a pagar a la orden de <strong>PACTOVALE S.A. DE C.V.</strong> 
                                en <strong>Gómez Palacio, Dgo.</strong> el día <strong>{new Date().toLocaleDateString()}</strong>.
                            </p>
                            <p className="mt-2 bg-green-100/50 p-2 rounded border border-green-200">
                                Reconozco deber la cantidad de <strong>${loanSelection.amount}</strong>, la cual me comprometo a liquidar mediante 
                                <strong> {loanSelection.term} pagos quincenales</strong> consecutivos de <strong>${loanSelection.payment}</strong> cada uno.
                            </p>
                            <p className="mt-2">
                                El incumplimiento causará intereses moratorios al tipo del <strong>10% mensual</strong>.
                            </p>
                            <p className="mt-4 font-bold">Suscriptor (Deudor):</p>
                            <p className="border-b border-green-600/50 py-1 uppercase">{session?.user?.name}</p>
                        </div>

                        <div className="mt-auto">
                            <p className="text-center font-bold text-green-800 text-sm mb-1">Firma Digital</p>
                            <div className="border-2 border-dashed border-green-500 bg-white rounded-lg relative h-32 touch-none">
                                <SignatureCanvas ref={sigCanvas} penColor="black" canvasProps={{ className: 'w-full h-full rounded-lg' }} />
                                <button onClick={clearSignature} className="absolute top-2 right-2 text-red-500 bg-white p-1 rounded-full shadow border border-red-100"><Eraser size={14} /></button>
                                {!signatureImage && <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20"><span className="text-gray-400 text-xs">Firma aquí</span></div>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep(3)} className="px-6 py-4 rounded-xl border border-gray-200"><ChevronLeft /></button>
                    <button onClick={handleSaveSignature} className="flex-1 py-4 rounded-xl text-white font-bold shadow-lg" style={{ backgroundColor: theme.primary }}>Aceptar y Firmar</button>
                </div>
            </div>
        )}

        {/* === PASO 5: BANCO === */}
        {step === 5 && (
          <div className="flex flex-col h-full animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-gray-800">5. Depósito</h2>
                <p className="text-sm text-gray-500">Cuenta donde recibirás los ${loanSelection.amount}.</p>
            </div>
            <div className="flex-1 space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Banco</label>
                    <div className="relative">
                        <CreditCard className="absolute left-4 top-4 text-black-400" size={20} />
                        <input type="text" placeholder="Ej. BBVA" value={bankData.bankName} onChange={(e) => setBankData({...bankData, bankName: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#ff5aa4]" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Cuenta / CLABE</label>
                    <input type="number" placeholder="18 dígitos" value={bankData.accountNumber} onChange={(e) => setBankData({...bankData, accountNumber: e.target.value})} className="w-full px-4 py-4 bg-white border border-black-200 rounded-xl outline-none focus:border-[#ff5aa4] font-mono" />
                </div>
            </div>
            <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(4)} className="px-6 py-4 rounded-xl border border-gray-200"><ChevronLeft /></button>
                <button onClick={handleSubmit} disabled={loading || !bankData.bankName || bankData.accountNumber.length < 10} className="flex-1 py-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold shadow-lg" >
                    {loading ? "Enviando..." : "Finalizar Solicitud"}
                </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function ImageUploadBox({ label, preview, onChange, icon }) {
    return (
        <label className="block cursor-pointer group">
            <span className="text-sm font-bold text-gray-600 mb-2 block ml-1">{label}</span>
            <input type="file" accept="image/*" onChange={onChange} className="hidden" />
            <div className={`w-full h-32 rounded-2xl border-2 border-dashed flex items-center justify-center relative overflow-hidden transition-all ${preview ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
                {preview ? <><img src={preview} className="w-full h-full object-cover opacity-60" /><div className="absolute inset-0 flex items-center justify-center"><span className="bg-white/90 text-green-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1"><CheckCircle size={14} /> Listo</span></div></> : <div className="flex flex-col items-center text-gray-400 group-hover:text-[#ff5aa4]"><div className="p-2 bg-gray-100 rounded-full mb-2">{icon}</div><span className="text-xs font-medium">Toca para subir</span></div>}
            </div>
        </label>
    );
}