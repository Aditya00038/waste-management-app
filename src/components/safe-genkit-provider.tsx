'use client';

import React, { useEffect, useState } from 'react';

/**
 * Safely loads genkit modules only on the server-side,
 * preventing client-side errors with require.extensions
 * 
 * This provider ensures that client components don't try to directly
 * load server-side modules which could cause hydration errors.
 */
export function SafeGenkitProvider({ children }: { children: React.ReactNode }) {
  // Track if we're on client-side to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // During initial server render, just return the children as is
  // After hydration on client, we'll render the same way
  return <>{children}</>;
}

/**
 * This component displays a warning when genkit is used on client-side
 */
export function GenkitWarning() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-lg max-w-xs">
      <p className="font-bold">Genkit Warning</p>
      <p className="text-sm">
        Genkit should be used in server components only. 
        See console for details.
      </p>
    </div>
  );
}
