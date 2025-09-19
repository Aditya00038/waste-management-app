'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { GenkitWarning } from '@/components/safe-genkit-provider';

export default function AiDebug() {
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if handlebars exists in client environment
  useEffect(() => {
    setIsClient(true);
    try {
      // Try to import handlebars - this should fail gracefully
      // with our configuration
      import('handlebars').then(() => {
        setError("Handlebars loaded on client-side, which is unexpected");
      }).catch((err) => {
        console.log('Handlebars import prevented correctly:', err.message);
      });
    } catch (err: any) {
      console.log('Expected error:', err.message);
    }
  }, []);

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>AI Debug Panel</CardTitle>
          <CardDescription>Use this panel to debug AI integration issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-md">
              <h3 className="font-medium">Client/Server Detection</h3>
              <p>Current environment: <strong>{isClient ? 'Client-side' : 'Server-side'}</strong></p>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-md">
                <h3 className="font-medium">Error Detected</h3>
                <p>{error}</p>
              </div>
            )}
            
            <div className="p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-md">
              <h3 className="font-medium">Note</h3>
              <p>AI functionality will only work in server components or through server actions.</p>
              <p className="text-sm mt-2">
                If you see errors about 'require.extensions', 'handlebars', or 'genkit', make sure you're not
                importing AI modules directly in client components.
              </p>
            </div>
            
            <Button
              onClick={() => {
                console.log('AI functionality should be used through server actions only');
              }}
            >
              Test Client-Side AI (Should show warning)
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <GenkitWarning />
    </div>
  );
}
