"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { signIn, getSession } from "next-auth/react"; 
import { User, Mail, Lock, MapPin, Phone, Home } from "lucide-react";


const theme = {
  primary: "#ff5aa4",
  light: "#FFFFFF",
  textInfo: "#FFE0EE"
};


export default function PortalPage() {
  const [view, setView] = useState("welcome"); 

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center sm:p-4 font-sans">
      <div 
        className="w-full h-screen sm:max-w-md sm:h-[850px] sm:rounded-[40px] shadow-none sm:shadow-2xl overflow-hidden relative transition-all duration-500 flex flex-col"
        style={{ backgroundColor: view === 'welcome' ? theme.primary : theme.light }}
      >
        {view === "welcome" && <WelcomeView onNavigate={setView} />}
        {view === "login" && <LoginView onNavigate={setView} />}
        {view === "register" && <RegisterView onNavigate={setView} />}
      </div>
    </div>
  );
}


function WelcomeView({ onNavigate }) {
  return (
    <div className="h-full flex flex-col items-center p-8 text-center animate-fade-in relative z-10">
      
    
      <div className="flex flex-col items-center mt-16 sm:mt-24 flex-grow pb-10">
        <div className="w-32 h-32 relative mb-4">
        
           <svg viewBox="0 0 24 24" fill="none" stroke={theme.light} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
             <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
             <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.92 0l2.96 2.96"/>
           </svg>
        </div>
        <h2 style={{ color: theme.light }} className="text-4xl font-bold tracking-widest">PACTOVALE</h2>
      </div>


      <div className="w-full flex flex-col gap-5 mb-24 sm:mb-32 z-20 px-4">
        <button
          onClick={() => onNavigate("login")}
          style={{ color: theme.primary, backgroundColor: theme.light }}
          className="w-full py-4 rounded-full text-xl font-bold shadow-lg transform active:scale-95 transition-all"
        >
          Iniciar Sesión
        </button>
        <button
          onClick={() => onNavigate("register")}
          style={{ color: theme.light, borderColor: theme.light }}
          className="w-full py-4 rounded-full text-xl font-bold border-2 bg-transparent active:bg-white/10 transform active:scale-95 transition-all"
        >
          Crear Cuenta
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-48 bg-white/10 rounded-t-[100%] transform translate-y-20 scale-x-150 pointer-events-none"></div>
    </div>
  );
}


function LoginView({ onNavigate }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const email = e.target.email.value;
    const password = e.target.password.value;

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res.error) {
      setError("Credenciales incorrectas");
      setLoading(false);
    } else {

      const session = await getSession(); 
      
      if (session?.user?.role === 'admin') {
        router.push("/admin/dashboard"); 
      } else {
        router.push("/perfil"); 
      }
      
      router.refresh();
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in bg-white">
      
      <div style={{ backgroundColor: theme.primary }} className="h-[25vh] sm:h-[30%] rounded-b-[50px] flex items-end p-8 w-full z-10 shadow-lg relative">
         <button 
            onClick={() => onNavigate("welcome")} 
            className="absolute top-6 left-6 text-white opacity-90 hover:opacity-100 font-bold"
         >
            ← Volver
         </button>
        <h1 style={{ color: theme.light }} className="text-4xl font-bold mb-4">¡Hola de<br />nuevo!</h1>
      </div>
      
      <div className="flex-1 px-8 flex flex-col justify-center">
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          
          {error && <p className="text-red-500 text-center text-sm font-bold bg-red-50 p-2 rounded">{error}</p>}

          <InputGroup icon={<User size={20} />} name="email" type="email" placeholder="Correo electrónico" theme={theme} />
          <InputGroup icon={<Lock size={20} />} name="password" type="password" placeholder="Contraseña" theme={theme} isPassword />
          
          <div className="mt-4">
              <button 
                disabled={loading}
                style={{ backgroundColor: theme.primary, color: theme.light }} 
                className="w-full py-4 rounded-full font-bold text-lg shadow-lg active:scale-95 transition transform disabled:opacity-70"
              >
                  {loading ? "Entrando..." : "Entrar"}
              </button>
          </div>
        </form>
      </div>

       <div className="p-8 text-center pb-12">
           <p className="text-gray-500 font-medium text-sm">
              ¿No tienes cuenta? 
              <button onClick={() => onNavigate("register")} style={{ color: theme.primary }} className="font-bold underline ml-1">
                Regístrate
              </button>
           </p>
       </div>
    </div>
  );
}


function RegisterView({ onNavigate }) {
  const [loading, setLoading] = useState(false);
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    

    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      password: e.target.password.value,
      address: e.target.address.value,
      zipCode: e.target.zipCode.value,
      whatsapp: e.target.whatsapp.value,
      gender: e.target.gender.value
    };


    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      alert("¡Cuenta creada! Por favor inicia sesión.");
      onNavigate("login");
    } else {
      const data = await res.json();
      alert("Error: " + data.message);
      setLoading(false);
    }
  };

  return (
     <div className="h-full flex flex-col animate-fade-in relative bg-white">
  
      <div style={{ backgroundColor: theme.primary }} className="shrink-0 pt-10 pb-6 px-8 w-full z-10 relative shadow-md">
        <button 
            onClick={() => onNavigate("welcome")} 
            className="absolute top-6 left-6 text-white opacity-90 hover:opacity-100 font-bold"
          >
            ← Volver
        </button>
        <h1 style={{ color: theme.light }} className="text-2xl font-bold leading-tight mt-6">Crea tu Cuenta</h1>
      </div>
      
  
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <form onSubmit={handleRegister} className="flex flex-col gap-4 pb-10">
          
          <InputGroup icon={<User size={20} />} name="name" type="text" placeholder="Nombre Completo" theme={theme} required />
          <InputGroup icon={<Mail size={20} />} name="email" type="email" placeholder="Correo Electrónico" theme={theme} required />
          <InputGroup icon={<Lock size={20} />} name="password" type="password" placeholder="Contraseña" theme={theme} isPassword required />
          
          <div className="grid grid-cols-2 gap-3">
             <InputGroup icon={<MapPin size={20} />} name="zipCode" type="text" placeholder="C.P." theme={theme} required />
             <div className="relative group">
                 <select name="gender" className="w-full py-4 pl-4 pr-4 rounded-[20px] border-2 bg-gray-50 outline-none text-gray-600 appearance-none" required>
                     <option value="hombre">Hombre</option>
                     <option value="mujer">Mujer</option>
                     <option value="otro">Otro</option>
                 </select>
             </div>
          </div>
          
          <InputGroup icon={<Home size={20} />} name="address" type="text" placeholder="Domicilio Completo" theme={theme} required />
          <InputGroup icon={<Phone size={20} />} name="whatsapp" type="text" placeholder="WhatsApp (+52...)" theme={theme} required />

          <div className="mt-4">
              <button 
                disabled={loading}
                style={{ backgroundColor: theme.primary, color: theme.light }} 
                className="w-full py-4 rounded-full font-bold text-lg shadow-lg active:scale-95 transition transform"
              >
                  {loading ? "Guardando..." : "Registrarse"}
              </button>
          </div>
        </form>

        <div className="text-center pb-8">
          <p className="text-gray-500 font-medium text-sm">
             ¿Ya tienes cuenta? 
             <button onClick={() => onNavigate("login")} style={{ color: theme.primary }} className="font-bold underline ml-1">
               Ingresa
             </button>
          </p>
        </div>
      </div>
   </div>
  );
}

function InputGroup({ icon, type, placeholder, theme, isPassword, name, required }) {
    return (
        <div className="relative group">
            <input 
                required={required}
                name={name}
                type={type} 
                placeholder={placeholder}
                style={{ borderColor: theme.primary }}
                className="w-full py-4 pl-12 pr-4 rounded-[20px] border-2 border-opacity-20 outline-none font-medium bg-gray-50 text-gray-700 placeholder-gray-400 focus:border-opacity-100 focus:bg-white focus:shadow-md transition-all text-sm sm:text-base"
            />
             <div className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-50 transition-opacity group-focus-within:opacity-100" style={{ color: theme.primary }}>
                {icon}
            </div>
        </div>
    )
}