
"use client";

import { useEffect, useState, Suspense, lazy } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { RoutePreloader } from "@/components/route-preloader";

// Import common components directly for faster initial rendering
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // This effect runs only when the auth state is finally determined.
    if (!loading) {
      setIsInitialLoad(false);
      if (!user) {
        router.replace("/");
      }
    }
  }, [user, loading, router]);

  // Show a loader only on the very first load while we check for an authenticated user.
  if (isInitialLoad) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Loading your experience...</p>
        </div>
      </div>
    );
  }
  
  // If we are done loading and there's no user, the redirect is in progress.
  // Render nothing to avoid a flash of the layout.
  if (!user) {
    return null; 
  }

  // Once authenticated and past the initial load, render the full layout.
  // Page-to-page navigation will now be instant because `isInitialLoad` is false.
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      {/* Silently preload routes in the background */}
      <RoutePreloader />
      
      {/* Render sidebar directly without Suspense for faster loading */}
      <Sidebar />
      <div className="flex flex-col w-full sm:gap-4 sm:py-4 sm:pl-14">
        {/* Render header directly without Suspense for faster loading */}
        <Header />
        <main className="flex-1 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 overflow-auto">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
