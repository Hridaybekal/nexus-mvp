import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextAuthOptions, DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"]
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { 
    strategy: "jwt",
  },
  // 🛡️ 環境変数がなくても動くようにフォールバックを設定
  secret: process.env.NEXTAUTH_SECRET || "super-secret-nexus-12345",
  
  // 🚀 Codespaces等のプロキシ環境での「Cookie無限ループ」を防ぐ設定
  cookies: {
    sessionToken: {
      name: "next-auth.session-token", // __Secure- プレフィックスを外して統一
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true // Codespaces は HTTPS アクセスなので true に固定
      }
    }
  },
  
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password_hash) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, 
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = (token.id || token.sub) as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  }
};