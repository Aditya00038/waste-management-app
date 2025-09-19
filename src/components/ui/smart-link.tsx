"use client";

import { useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

// List of all main navigation routes in the app
const PREFETCH_ROUTES = [
  "/dashboard",
  "/profile",
  "/report",
  "/education",
  "/community",
  "/leaderboard",
  "/training",
  "/shop",
  "/impact",
  "/facilities"
];

interface SmartLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  prefetch?: boolean;
  onClick?: () => void;
}

export function SmartLink({ 
  href, 
  children, 
  className = "", 
  activeClassName = "", 
  prefetch = true,
  onClick,
  ...props 
}: SmartLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  // Prefetch the route instantly on mount
  useEffect(() => {
    if (prefetch && typeof window !== 'undefined') {
      // Create a link preload tag
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = 'fetch';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      
      // Also try to use Next.js internal prefetch mechanism
      // @ts-ignore - This is an internal API
      if (window.__NEXT_ROUTER_PREFETCH) {
        // @ts-ignore
        window.__NEXT_ROUTER_PREFETCH(href);
      }
    }
  }, [href, prefetch]);
  
  // Enhanced prefetch on hover
  const handleMouseEnter = useCallback(() => {
    // Prefetch the current route
    const prefetchPromises: Promise<any>[] = [];
    
    // Also prefetch related routes
    PREFETCH_ROUTES.forEach(route => {
      if (route.startsWith(href + "/") || href.startsWith(route + "/")) {
        // @ts-ignore - This is an internal API
        if (window.__NEXT_ROUTER_PREFETCH) {
          prefetchPromises.push(
            // @ts-ignore
            window.__NEXT_ROUTER_PREFETCH?.(route)
          );
        }
        
        // Also use standard fetch preloading
        const controller = new AbortController();
        fetch(route, { 
          signal: controller.signal,
          credentials: 'same-origin',
          priority: 'high'
        }).catch(() => {});
      }
    });
    
    return () => {
      // Cancel any pending prefetches if unmounted
      prefetchPromises.forEach(p => p?.catch(() => {}));
    };
  }, [href]);

  return (
    <Link
      href={href}
      className={cn(className, isActive && activeClassName)}
      prefetch={prefetch}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
      {...props}
    >
      {children}
    </Link>
  );
}
