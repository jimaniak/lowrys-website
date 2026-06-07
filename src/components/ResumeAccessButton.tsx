// src/components/ResumeAccessButton.tsx
'use client';

import { FaLock } from 'react-icons/fa';
import { useResumeAccess } from './ResumeAccessContext';

interface ResumeAccessButtonProps {
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'link' | 'light';
  label?: string;
}

export default function ResumeAccessButton({ 
  className = '', 
  variant = 'default',
  label = 'Access Resume',
}: ResumeAccessButtonProps) {
  const { openModal } = useResumeAccess();
  
  // Different styling variants
  const styles = {
    default: "flex items-center gap-2 text-blue-600 hover:text-blue-800 transition",
    primary: "flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition",
    secondary: "flex items-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded transition",
    link: "text-blue-600 hover:text-blue-800 hover:underline transition",
    light: "flex items-center justify-center gap-2 border border-white/60 text-white hover:bg-white/10 px-5 py-3 rounded-lg transition min-h-[44px]",
  };
  
  const buttonStyle = styles[variant] || styles.default;
  
  return (
    <button 
      onClick={openModal}
      className={`${buttonStyle} ${className}`}
      aria-label="Access Resume"
    >
      <FaLock size={variant === 'link' ? 14 : 18} />
      <span>{label}</span>
    </button>
  );
}
