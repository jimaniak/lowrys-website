// src/components/ResumeAccessContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import ResumeAccessModal from './ResumeAccessModal';

// Define the context type
interface ResumeAccessContextType {
  openModal: () => void;
  closeModal: () => void;
}

// Create context with null as initial value
const ResumeAccessContext = createContext<ResumeAccessContextType | null>(null);

// Provider component props
interface ResumeAccessProviderProps {
  children: ReactNode;
}

// Provider component
export function ResumeAccessProvider({ children }: ResumeAccessProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
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
export function useResumeAccess(): ResumeAccessContextType {
  const context = useContext(ResumeAccessContext);
  if (!context) {
    throw new Error('useResumeAccess must be used within a ResumeAccessProvider');
  }
  return context;
}
