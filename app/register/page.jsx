"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', email: '', password: '', address: '', zipCode: '', whatsapp: '', gender: 'hombre'
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      alert("Registrado! Ahora inicia sesión");
      router.push('/api/auth/signin'); 
    } else {
      alert("Error al registrar");
    }
  };

  return (
    <div className="p-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-5">Registro</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input name="name" placeholder="Nombre" onChange={handleChange} className="border p-2" required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} className="border p-2" required />
        <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} className="border p-2" required />
        
        <input name="address" placeholder="Domicilio" onChange={handleChange} className="border p-2" required />
        <input name="zipCode" placeholder="Código Postal" onChange={handleChange} className="border p-2" required />
        <input name="whatsapp" placeholder="WhatsApp" onChange={handleChange} className="border p-2" required />
        
        <select name="gender" onChange={handleChange} className="border p-2">
            <option value="hombre">Hombre</option>
            <option value="mujer">Mujer</option>
            <option value="otro">Otro</option>
        </select>

        <button type="submit" className="bg-blue-600 text-white p-2 rounded">Registrarse</button>
      </form>
    </div>
  );
}