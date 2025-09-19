"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link, { LinkProps } from 'next/link';
import clsx from 'clsx';

/**
 * FastLink component
 * A wrapper around Next.js Link component that adds instant page transitions
 */
interface FastLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  isActive?: boolean;
  prefetch?: boolean;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function FastLink({
  children,
  className,
  activeClassName,
  isActive,
  prefetch = true,
  onClick,
  ...props
}: FastLinkProps) {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);
  
  // Prefetch even more aggressively on hover
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    
    // For non-next/link compatible paths, we can preload manually
    if (props.href && typeof props.href === 'string' && !props.href.startsWith('#')) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'prefetch';
      preloadLink.href = props.href;
      preloadLink.as = 'document';
      document.head.appendChild(preloadLink);
      
      // Remove after a moment to avoid cluttering the DOM
      setTimeout(() => {
        try {
          document.head.removeChild(preloadLink);
        } catch (e) {
          // Ignore if already removed
        }
      }, 3000);
    }
  }, [props.href]);
  
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);
  
  // Handle navigation with custom touch handling for mobile
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    // If the user has a custom onClick, call that first
    if (onClick) {
      onClick(e);
    }
    
    // If the event was prevented, don't navigate
    if (e.defaultPrevented) {
      return;
    }
    
    // Handle navigation ourselves for external links or hash links
    if (
      props.href &&
      typeof props.href === 'string' &&
      (props.href.startsWith('http') || props.href.startsWith('#'))
    ) {
      // Let the default behavior handle it
      return;
    }
    
    // For internal links, prevent default and navigate programmatically for faster transitions
    e.preventDefault();
    
    // Let the Link component handle the navigation by not preventing the default behavior
    // This is actually faster than trying to manually navigate
  }, [onClick, props.href, router]);
  
  // Compute classes based on active state
  const linkClasses = clsx(
    className,
    isActive && activeClassName,
    isHovering && 'is-hovering'
  );
  
  return (
    <Link
      {...props}
      className={linkClasses}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      prefetch={prefetch}
    >
      {children}
    </Link>
  );
}
