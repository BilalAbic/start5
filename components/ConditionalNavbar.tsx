'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Only show navbar on the homepage (root path)
  const showNavbar = pathname === '/';
  
  // Adjust main content padding based on navbar visibility
  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      if (showNavbar) {
        mainElement.classList.add('pt-16');
        mainElement.classList.remove('pt-0');
      } else {
        mainElement.classList.remove('pt-16');
        mainElement.classList.add('pt-0');
      }
    }
  }, [showNavbar]);
  
  if (!showNavbar) {
    return null;
  }

  return <Navbar />;
} 