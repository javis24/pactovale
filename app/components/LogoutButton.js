"use client";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/portal" })}
      className="text-red-500 hover:text-red-700 font-bold text-sm border border-red-200 bg-red-50 px-4 py-2 rounded-lg transition-all hover:bg-red-100 flex items-center gap-2"
    >
      Cerrar Sesión 🚪
    </button>
  );
}