import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextAuthOptions, DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string; // 必要であれば role も追加
    } & DefaultSession["user"]
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { 
    strategy: "jwt", // JWT is standard for modern Next.js apps
  },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: true, // Automatically pulls from .env
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

        // Standard: Return only what you need in the token
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
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string; // トークンの sub (ID) をセッションに渡す
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax', // Standard for cross-subdomain proxying
        path: '/',
        secure: true
      }
    }
  }
};

// export const authOptions: NextAuthOptions = {
//   adapter: PrismaAdapter(prisma) as any,
//   session: { 
//     strategy: "jwt",
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   // 🛡️ SECURITY: Force use of the secret from .env or a hardcoded fallback for dev
//   secret: process.env.NEXTAUTH_SECRET || "nexus-dev-secret-key-999",
//   providers: [
//     CredentialsProvider({
//       name: "Nexus Account",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" }
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) return null;
        
//         const user = await prisma.user.findUnique({
//           where: { email: credentials.email }
//         });

//         if (!user || !user.password_hash) return null;

//         const isValid = await bcrypt.compare(credentials.password, user.password_hash);
//         if (!isValid) return null;

//         return {
//           id: user.id,
//           email: user.email,
//           name: user.name,
//           role: user.role, // This will be "MEMBER" unless changed in Prisma Studio
//         };
//       }
//     })
//   ],
//   callbacks: {
//     async jwt({ token, user }: any) {
//       if (user) {
//         token.id = user.id;
//         token.role = user.role;
//       }
//       return token;
//     },
//     async session({ session, token }: any) {
//       if (session.user) {
//         (session.user as any).id = token.id;
//         (session.user as any).role = token.role;
//       }
//       return session;
//     }
//   },
//   // 🚀 Standard secure cookie settings for Cloud IDEs
//   cookies: {
//     sessionToken: {
//       name: `next-auth.session-token`,
//       options: {
//         httpOnly: true,
//         sameSite: 'lax',
//         path: '/',
//         secure: true // Required for .github.dev URLs (HTTPS)
//       }
//     }
//   }
// };