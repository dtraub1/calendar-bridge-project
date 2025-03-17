import React, { useState, useEffect } from 'react';
import { getUserInfo, disconnectCalendar } from '../services/authService';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserInfo();
        setUser(data);
        setApiKey(data.apiKey);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleDisconnect = async () => {
    try {
      await disconnectCalendar();
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-center text-gray-800">Calendar Bridge</h1>
        
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center w-16 h-16 mb-4 bg-green-500 rounded-full">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-800">Successfully Connected!</h2>
          <p className="text-center text-gray-600">
            Your Google Calendar is now connected to Go High Level's voice AI agents
          </p>
        </div>
        
        <div className="p-3 mb-4 bg-gray-100 rounded-md">
          <div className="flex items-center">
            <div className="w-3 h-3 mr-2 bg-green-500 rounded-full"></div>
            <p className="text-sm text-gray-700">Connection Status: Active</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-medium text-gray-700">Your API Integration</h3>
          
          <div className="p-3 mb-2 bg-gray-100 rounded-md">
            <p className="mb-1 text-xs text-gray-500">Check Availability Endpoint:</p>
            <code className="block p-2 text-xs bg-white border border-gray-200 rounded">
              {`${process.env.REACT_APP_API_URL}/api/availability`}
            </code>
          </div>
          
          <div className="p-3 mb-2 bg-gray-100 rounded-md">
            <p className="mb-1 text-xs text-gray-500">Create Appointment Endpoint:</p>
            <code className="block p-2 text-xs bg-white border border-gray-200 rounded">
              {`${process.env.REACT_APP_API_URL}/api/appointments`}
            </code>
          </div>
          
          <div className="p-3 bg-gray-100 rounded-md">
            <p className="mb-1 text-xs text-gray-500">Your API Key:</p>
            <div className="flex items-center">
              <code className="block w-full p-2 mr-2 text-xs bg-white border border-gray-200 rounded">
                {apiKey ? `${apiKey.substring(0, 5)}${'•'.repeat(20)}` : '•••••••••••••••••••••'}
              </code>
              <button 
                onClick={() => {navigator.clipboard.writeText(apiKey)}}
                className="p-1 text-gray-500 hover:text-gray-700"
                title="Copy API key"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleDisconnect}
          className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        >
          Disconnect Calendar
        </button>
      </div>
    </div>
  );
}

export default Dashboard;