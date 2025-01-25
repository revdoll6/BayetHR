import { NextAuthOptions, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { db } from './db';

export const authOptions: NextAuthOptions = {
  providers: [],
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session?.user) {
        const admin = await db.admin.findUnique({
          where: { email: session.user.email! },
          select: { id: true, role: true },
        });

        if (admin) {
          return {
            ...session,
            user: {
              ...session.user,
              id: admin.id,
              role: admin.role,
            },
          };
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
