// src/components/ResumeAccessButton.jsx
'use client';

import { FaLock } from 'react-icons/fa';
import { useResumeAccess } from './ResumeAccessContext';

export default function ResumeAccessButton({ className, variant = 'default' }) {
  const { openModal } = useResumeAccess();
  
  // Different styling variants
  const styles = {
    default: "flex items-center gap-2 text-blue-600 hover:text-blue-800 transition",
    primary: "flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition",
    secondary: "flex items-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded transition",
    link: "text-blue-600 hover:text-blue-800 hover:underline transition"
  };
  
  const buttonStyle = styles[variant] || styles.default;
  
  return (
    <button 
      onClick={openModal}
      className={`${buttonStyle} ${className || ''}`}
      aria-label="Access Resume"
    >
      <FaLock size={variant === 'link' ? 14 : 18} />
      <span>Access Resume</span>
    </button>
  );
}
