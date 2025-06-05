// src/components/ResumeAccess.jsx
'use client';

import { useState } from 'react';
import { FaFileAlt, FaLock, FaUnlock } from 'react-icons/fa';

export default function ResumeAccess() {
  const [passcode, setPasscode] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    
    try {
      const response = await fetch('/api/validate-passcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: '', // This could be added as a field if needed
          passcode 
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setError(data.message || 'Invalid passcode');
      }
    } catch (err) {
      console.error('Error validating passcode:', err);
      setStatus('error');
      setError('An error occurred. Please try again.');
    }
  };
  
  if (status === 'success') {
    return (
      <a
        href="/documents/jim-lowry-resume.pdf"
        className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition"
        target="_blank"
        rel="noopener noreferrer"
        download
      >
        <FaFileAlt size={24} />
        <span>Download Resume</span>
      </a>
    );
  }
  
  return (
    <div>
      {!showForm ? (
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition"
        >
          <FaLock size={24} />
          <span>Access Resume</span>
        </button>
      ) : (
        <div className="mt-2 p-4 bg-gray-50 rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="passcode" className="block text-sm font-medium text-gray-700 mb-1">
                Enter Access Code
              </label>
              <input
                type="text"
                id="passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                placeholder="Enter your access code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={6}
                required
              />
            </div>
            
            {status === 'error' && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
            
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
              >
                {status === 'loading' ? 'Validating...' : 'Submit'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded border border-gray-300 transition"
              >
                Cancel
              </button>
            </div>
            
            <p className="text-xs text-gray-500">
              Don't have an access code? Use the contact form to request one.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
