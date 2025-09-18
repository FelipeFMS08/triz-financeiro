import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";


export const auth = betterAuth({
  database: drizzleAdapter( db, {
    provider: "sqlite"
  }),
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    cookiePrefix: "triz_auth",
    secret: process.env.BETTER_AUTH_SECRET!,
    baseUrl: process.env.BETTER_AUTH_URL!,
  },
  session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24
    },
    cookies: {
    sessionToken: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict", // ou "strict" se app for só em um domínio
      path: "/",
    },
  },
});