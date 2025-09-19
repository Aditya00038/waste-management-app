"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// List of all main routes that should be preloaded
const ROUTES_TO_PRELOAD = [
  '/dashboard',
  '/report',
  '/shop',
  '/leaderboard',
  '/impact',
  '/profile',
  '/course',
  '/education',
  '/training',
  '/facilities',
  '/wow',
  '/community'
];

export function RoutePreloader() {
  const pathname = usePathname();
  
  // Function to prefetch a route immediately
  const prefetchRouteAggressively = (route: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      // Create a hidden iframe to fully load the page in background
      const iframe = document.createElement('iframe');
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      iframe.style.position = 'absolute';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.src = route;
      
      // Remove the iframe after it loads to save memory
      iframe.onload = () => {
        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
          } catch (e) {}
        }, 1000);
      };
      
      document.body.appendChild(iframe);
      
      // Also add standard prefetch
      const link = document.createElement('link');
      link.rel = 'prerender'; // More aggressive than prefetch
      link.href = route;
      link.as = 'document';
      document.head.appendChild(link);
    } catch (error) {
      // Silently ignore errors
    }
  };
  
  useEffect(() => {
    // Immediately begin preloading without waiting
    if (typeof window !== 'undefined') {
      // Load critical routes immediately
      ROUTES_TO_PRELOAD.forEach(route => {
        // Don't preload the current route
        if (route !== pathname) {
          prefetchRouteAggressively(route);
        }
      });
      
      // Also hijack all link hovering for instant prefetching
      const handleLinkHover = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const link = target.closest('a');
        if (link && link.href && link.href.startsWith(window.location.origin)) {
          const path = link.href.replace(window.location.origin, '');
          prefetchRouteAggressively(path);
        }
      };
      
      // Add global mouseover listener to prefetch on hover
      document.addEventListener('mouseover', handleLinkHover);
      
      return () => {
        document.removeEventListener('mouseover', handleLinkHover);
      };
    }
  }, [pathname]);
  
  return null;
}
