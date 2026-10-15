import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingState } from '../components/common/LoadingState';

export const Home: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState message="अ‍ॅग्रीसेन्स उघडत आहे..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};
