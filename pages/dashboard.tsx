import React from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { ProtectedRoute } from '../src/components/Auth/ProtectedRoute';
import { EducatorDashboard } from '../src/components/Dashboard/EducatorDashboard';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <EducatorDashboard />
    </ProtectedRoute>
  );
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

  return {
    props: {
      session,
    },
  };
};