import React from 'react';

function LandingPage() {
  const handleConnect = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-center text-gray-800">Calendar Bridge</h1>
        
        <p className="mb-4 text-center text-gray-600">
          Connect your Google Calendar to Go High Level's voice AI agents
        </p>
        
        <div className="mb-6 space-y-3">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-4 h-4 mt-1 bg-blue-500 rounded-full"></div>
            </div>
            <p className="ml-3 text-sm text-gray-600">Check availability automatically</p>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-4 h-4 mt-1 bg-blue-500 rounded-full"></div>
            </div>
            <p className="ml-3 text-sm text-gray-600">Schedule appointments seamlessly</p>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-4 h-4 mt-1 bg-blue-500 rounded-full"></div>
            </div>
            <p className="ml-3 text-sm text-gray-600">Simple one-time setup</p>
          </div>
        </div>
        
        <button
          onClick={handleConnect}
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Connect with Google
        </button>
      </div>
    </div>
  );
}

export default LandingPage;