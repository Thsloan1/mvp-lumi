import React from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { OnboardingWizard } from '../src/components/Onboarding/OnboardingWizard';

export default function Onboarding() {
  return <OnboardingWizard />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  // If already completed onboarding, redirect to dashboard
  if (session.user?.onboardingStatus === 'COMPLETE') {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};