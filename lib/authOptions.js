// lib/authOptions.js
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/User";
import bcrypt from "bcrypt";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await User.findOne({ where: { email: credentials.email } });
        if (!user) throw new Error("Usuario no encontrado");

        const match = await bcrypt.compare(credentials.password, user.password);
        if (!match) throw new Error("Contraseña incorrecta");

        return { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role 
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.id = token.sub; 
      }
      return session;
    }
  },
  pages: {
    signIn: '/portal',
  },
  secret: process.env.NEXTAUTH_SECRET,
};