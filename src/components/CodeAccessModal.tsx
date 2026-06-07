// src/components/CodeAccessModal.tsx
'use client';

import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { FaFileArchive, FaLock, FaTimes, FaCheck, FaExclamationCircle, FaCode } from 'react-icons/fa';
import { useFormValidation, FieldValidationRules } from '@/hooks/useFormValidation';

interface CodeAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Passcode validation regex (alphanumeric, exactly 6 characters)
const PASSCODE_REGEX = /^[A-Z0-9]{6}$/;

export default function CodeAccessModal({ isOpen, onClose }: CodeAccessModalProps) {
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
    // Only depend on isOpen to avoid infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check if form is valid before submission
    if (!isValid && touched.passcode) {
      return;
    }
    
    setStatus('loading');
    setApiError('');
    
    try {
      // First validate the passcode
      const validateResponse = await fetch('/api/validate-passcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: '', 
          passcode: values.passcode,
          category: 'code'
        })
      });
      
      const validateData = await validateResponse.json();
      
      if (validateResponse.ok && validateData.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setApiError(validateData.message || 'Invalid passcode');
      }
    } catch (err) {
      console.error('Error validating passcode:', err);
      setStatus('error');
      setApiError('An error occurred. Please try again.');
    }
  };

  // Handle download click
  const handleDownload = async () => {
    try {
      const response = await fetch('/api/download-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          passcode: values.passcode,
          category: 'code'
        })
      });

      if (response.ok) {
        // Create blob from response
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Create temporary download link
        const a = document.createElement('a');
        a.href = url;
        a.download = 'code-samples.zip';
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setStatus('downloaded');
      } else {
        const errorData = await response.json();
        setStatus('error');
        setApiError(errorData.message || 'Download failed');
      }
    } catch (err) {
      console.error('Error downloading file:', err);
      setStatus('error');
      setApiError('Download failed. Please try again.');
    }
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
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
          aria-label="Close modal"
        >
          <FaTimes size={20} />
        </button>
        
        <h2 id="modal-title" className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaLock className="text-blue-600" />
          <span>Code Access</span>
        </h2>
        
        {status === 'success' && (
          <div className="text-center py-4">
            <p className="text-green-600 mb-4">Passcode validated successfully!</p>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition mb-4"
            >
              <FaFileArchive size={20} />
              <span>Download Code Samples</span>
            </button>
            <button
              onClick={onClose}
              className="block w-full text-gray-600 hover:text-gray-800 dark:text-gray-200 dark:hover:text-gray-100 px-4 py-2 rounded border border-gray-300 transition mt-2"
            >
              Close
            </button>
          </div>
        )}

        {status === 'downloaded' && (
          <div className="text-center py-4">
            <div className="flex items-center justify-center text-green-600 mb-2">
              <FaCheck size={24} className="mr-2" />
              <p className="text-lg font-medium">Download completed!</p>
            </div>
            <p className="text-gray-600 dark:text-gray-200 mb-4">
              Your code samples have been downloaded successfully.
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
            <p className="text-gray-600 dark:text-gray-200 mb-4">
              Enter your access code to download the code samples archive.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="passcode" className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">
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
                  className="text-gray-600 hover:text-gray-800 dark:text-gray-200 dark:hover:text-gray-100 px-4 py-2 rounded border border-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-300 text-center mt-4">
                Don't have an access code? Use the contact form to request one.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
