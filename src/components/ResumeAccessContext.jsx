// src/components/ResumeAccessContext.jsx
'use client';

import { createContext, useContext, useState } from 'react';
import ResumeAccessModal from './ResumeAccessModal';

// Create context
const ResumeAccessContext = createContext(null);

// Provider component
export function ResumeAccessProvider({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  return (
    <ResumeAccessContext.Provider value={{ openModal, closeModal }}>
      {children}
      <ResumeAccessModal isOpen={isModalOpen} onClose={closeModal} />
    </ResumeAccessContext.Provider>
  );
}

// Custom hook to use the context
export function useResumeAccess() {
  const context = useContext(ResumeAccessContext);
  if (!context) {
    throw new Error('useResumeAccess must be used within a ResumeAccessProvider');
  }
  return context;
}
