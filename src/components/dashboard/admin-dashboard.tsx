

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, Recycle, Users, Activity, PackageCheck, Gift, ShoppingCart, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { WasteChart } from "@/components/dashboard/waste-chart";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { CollectionStatus } from "@/components/dashboard/collection-status";
import { HotspotsMap } from "@/components/dashboard/hotspots-map";
import { PredictedHotspots } from "./predicted-hotspots";
import { UserManagementTable } from "./user-management-table";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/hooks/use-language";
import { getAdminDashboardStats } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';


export function AdminDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    reports: { total: 0, change: 0 },
    orders: { total: 0, change: 0 },
    donations: { total: 0, change: 0 },
    dustbins: { distributed: 0, total: 10000 },
    compostKits: { distributed: 0, total: 10000 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
        setLoading(true);
        try {
            const adminStats = await getAdminDashboardStats();
            setStats(adminStats);
        } catch(error) {
            console.error("Error fetching admin stats:", error);
        } finally {
            setLoading(false);
        }
    }
    loadStats();
  }, []);

  const renderStat = (value: number) => {
    if (loading) return <Skeleton className="h-7 w-20" />;
    return <div className="text-2xl font-bold">{value.toLocaleString()}</div>;
  }
  
  const renderChange = (change: number, unit: '%' | 'absolute' = '%') => {
    if (loading) return <Skeleton className="h-4 w-32" />;
    
    const isPositive = change > 0;
    const isNegative = change < 0;

    return (
       <p className={cn(
        "text-xs text-muted-foreground flex items-center gap-1",
        isPositive && "text-green-600",
        isNegative && "text-red-600"
        )}>
           {isPositive && <ArrowUp className="h-3 w-3" />}
           {isNegative && <ArrowDown className="h-3 w-3" />}
           {isPositive && '+'}{change.toFixed(unit === '%' ? 1 : 0)}{unit === '%' ? '%' : ''} from last week
       </p>
    )
  }

  const dustbinProgress = loading ? 0 : (stats.dustbins.distributed / stats.dustbins.total) * 100;
  const compostProgress = loading ? 0 : (stats.compostKits.distributed / stats.compostKits.total) * 100;

  return (
    <>
       <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className='text-sm font-medium'>{t('total_reports')}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderStat(stats.reports.total)}
            {renderChange(stats.reports.change)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
             <CardTitle className='text-sm font-medium'>{t('total_orders')}</CardTitle>
             <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {renderStat(stats.orders.total)}
             {renderChange(stats.orders.change)}
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
             <CardTitle className='text-sm font-medium'>{t('total_donations')}</CardTitle>
             <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {renderStat(stats.donations.total)}
             {renderChange(stats.donations.change, 'absolute')}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className='text-sm font-medium'>{t('compliance_rate')}</CardTitle>
            <Recycle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-7 w-16" /> : <div className="text-2xl font-bold">92%</div>}
            {loading ? <Skeleton className="h-4 w-32 mt-1" /> : <p className="text-xs text-muted-foreground">{t('from_last_month', { percent: 5 })}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className='text-sm font-medium'>{t('green_champions')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-7 w-12" /> : <div className="text-2xl font-bold">128</div>}
            {loading ? <Skeleton className="h-4 w-32 mt-1" /> : <p className="text-xs text-muted-foreground">{t('new_champions_this_week', { count: 2 })}</p>}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-primary" />
              {t('user_activity')}
            </CardTitle>
            <CardDescription>{t('user_activity_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              {t('waste_categories')}
            </CardTitle>
            <CardDescription>{t('waste_categories_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <WasteChart />
          </CardContent>
        </Card>
      </div>
       <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          <CollectionStatus />
          <HotspotsMap />
        </div>
        <PredictedHotspots />
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageCheck className="h-5 w-5 text-primary" />
                {t('kit_distribution_status')}
              </CardTitle>
              <CardDescription>{t('kit_distribution_status_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {loading ? (
                <>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </>
               ) : (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium">{t('dustbin_sets')}</p>
                      <p className="text-sm font-semibold">{dustbinProgress.toFixed(0)}%</p>
                    </div>
                    <Progress value={dustbinProgress} />
                    <p className="text-xs text-muted-foreground mt-1">{t('households_covered', { covered: stats.dustbins.distributed.toLocaleString(), total: stats.dustbins.total.toLocaleString() })}</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium">{t('compost_kits')}</p>
                      <p className="text-sm font-semibold">{compostProgress.toFixed(0)}%</p>
                    </div>
                    <Progress value={compostProgress} />
                    <p className="text-xs text-muted-foreground mt-1">{t('households_covered', { covered: stats.compostKits.distributed.toLocaleString(), total: stats.compostKits.total.toLocaleString() })}</p>
                  </div>
                </>
               )}
            </CardContent>
          </Card>
          <UserManagementTable />
        </div>
    </>
  );
}
