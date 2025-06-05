// src/components/ResumeAccessModal.tsx
'use client';

import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { FaFileAlt, FaLock, FaTimes } from 'react-icons/fa';

interface ResumeAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResumeAccessModal({ isOpen, onClose }: ResumeAccessModalProps) {
  const [passcode, setPasscode] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Handle escape key and outside clicks
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleOutsideClick);
      // Focus the input when modal opens
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
      // Prevent scrolling on body when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);
  
  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Only reset if not in success state
      if (status !== 'success') {
        setPasscode('');
        setStatus('idle');
        setError('');
      }
    }
  }, [isOpen, status]);
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          <FaTimes size={20} />
        </button>
        
        <h2 id="modal-title" className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaLock className="text-blue-600" />
          <span>Resume Access</span>
        </h2>
        
        {status === 'success' ? (
          <div className="text-center py-4">
            <p className="text-green-600 mb-4">Passcode validated successfully!</p>
            <a
              href="/documents/jim-lowry-resume.pdf"
              className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              <FaFileAlt size={20} />
              <span>Download Resume</span>
            </a>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-4">
              Enter your access code to view and download Jim Lowry's resume.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="passcode" className="block text-sm font-medium text-gray-700 mb-1">
                  Access Code
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  id="passcode"
                  value={passcode}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPasscode(e.target.value.toUpperCase())}
                  placeholder="Enter your 6-digit code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition flex-1"
                >
                  {status === 'loading' ? 'Validating...' : 'Submit'}
                </button>
                
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded border border-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                Don't have an access code? Use the contact form to request one.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
