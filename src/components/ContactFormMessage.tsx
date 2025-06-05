// src/components/ContactFormMessage.tsx
'use client';

import { FaCheckCircle } from 'react-icons/fa';

interface ContactFormMessageProps {
  isResumeRequest: boolean;
}

export default function ContactFormMessage({ isResumeRequest }: ContactFormMessageProps) {
  return (
    <div className="border-l-4 border-green-500 bg-green-50 p-4 my-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FaCheckCircle className="h-5 w-5 text-green-500" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-green-800">
            {isResumeRequest ? (
              <>
                Your message and resume request have been submitted successfully. 
                You'll receive an access code via email once your request is approved.
              </>
            ) : (
              <>
                Your message has been submitted successfully. 
                I'll get back to you as soon as possible.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
