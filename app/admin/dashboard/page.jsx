"use client";
import { useEffect, useState } from "react";
import { Trash2, Shield, ShieldAlert, User as UserIcon, Loader2, MapPin, Phone, Users } from "lucide-react"; // Importamos Users para el icono
import { signOut, useSession } from "next-auth/react";
import Link from "next/link"; // Importamos Link

const theme = {
  primary: "#ff5aa4",
  lightPink: "#ffe0ee",
  white: "#ffffff"
};

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ... (El resto de tus funciones fetchUsers, handleDelete, toggleRole siguen igual) ...
  // 1. Cargar usuarios al entrar
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error cargando usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm("¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.")) return;
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    if (res.ok) {
      setUsers(users.filter(u => u.id !== userId));
      alert("Usuario eliminado");
    } else {
      alert("Error al eliminar");
    }
  };

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole })
    });
    if (res.ok) {
      fetchUsers();
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-pink-500"><Loader2 className="animate-spin w-10 h-10"/></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-10 font-sans">
      
      {/* Header del Dashboard */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Panel Administrativo</h1>
          <p style={{ color: theme.primary }} className="font-medium">Bienvenido, {session?.user?.name}</p>
        </div>
        
        <div className="flex gap-4"> {/* Contenedor para botones */}
            {/* AQUÍ AGREGAMOS EL LINK A CLIENTES */}
            <Link 
                href="/admin/clients" 
                className="px-6 py-2 bg-pink-100 text-pink-600 rounded-full text-sm font-bold hover:bg-pink-200 transition flex items-center gap-2"
            >
                <Users size={16} /> {/* Icono opcional */}
                Ver Clientes
            </Link>

            <button 
              onClick={() => signOut({ callbackUrl: '/portal' })}
              className="px-6 py-2 bg-gray-800 text-white rounded-full text-sm font-bold hover:bg-gray-700 transition"
            >
              Cerrar Sesión
            </button>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      {/* ... (El resto de tu código de la tabla sigue igual) ... */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-pink-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
             {/* ... (contenido de la tabla) ... */}
             <thead>
              <tr style={{ backgroundColor: theme.primary, color: theme.white }}>
                <th className="p-4 text-sm font-bold uppercase tracking-wider">Usuario</th>
                <th className="p-4 text-sm font-bold uppercase tracking-wider">Contacto</th>
                <th className="p-4 text-sm font-bold uppercase tracking-wider">Domicilio</th>
                <th className="p-4 text-sm font-bold uppercase tracking-wider text-center">Rol</th>
                <th className="p-4 text-sm font-bold uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-pink-50 transition duration-150">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-pink-100 p-2 rounded-full text-pink-600">
                        <UserIcon size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400 capitalize">{user.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={16} className="text-pink-400" />
                      {user.whatsapp}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col text-sm text-gray-600 max-w-xs">
                      <span className="flex items-center gap-1 font-medium"><MapPin size={14} /> CP: {user.zipCode}</span>
                      <span className="truncate" title={user.address}>{user.address}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => toggleRole(user.id, user.role)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 mx-auto transition ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700 border-purple-200' 
                          : 'bg-green-100 text-green-700 border-green-200'
                      }`}
                    >
                      {user.role === 'admin' ? <ShieldAlert size={12}/> : <Shield size={12}/>}
                      {user.role.toUpperCase()}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition"
                      title="Eliminar Usuario"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    No hay usuarios registrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}