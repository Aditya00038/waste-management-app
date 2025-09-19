
"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BrainCircuit, AlertTriangle, ChevronRight, CheckCircle } from "lucide-react";
import type { HotspotPredictionOutput } from "@/lib/types"; // Updated import from types
import { predictHotspotsAction } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";


export function PredictedHotspots() {
  const [isPending, startTransition] = useTransition();
  const [predictions, setPredictions] = useState<HotspotPredictionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dispatched, setDispatched] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    startTransition(async () => {
        try {
            const result = await predictHotspotsAction({ recentReports: [] });
            if (result.error) {
                throw new Error(result.error);
            }
            setPredictions(result.data);
        } catch (e: any) {
            setError(e.message);
            toast({
                variant: 'destructive',
                title: t('prediction_failed'),
                description: t('prediction_failed_desc'),
            });
        }
    });
  }, [toast, t]);

  const getSeverityBadge = (severity: 'High' | 'Medium' | 'Low') => {
    switch (severity) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low': return 'outline';
      default: return 'default';
    }
  }

  const handleDispatch = (location: string) => {
    setDispatched(prev => ({ ...prev, [location]: true }));
    toast({
        title: t('team_dispatched'),
        description: t('team_dispatched_desc', { location }),
    });
  }

  return (
    <Card className="lg:col-span-7">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          {t('ai_predicted_hotspots')}
        </CardTitle>
        <CardDescription>{t('ai_predicted_hotspots_desc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isPending && (
            <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        )}
        {error && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {predictions && (
            <div className="space-y-4">
                {predictions.predictedHotspots.map((hotspot, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <p className="font-semibold text-lg">{hotspot.location}</p>
                                <Badge variant={getSeverityBadge(hotspot.severity)}>{hotspot.severity} Severity</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{hotspot.reasoning}</p>
                        </div>
                         <Button 
                            variant={dispatched[hotspot.location] ? "secondary" : "outline"} 
                            size="sm" 
                            onClick={() => handleDispatch(hotspot.location)}
                            disabled={dispatched[hotspot.location]}
                        >
                            {dispatched[hotspot.location] ? (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    {t('dispatched')}
                                </>
                            ) : (
                                <>
                                    {t('dispatch_team')} <ChevronRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
