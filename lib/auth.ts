import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import { Role, OnboardingStatus } from '@prisma/client';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        // Get user data from database
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email! },
          include: {
            organization: true,
            classrooms: true
          }
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role;
          session.user.onboardingStatus = dbUser.onboardingStatus;
          session.user.organizationId = dbUser.organizationId;
          session.user.organizationRole = dbUser.organizationRole;
          session.user.preferredLanguage = dbUser.preferredLanguage;
          session.user.learningStyle = dbUser.learningStyle;
          session.user.teachingStyle = dbUser.teachingStyle;
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          });

          if (!existingUser) {
            // Create new user
            await prisma.user.create({
              data: {
                email: user.email!,
                fullName: user.name || 'Unknown User',
                role: Role.EDUCATOR,
                onboardingStatus: OnboardingStatus.INCOMPLETE,
                clerkId: user.id // Use NextAuth user ID as clerkId for compatibility
              }
            });
          }
          return true;
        } catch (error) {
          console.error('Sign in error:', error);
          return false;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'database',
  },
};