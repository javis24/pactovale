import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import sequelize from "@/lib/db"; 

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await sequelize.sync(); 
        const { email, password } = credentials;
        
        try {
            const user = await User.findOne({ where: { email } });
            
            if (!user) return null;
            
            const match = await bcrypt.compare(password, user.password);
            if (!match) return null;

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            };
        } catch (e) {
            console.error("Error auth:", e);
            return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/portal',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};