"use client";

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState(children);
  const [prevPathname, setPrevPathname] = useState('');
  
  // Pre-optimize images and critical resources
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Optimize image loading
      const linkRel = document.createElement('link');
      linkRel.rel = 'preload';
      linkRel.as = 'fetch';
      linkRel.href = pathname;
      document.head.appendChild(linkRel);
    }
  }, [pathname]);
  
  // Save a reference to the children when they change
  useEffect(() => {
    setContent(children);
  }, [children]);
  
  // Enable instant navigation by pre-loading pages
  useEffect(() => {
    // Only run in the browser
    if (typeof window === 'undefined') return;
    
    // Optimize navigation to be instant
    const optimizeNavigation = () => {
      // Preload the current page's assets
      const preloadCurrentPageAssets = () => {
        // Find all resources on the page
        const resources = [
          ...Array.from(document.querySelectorAll('img[src]')).map(img => (img as HTMLImageElement).src),
          ...Array.from(document.querySelectorAll('link[href][rel="stylesheet"]')).map(link => (link as HTMLLinkElement).href),
          ...Array.from(document.querySelectorAll('script[src]')).map(script => (script as HTMLScriptElement).src),
        ];
        
        // Preload each resource
        resources.forEach(url => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = url;
          link.as = url.endsWith('.css') ? 'style' : url.endsWith('.js') ? 'script' : 'image';
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        });
      };
      
      // Call once immediately
      preloadCurrentPageAssets();
      
      // Intercept navigation to make it instant
      const originalPushState = window.history.pushState;
      window.history.pushState = function() {
        // Apply original function first
        const result = originalPushState.apply(this, arguments as any);
        // Force immediate render
        window.dispatchEvent(new Event('popstate'));
        return result;
      };
      
      return () => {
        window.history.pushState = originalPushState;
      };
    };
    
    return optimizeNavigation();
  }, []);
  
  // Super-optimized route change handling for instant navigation
  useEffect(() => {
    // Skip the first render
    if (!prevPathname) {
      setPrevPathname(pathname);
      setContent(children);
      return;
    }
    
    // Compare routes
    const isNewRoute = prevPathname !== pathname;
    
    if (isNewRoute) {
      // Save scroll position for back button
      if (history.scrollRestoration !== 'manual') {
        history.scrollRestoration = 'manual';
      }
      
      // Skip loading indicators for the fastest possible transitions
      // Set content immediately without any delay
      setContent(children);
      setPrevPathname(pathname);
      
      // Use RAF for smooth scrolling to top (feels more responsive)
      requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          behavior: 'auto' // Use 'auto' instead of 'smooth' for instant scroll
        });
      });
    } else {
      // For same route updates (like search params), just update content
      setContent(children);
      setPrevPathname(pathname);
    }
  }, [pathname, searchParams, children]);
  
  return (
    <div className="relative w-full">
      {/* Ultra-fast transitions - no loading indicators for speed */}
      
      {/* Main content - using immediate transition for fastest rendering */}
      <AnimatePresence mode="sync">
        <motion.div
          key={pathname}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={{ 
            duration: 0,  // No animation duration for instant page change
          }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
      
      {/* Loading overlay */}
      {isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-background/70 z-50 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 bg-background/90 p-3 rounded-lg shadow-lg"
          >
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading...</p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
