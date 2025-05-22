import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
      <p className="text-lg mb-6">
        You do not have permission to view this page.
      </p>
      <Link
        to="/"
        className="text-indigo-600 hover:text-indigo-800 underline"
      >
        Go back to Home
      </Link>
    </div>
  );
};

export default UnauthorizedPage;