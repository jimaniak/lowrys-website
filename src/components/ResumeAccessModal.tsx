// src/components/ResumeAccessModal.tsx
'use client';

import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { FaFileAlt, FaLock, FaTimes, FaCheck, FaExclamationCircle } from 'react-icons/fa';
import { useFormValidation, FieldValidationRules } from '@/hooks/useFormValidation';

interface ResumeAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Passcode validation regex (alphanumeric, exactly 6 characters)
const PASSCODE_REGEX = /^[A-Z0-9]{6}$/;

export default function ResumeAccessModal({ isOpen, onClose }: ResumeAccessModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Define validation rules for passcode
  const validationRules: FieldValidationRules = {
    passcode: {
      required: true,
      pattern: PASSCODE_REGEX,
      errorMessage: 'Please enter a valid 6-character access code'
    }
  };

  // Initial form values
  const initialValues = {
    passcode: ''
  };

  // Use our custom form validation hook
  const {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    resetForm
  } = useFormValidation(initialValues, validationRules);

  // Additional state for modal status
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'downloaded' | 'error'>('idle');
  const [apiError, setApiError] = useState<string>('');
  
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
      // Reset all states when modal closes
      resetForm();
      setStatus('idle');
      setApiError('');
    }
  }, [isOpen, resetForm]);
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check if form is valid before submission
    if (!isValid && touched.passcode) {
      return;
    }
    
    setStatus('loading');
    setApiError('');
    
    try {
      const response = await fetch('/api/validate-passcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: '', // This could be added as a field if needed
          passcode: values.passcode 
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setApiError(data.message || 'Invalid passcode');
      }
    } catch (err) {
      console.error('Error validating passcode:', err);
      setStatus('error');
      setApiError('An error occurred. Please try again.');
    }
  };

  // Handle download click
  const handleDownload = () => {
    setStatus('downloaded');
  };
  
  // Function to determine if a field has an error - returns a boolean
  const hasError = (field: string): boolean => {
    return Boolean(touched[field] && errors[field]);
  };

  // Function to get input class based on validation state
  const getInputClass = (field: string) => {
    const baseClass = "w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2";
    
    if (hasError(field)) {
      return `${baseClass} border-red-500 focus:ring-red-500`;
    }
    
    if (touched[field] && !errors[field]) {
      return `${baseClass} border-green-500 focus:ring-green-500`;
    }
    
    return `${baseClass} border-gray-300 focus:ring-blue-500`;
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
        
        {status === 'success' && (
          <div className="text-center py-4">
            <p className="text-green-600 mb-4">Passcode validated successfully!</p>
            <a
              href="/documents/jim-lowry-resume.pdf"
              className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition mb-4"
              target="_blank"
              rel="noopener noreferrer"
              download
              onClick={handleDownload}
            >
              <FaFileAlt size={20} />
              <span>Download Resume</span>
            </a>
            <button
              onClick={onClose}
              className="block w-full text-gray-600 hover:text-gray-800 px-4 py-2 rounded border border-gray-300 transition mt-2"
            >
              Close
            </button>
          </div>
        )}

        {status === 'downloaded' && (
          <div className="text-center py-4">
            <div className="flex items-center justify-center text-green-600 mb-2">
              <FaCheck size={24} className="mr-2" />
              <p className="text-lg font-medium">Download initiated!</p>
            </div>
            <p className="text-gray-600 mb-4">
              Your download has started. If it doesn't begin automatically, 
              <a 
                href="/documents/jim-lowry-resume.pdf" 
                className="text-blue-600 hover:underline ml-1"
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                click here
              </a>.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
            >
              Close
            </button>
          </div>
        )}
        
        {(status === 'idle' || status === 'loading' || status === 'error') && (
          <>
            <p className="text-gray-600 mb-4">
              Enter your access code to view and download Jim Lowry's resume.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="passcode" className="block text-sm font-medium text-gray-700 mb-1">
                  Access Code
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    id="passcode"
                    value={values.passcode}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => 
                      handleChange('passcode', e.target.value.toUpperCase())
                    }
                    onBlur={() => handleBlur('passcode')}
                    placeholder="Enter your 6-digit code"
                    className={getInputClass('passcode')}
                    maxLength={6}
                    required
                  />
                  {hasError('passcode') && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <FaExclamationCircle className="text-red-500" />
                    </div>
                  )}
                </div>
                {hasError('passcode') && (
                  <p className="mt-1 text-sm text-red-600">{errors.passcode}</p>
                )}
              </div>
              
              {status === 'error' && apiError && (
                <p className="text-red-600 text-sm">{apiError}</p>
              )}
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={status === 'loading' || hasError('passcode')}
                  className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition flex-1 ${
                    (status === 'loading' || hasError('passcode')) 
                      ? 'opacity-70 cursor-not-allowed' 
                      : ''
                  }`}
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