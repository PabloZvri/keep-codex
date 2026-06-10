import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import type { Provider } from "next-auth/providers";

// Pinterest uses standard OAuth2
const Pinterest: Provider = {
  id: "pinterest",
  name: "Pinterest",
  type: "oauth",
  authorization: {
    url: "https://www.pinterest.com/oauth/",
    params: {
      scope: "boards:read,pins:read",
      response_type: "code",
    },
  },
  token: "https://api.pinterest.com/v5/oauth/token",
  userinfo: "https://api.pinterest.com/v5/user_account",
  profile(profile) {
    return {
      id: profile.username,
      name: profile.username,
      email: null,
      image: profile.profile_image,
    };
  },
  clientId: process.env.PINTEREST_CLIENT_ID,
  clientSecret: process.env.PINTEREST_CLIENT_SECRET,
};

// Are.na OAuth2
const Arena: Provider = {
  id: "arena",
  name: "Are.na",
  type: "oauth",
  authorization: {
    url: "https://dev.are.na/oauth/authorize",
    params: {
      response_type: "code",
    },
  },
  token: "https://dev.are.na/oauth/token",
  userinfo: "https://api.are.na/v2/me",
  profile(profile) {
    return {
      id: String(profile.id),
      name: profile.username,
      email: null,
      image: profile.avatar_image?.display ?? null,
    };
  },
  clientId: process.env.ARENA_CLIENT_ID,
  clientSecret: process.env.ARENA_CLIENT_SECRET,
};

export const authConfig: NextAuthConfig = {
  providers: [Pinterest, Arena],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account }) {
      // Store access token per provider
      if (account) {
        token[`${account.provider}_access_token`] = account.access_token;
        token[`${account.provider}_account_id`] = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub ?? "";
      // Expose tokens to the session (server-only via getServerSession)
      (session as Record<string, unknown> & typeof session).pinterest_access_token =
        token.pinterest_access_token;
      (session as Record<string, unknown> & typeof session).arena_access_token =
        token.arena_access_token;
      (session as Record<string, unknown> & typeof session).pinterest_account_id =
        token.pinterest_account_id;
      (session as Record<string, unknown> & typeof session).arena_account_id =
        token.arena_account_id;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
