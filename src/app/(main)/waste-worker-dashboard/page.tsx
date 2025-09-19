

"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, MapPin, Truck, Bot, Check, Clock, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";

const assignedRoute = {
    name: "Koregaon Park Loop",
    stops: [
        { name: "German Bakery", status: "Completed", location: "German Bakery, Koregaon Park, Pune" },
        { name: "Osho Garden", status: "Completed", location: "Osho Garden, Koregaon Park, Pune" },
        { name: "North Main Road", status: "In Progress", location: "North Main Road, Koregaon Park, Pune" },
        { name: "Lane 7", status: "Pending", location: "Lane 7, Koregaon Park, Pune" },
        { name: "Lane 5", status: "Pending", location: "Lane 5, Koregaon Park, Pune" },
    ]
}

export function WasteWorkerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [gearChecked, setGearChecked] = useState(false);
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const isApiKeySet = apiKey && apiKey !== "YOUR_GOOGLE_MAPS_API_KEY_HERE";
  
  const depotLocation = "Pune Railway Station";
  const firstStopLocation = "German Bakery, Koregaon Park, Pune";

  const mapSrc = `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${encodeURIComponent(depotLocation)}&destination=${encodeURIComponent(firstStopLocation)}&mode=driving`;


  if (!user) return null;
  
  const handleGearCheck = () => {
    setGearChecked(true);
    toast({
        title: t('safety_first'),
        description: t('safety_first_desc'),
    });
  }

  const getStatusKey = (status: string) => {
    if (status === 'In Progress') return 'in_progress_task';
    return status.toLowerCase();
  }

  return (
    <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>{t('good_morning_user', { name: user.name })}</CardTitle>
                    <CardDescription>{t('waste_worker_welcome')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6">
                        <div className="relative aspect-video rounded-lg overflow-hidden border">
                            {isApiKeySet ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    allowFullScreen
                                    src={mapSrc}>
                                </iframe>
                            ) : (
                                <Image src="https://storage.googleapis.com/aifirebase/sc-pwa-images/route-map-pune.png" alt="Route map for Koregaon Park Loop" fill className="object-contain" data-ai-hint="driving directions map" />
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Truck className="text-primary"/>
                        {t('route_progress', { routeName: assignedRoute.name })}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {assignedRoute.stops.map(stop => (
                             <li key={stop.name} className="flex items-center gap-4">
                                {stop.status === 'Completed' ? <Check className="h-6 w-6 text-green-500"/> : stop.status === 'In Progress' ? <Truck className="h-6 w-6 text-blue-500 animate-pulse"/> : <Clock className="h-6 w-6 text-muted-foreground"/>}
                                <div>
                                    <p className="font-medium">{stop.name}</p>
                                </div>
                                <Badge variant={stop.status === 'Completed' ? 'default' : stop.status === 'In Progress' ? 'secondary' : 'outline'} className={stop.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : ''}>
                                    {t(getStatusKey(stop.status))}
                                </Badge>
                             </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>{t('vehicle_details')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <p className="text-muted-foreground">{t('vehicle_no')}</p>
                        <p className="font-medium">MH 12 CD 5678</p>
                    </div>
                     <div className="flex justify-between">
                        <p className="text-muted-foreground">{t('status')}</p>
                        <p className="font-medium text-green-600">{t('on_route')}</p>
                    </div>
                     <div className="flex justify-between">
                        <p className="text-muted-foreground">{t('next_stop')}</p>
                        <p className="font-medium">North Main Road</p>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldCheck className="text-primary"/> {t('safety_gear_check')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {gearChecked ? (
                         <div className="flex items-center gap-2 text-green-600">
                            <Check className="h-5 w-5"/>
                            <p className="font-semibold text-sm">{t('gear_check_completed')}</p>
                        </div>
                    ) : (
                        <Button className="w-full" onClick={handleGearCheck}>{t('confirm_gear_check')}</Button>
                    )}
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>{t('quick_actions')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                   <Button asChild className="w-full justify-start" variant="outline">
                        <Link href="/facilities">
                            <MapPin className="mr-2 h-4 w-4"/>
                            {t('find_nearest_facility')}
                        </Link>
                   </Button>
                   <Button asChild className="w-full justify-start" variant="outline">
                        <Link href="/training">
                            <Bot className="mr-2 h-4 w-4"/>
                            {t('ai_training_assistant')}
                        </Link>
                   </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
