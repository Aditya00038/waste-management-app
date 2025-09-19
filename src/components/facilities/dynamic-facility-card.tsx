
"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const DynamicFacilityCard = dynamic(() => import('./facility-card').then(mod => mod.FacilityCard), {
  loading: () => <Skeleton className="h-36 w-full" />,
  ssr: false
});
