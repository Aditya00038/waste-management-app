'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertCircle, Clock, MapPin, Truck, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import { subscribeToVehicleNotifications, unsubscribeFromVehicleNotifications, isVehicleNearby } from '@/lib/vehicle-tracking';
import type { VehicleLocation } from '@/lib/vehicle-tracking';
import { Map } from '../ui/map';

export function VehicleTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [nearbyData, setNearbyData] = useState<{
    isNearby: boolean;
    nearestVehicle?: VehicleLocation;
    estimatedArrivalMinutes?: number;
  } | null>(null);
  
  // Fetch initial tracking preferences
  useEffect(() => {
    if (!user) return;
    
    const checkUserPreferences = async () => {
      try {
        // In a real app, you'd fetch this from the user's profile
        // For now, we'll just use localStorage as a simple example
        const trackingPref = localStorage.getItem(`vehicle-tracking-${user.id}`);
        setTrackingEnabled(trackingPref === 'enabled');
        
        if (trackingPref === 'enabled') {
          await checkNearbyVehicles();
        }
      } catch (error) {
        console.error('Error fetching tracking preferences:', error);
      }
    };
    
    checkUserPreferences();
  }, [user]);
  
  const toggleTracking = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const newState = !trackingEnabled;
      
      if (newState) {
        await subscribeToVehicleNotifications(user.id, 2);
        localStorage.setItem(`vehicle-tracking-${user.id}`, 'enabled');
        toast({
          title: t('tracking_enabled'),
          description: t('tracking_enabled_desc'),
          duration: 3000,
        });
        
        // Check nearby vehicles immediately after enabling
        await checkNearbyVehicles();
      } else {
        await unsubscribeFromVehicleNotifications(user.id);
        localStorage.setItem(`vehicle-tracking-${user.id}`, 'disabled');
        toast({
          title: t('tracking_disabled'),
          description: t('tracking_disabled_desc'),
          duration: 3000,
        });
        
        // Clear nearby data when disabling
        setNearbyData(null);
      }
      
      setTrackingEnabled(newState);
    } catch (error) {
      console.error('Error toggling tracking:', error);
      toast({
        title: t('error_occurred'),
        description: t('tracking_toggle_error'),
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const checkNearbyVehicles = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = await isVehicleNearby(user.id, 2); // 2km radius
      setNearbyData(result);
    } catch (error) {
      console.error('Error checking nearby vehicles:', error);
      toast({
        title: t('error_occurred'),
        description: t('nearby_vehicles_error'),
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          {t('vehicle_tracking')}
        </CardTitle>
        <CardDescription>{t('vehicle_tracking_desc')}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="tracking-toggle"
            checked={trackingEnabled}
            onCheckedChange={toggleTracking}
            disabled={loading}
          />
          <Label htmlFor="tracking-toggle" className="text-sm font-medium">
            {trackingEnabled ? t('tracking_on') : t('tracking_off')}
          </Label>
        </div>
        
        {trackingEnabled && (
          <div className="mt-4 space-y-4">
            {nearbyData ? (
              <div className="rounded-md bg-muted p-4">
                {nearbyData.isNearby ? (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-green-600 dark:text-green-500">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      {t('vehicle_nearby')}
                    </div>
                    
                    {nearbyData.nearestVehicle && (
                      <>
                        <div className="flex items-center text-sm">
                          <Clock className="mr-2 h-4 w-4" />
                          <span>
                            {t('estimated_arrival', {
                              minutes: nearbyData.estimatedArrivalMinutes || 0
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <MapPin className="mr-2 h-4 w-4" />
                          <span>
                            {t('vehicle_distance', {
                              distance: nearbyData.nearestVehicle.distanceInKm ? 
                                nearbyData.nearestVehicle.distanceInKm.toFixed(1) : '0.0'
                            })}
                          </span>
                        </div>
                        
                        {nearbyData.nearestVehicle.location && (
                          <div className="mt-2 h-[200px] w-full rounded-md border">
                            <Map
                              center={[
                                nearbyData.nearestVehicle.location.latitude,
                                nearbyData.nearestVehicle.location.longitude
                              ]}
                              zoom={14}
                              markers={[
                                {
                                  position: [
                                    nearbyData.nearestVehicle.location.latitude,
                                    nearbyData.nearestVehicle.location.longitude
                                  ],
                                  title: t('waste_vehicle')
                                }
                              ]}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    {t('no_vehicles_nearby')}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-24 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                {loading ? (
                  <div className="flex items-center">
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    {t('checking_nearby_vehicles')}
                  </div>
                ) : (
                  t('no_data_available')
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          onClick={checkNearbyVehicles}
          disabled={!trackingEnabled || loading}
          className="w-full"
        >
          {loading ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {t('refresh_status')}
        </Button>
      </CardFooter>
    </Card>
  );
}
