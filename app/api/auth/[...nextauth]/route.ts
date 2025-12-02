import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";
import { Resend } from "resend";
import { MagicLinkEmail } from "@/lib/emails/MagicLinkEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        const { host } = new URL(url);
        try {
          await resend.emails.send({
            from: 'MarketMind <info@mymarketmind.net>',
            to: identifier,
            subject: `Sign in to ${host}`,
            react: MagicLinkEmail({ url, host }),
          });
        } catch (error) {
          console.error("Failed to send verification email", error);
          throw new Error("Failed to send verification email");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  events: {
    async createUser({ user }) {
      if (user.email && user.name) {
        // Note: For email sign-in, name might be null initially.
        // We can update it later or send a generic welcome.
        await sendWelcomeEmail(user.email, user.name || "Trader");
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
