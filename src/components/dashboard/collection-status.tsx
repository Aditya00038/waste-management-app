
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck } from "lucide-react"
import { getCollectionVehicles } from "@/lib/data"
import type { CollectionVehicle } from '@/lib/types';
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Skeleton } from '../ui/skeleton';
import { useLanguage } from '@/hooks/use-language';

export function CollectionStatus() {
    const [vehicles, setVehicles] = useState<CollectionVehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        async function loadVehicles() {
            const data = await getCollectionVehicles();
            setVehicles(data);
            setLoading(false);
        }
        loadVehicles();
    }, []);
    
    useEffect(() => {
        if (loading) return;

        const statuses: CollectionVehicle['status'][] = ["On Route", "Idle", "At Facility", "Delayed"];
        const interval = setInterval(() => {
            setVehicles(prevVehicles =>
                prevVehicles.map(v => ({
                    ...v,
                    // Randomly update status for a couple of vehicles to simulate live tracking
                    status: Math.random() > 0.9 ? statuses[Math.floor(Math.random() * statuses.length)] : v.status
                }))
            );
        }, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, [loading]);


    const getStatusKey = (status: string) => {
        return status.toLowerCase().replace(/ /g, '_');
    }

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          {t('collection_vehicle_status')}
        </CardTitle>
        <CardDescription>{t('collection_vehicle_status_desc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        ) : (
            <ul className="space-y-4">
            {vehicles.map((vehicle) => (
                <li key={vehicle.id} className="flex items-center justify-between">
                <div>
                    <p className="font-medium">{vehicle.vehicleNumber} <span className="text-sm text-muted-foreground">({vehicle.driverName})</span></p>
                    <p className="text-sm text-muted-foreground">{vehicle.route}</p>
                </div>
                <Badge
                    variant={vehicle.status === 'On Route' ? 'default' : vehicle.status === 'Delayed' ? 'destructive' : 'secondary'}
                    className={cn('transition-all', vehicle.status === 'On Route' && 'bg-green-600 text-white')}
                >
                    {t(getStatusKey(vehicle.status))}
                </Badge>
                </li>
            ))}
            </ul>
        )}
      </CardContent>
    </Card>
  )
}
