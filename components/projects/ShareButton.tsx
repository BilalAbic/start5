"use client";

import React, { useState } from 'react';
import { 
  FiShare2, 
  FiX, 
  FiTwitter, 
  FiFacebook, 
  FiLinkedin, 
  FiMail,
  FiCopy
} from 'react-icons/fi';

type ShareButtonProps = {
  title?: string;
}

const ShareButton = ({ title = 'Bu projeyi' }: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const currentUrl = typeof window !== 'undefined' 
    ? window.location.href 
    : '';
  
  const shareText = `${title} - Start5 Projesi`;
  
  const shareLinks = [
    {
      name: 'Twitter',
      icon: <FiTwitter />,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`,
    },
    {
      name: 'Facebook',
      icon: <FiFacebook />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    },
    {
      name: 'LinkedIn',
      icon: <FiLinkedin />,
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'Email',
      icon: <FiMail />,
      url: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(currentUrl)}`,
    },
  ];
  
  const copyToClipboard = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(currentUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
      
      document.body.removeChild(textArea);
    }
  };
  
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
        aria-label="Share project"
      >
        <FiShare2 className="mr-2" /> Paylaş
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Projeyi Paylaş</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-gray-700 transition-colors"
              >
                <FiX className="text-gray-400" />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-3 mb-6">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <span className="text-xl mb-2">{link.icon}</span>
                  <span className="text-xs">{link.name}</span>
                </a>
              ))}
            </div>
            
            <div className="relative">
              <div className="flex items-center">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 pr-12 text-white text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute right-2 p-2 text-gray-300 hover:text-white"
                  title="Copy to clipboard"
                >
                  {copied ? <span className="text-green-400">✓</span> : <FiCopy />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareButton; 