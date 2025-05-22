'use client';

import { useState, useEffect } from 'react';
import useAuth from '@/lib/hooks/useAuth';

// Extend the User type to include the fields we need
type ExtendedUser = {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  username?: string;
};

export const UserWelcome = () => {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until client-side hydration is complete
  if (!mounted || loading || !user) {
    return null;
  }

  // Cast user to ExtendedUser to access potential firstName/lastName fields
  const extendedUser = user as unknown as ExtendedUser;
  
  // Display format: "LastName FirstName" if available, fallback to email
  const displayName = extendedUser.lastName && extendedUser.firstName 
    ? `${extendedUser.lastName} ${extendedUser.firstName}`
    : extendedUser.email;

  return (
    <div className="mb-8 bg-gray-800/50 px-6 py-3 rounded-lg inline-flex items-center">
      <span className="text-gray-300">Merhaba, </span>
      <span className="ml-1 font-semibold text-blue-400">{displayName}</span>
    </div>
  );
}; 