import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [CredentialsProvider({
    name: "Email и пароль",
    credentials: { email: { label: "Email", type: "email" }, password: { label: "Пароль", type: "password" } },
    async authorize(credentials) {
      if (!credentials?.email || !credentials.password) return null;
      const user = await prisma.user.findUnique({ where: { email: credentials.email } });
      if (!user || !(await bcrypt.compare(credentials.password, user.password))) return null;
      return { id: user.id, name: user.name, email: user.email };
    }
  })],
  pages: { signIn: "/login" }
};
