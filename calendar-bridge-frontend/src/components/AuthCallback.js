import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleAuthCallback } from '../services/authService';

function AuthCallback() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const processAuth = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('code');
        
        if (!code) {
          throw new Error('No authorization code received');
        }
        
        await handleAuthCallback(code);
        navigate('/dashboard');
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
      }
    };

    processAuth();
  }, [location, navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-bold text-red-600">Authentication Error</h2>
          <p className="mb-4 text-gray-700">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="mb-4 text-lg text-gray-700">Completing authentication...</p>
        <div className="w-12 h-12 mx-auto border-4 border-gray-300 rounded-full border-t-blue-600 animate-spin"></div>
      </div>
    </div>
  );
}

export default AuthCallback;