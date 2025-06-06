// src/components/SocialLinks.tsx

import { FaLinkedin, FaGithub } from 'react-icons/fa';

interface SocialLinksProps {
  className?: string;
  iconSize?: number;
}

const SocialLinks = ({ className = '', iconSize = 24 }: SocialLinksProps) => {
  return (
    <div className={`flex space-x-4 ${className}`}>
      <a 
        href="https://www.linkedin.com/in/jimsitsecurity" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-blue-600 hover:text-blue-800 transition duration-300"
        aria-label="LinkedIn Profile"
      >
        <FaLinkedin size={iconSize} />
      </a>
      <a 
        href="https://github.com/jimaniak" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-blue-600 hover:text-blue-800 transition duration-300"
        aria-label="GitHub Profile"
      >
        <FaGithub size={iconSize} />
      </a>
    </div>
   );
};

export default SocialLinks;