

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, ArrowRight, Trash2, Trophy, BookOpen, Users, CheckCircle, Flame, Clock, Truck, Recycle, MapPin, GraduationCap, Loader2, Flag } from "lucide-react";
import { LeaderboardTable } from "../leaderboard/leaderboard-table";
import { getCitizenDashboardData, getBulkProducerReports } from "@/lib/data";
import { Badge } from "../ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { LocalReport, UserReport, LeaderboardEntry, BulkProducerReport } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { useLanguage } from "@/hooks/use-language";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { VehicleTracker } from "./vehicle-tracker";

const statusIcons: { [key: string]: React.ReactNode } = {
    "Pending": <Clock className="h-5 w-5 text-orange-500" />,
    "Collected": <Truck className="h-5 w-5 text-blue-500" />,
    "In Process": <Recycle className="h-5 w-5 text-green-500" />
}

export function CitizenDashboard() {
  const { user, login } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [localReports, setLocalReports] = useState<LocalReport[]>([]);
  const [userReports, setUserReports] = useState<UserReport[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [bulkProducerReports, setBulkProducerReports] = useState<BulkProducerReport[]>([]);
  const [loading, setLoading] = useState(true);
  
  // TODO: Create the necessary Firestore index for the reports collection:
  // https://console.firebase.google.com/v1/r/project/vit-hackthon/firestore/indexes?create_composite=Ckxwcm9qZWN0cy92aXQtaGFja3Rob24vZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3JlcG9ydHMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg
  
  useEffect(() => {
    async function loadData() {
        if (!user) return;
        setLoading(true);
        
        try {
            const { localReports, leaderboard, userReports: initialUserReports } = await getCitizenDashboardData(user.id);
            setLocalReports(localReports);
            setLeaderboardData(leaderboard);
            setUserReports(initialUserReports);
            if (user.role === 'Green Champion') {
                const bpReports = await getBulkProducerReports();
                setBulkProducerReports(bpReports);
            }
        } catch (error) {
          console.error("Error loading dashboard data:", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not load dashboard data.' });
        } finally {
          setLoading(false);
        }
    }
    loadData();

    if(user) {
        // Temporary solution until the composite index is created:
        // Only filter by userId without sorting
        const reportsQuery = query(
            collection(db, "reports"), 
            where("userId", "==", user.id),
            // orderBy("createdAt", "desc"), - removed until index is created
            limit(20) // Fetch more to sort in memory
        );
        
        const unsubscribe = onSnapshot(reportsQuery, (querySnapshot) => {
            const reports: UserReport[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Ensure createdAt is serializable
                reports.push({ 
                    id: doc.id, 
                    ...data,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
                } as UserReport);
            });
            
            // Sort in memory
            reports.sort((a, b) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            
            // Only take the first 5
            setUserReports(reports.slice(0, 5));
        }, (error) => {
            console.error("Error fetching real-time reports: ", error);
            toast({ variant: 'destructive', title: 'Could not fetch reports', description: 'There was an issue fetching your report updates.'});
        });
        return () => unsubscribe();
    }
  }, [user, toast]);

  if (loading) {
    return (
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const courseInProgress = user?.courseProgress ? user.courseProgress > 0 : false;
  const courseCompleted = user?.courseProgress ? user.courseProgress >= 100 : false;


  const handleVerifyReport = (reportId: string) => {
    setLocalReports(prevReports => 
        prevReports.map(report => 
            report.id === reportId ? { ...report, status: "Verified" } : report
        )
    );
    toast({
        title: t('report_verified'),
        description: t('report_verified_desc'),
    });
  };

  const logSegregation = () => {
    if(user.points !== undefined) {
        const newPoints = user.points + 2;
        login({ ...user, points: newPoints });
        toast({title: t('action_recorded'), description: t('action_recorded_desc', {points: 2})})
    }
  }

  const handleFlagForFine = (reportId: string) => {
    setBulkProducerReports(prev => prev.map(r => r.id === reportId ? {...r, status: "Flagged"} : r));
    toast({
      title: "Issue Flagged",
      description: "This non-compliance issue has been flagged for admin review."
    })
  }
  
  const getCategoryKey = (category: string) => {
    return category.toLowerCase().replace(/ /g, '_');
  }

  const getStatusKey = (status: string) => {
    return status.toLowerCase().replace(/ /g, '_');
  }

  return (
    <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        {!courseCompleted && (
            <Alert className="border-primary">
                <GraduationCap className="h-4 w-4" />
                <AlertTitle className="font-semibold">{courseInProgress ? 'Continue Your Training!' : 'Complete Your Training!'}</AlertTitle>
                <AlertDescription>
                    {courseInProgress ? 'You\'re making great progress. Keep it up to unlock all features.' : 'To unlock all features and start earning rewards, you need to complete the mandatory training course.'}
                </AlertDescription>
                <Button asChild className="mt-4">
                    <Link href="/course">
                        {courseInProgress ? 'Continue Course' : 'Go to Course'} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </Alert>
        )}
        
        {/* Vehicle Tracker */}
        <div className="relative">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                {t('waste_collection')}
              </CardTitle>
              <CardDescription>{t('track_collection_vehicles')}</CardDescription>
            </CardHeader>
            <CardContent>
              <VehicleTracker />
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-primary to-green-700 text-primary-foreground">
          <CardHeader>
            <CardTitle>{t('hello_user', { name: user.name })}</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              {user.role === 'Green Champion' ? t('green_champion_welcome') : t('citizen_welcome')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
             <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90" disabled={!courseCompleted}>
                <Link href="/report">
                    <Trash2 className="mr-2 h-5 w-5"/> {t('report_waste')}
                </Link>
             </Button>
             <Button asChild size="lg" variant="secondary" className="bg-white/20 hover:bg-white/30" disabled={!courseCompleted}>
                <Link href="/impact">
                    {t('view_my_impact')} <ArrowRight className="ml-2 h-5 w-5"/>
                </Link>
             </Button>
          </CardContent>
        </Card>

        {user.role === 'Green Champion' && (
          <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="text-primary"/>
                        {t('community_actions', { zone: user.assignedZone || '' })}
                    </CardTitle>
                    <CardDescription>{t('community_actions_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                   {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                   ) : (
                    <ul className="space-y-4">
                        {localReports.map(report => (
                            <li key={report.id} className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{report.location}</p>
                                    <p className="text-sm text-muted-foreground">{t(getCategoryKey(report.category))}</p>
                                </div>
                                {report.status === 'Verified' ? (
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700">
                                        <CheckCircle className="mr-1 h-3 w-3"/> {t('verified')}
                                    </Badge>
                                ) : (
                                <Button variant="outline" size="sm" onClick={() => handleVerifyReport(report.id)}>{t('verify')}</Button>
                                )}
                            </li>
                        ))}
                   </ul>
                   )}
                   <Button variant="outline" className="w-full mt-4" asChild>
                      <Link href="/community">{t('create_view_events')}</Link>
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Flag className="text-destructive"/>
                        Bulk Producer Compliance
                    </CardTitle>
                    <DialogDescription>Monitor and flag non-compliance issues from bulk waste generators in your zone.</DialogDescription>
                </CardHeader>
                <CardContent>
                   {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                   ) : (
                    <ul className="space-y-4">
                        {bulkProducerReports.map(report => (
                            <li key={report.id} className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{report.producerName}</p>
                                    <p className="text-sm text-muted-foreground">{report.issue}</p>
                                </div>
                                {report.status === 'Flagged' ? (
                                     <Badge variant="secondary">
                                        <CheckCircle className="mr-1 h-3 w-3"/> Flagged
                                    </Badge>
                                ) : (
                                <Button variant="destructive" size="sm" onClick={() => handleFlagForFine(report.id)}>
                                    <Flag className="mr-2 h-4 w-4" />
                                    Flag for Fine
                                </Button>
                                )}
                            </li>
                        ))}
                   </ul>
                   )}
                </CardContent>
            </Card>
          </>
        )}
        
        <Card>
            <CardHeader>
                <CardTitle>{t('my_recent_reports')}</CardTitle>
                <CardDescription>{t('my_recent_reports_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : userReports.length > 0 ? (
                        userReports.map(report => (
                         <Dialog key={report.id}>
                            <DialogTrigger asChild>
                                <div className="flex items-start gap-4 cursor-pointer hover:bg-muted/50 p-2 rounded-md">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                        {statusIcons[report.status]}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{t('report_at_location', { category: t(getCategoryKey(report.category)), location: report.location })}</p>
                                        <p className="text-sm text-muted-foreground">{t('status')}: <span className="font-semibold">{t(getStatusKey(report.status))}</span></p>
                                    </div>
                                    <Button variant="outline" size="sm">{t('view_details')}</Button>
                                </div>
                            </DialogTrigger>
                             <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{t('report_title', { category: t(getCategoryKey(report.category)) })}</DialogTitle>
                                    <DialogDescription>
                                        {t('reported_at', { location: report.location })}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="relative aspect-video rounded-md overflow-hidden">
                                        <Image src={report.imageUrl} alt={report.description || 'Waste Report'} fill className="object-cover" data-ai-hint="waste pile"/>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{t('status')}</h4>
                                        <p className="text-muted-foreground">{t(getStatusKey(report.status))}</p>
                                    </div>
                                     <div>
                                        <h4 className="font-semibold">{t('description')}</h4>
                                        <p className="text-muted-foreground">{report.description || 'No description provided.'}</p>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                        ))
                    ) : (
                      <div className="text-center text-muted-foreground p-4">{t('no_reports_submitted')}</div>
                    )}
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>{t('leaderboard')}</CardTitle>
                <CardDescription>{t('leaderboard_description')}</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? <Skeleton className="h-48 w-full" /> : <LeaderboardTable data={leaderboardData.slice(0, 3)} />}
                <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/leaderboard">{t('view_leaderboard')}</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
      <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>{t('your_stats')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium">{t('points')}</p>
                    {loading ? <Skeleton className="h-6 w-12" /> : <p className="font-bold text-primary text-lg">{user.points?.toLocaleString() || 0}</p>}
                </div>
                 <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium">{t('rank')}</p>
                    {loading ? <Skeleton className="h-6 w-8" /> : <p className="font-bold text-primary text-lg">#{leaderboardData.find(e => e.user.id === user.id)?.rank || '-'}</p>}
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium">{t('badges')}</p>
                    {loading ? <Skeleton className="h-6 w-4" /> : <p className="font-bold text-primary text-lg">{user.badges?.length || 0}</p>}
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Flame className="text-orange-500"/>
                    {t('daily_streaks_challenges')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center space-y-4">
                    <div>
                         <p className="text-4xl font-bold text-orange-500">5</p>
                         <p className="text-sm text-muted-foreground">{t('day_streak')}</p>
                    </div>
                     <Card className="p-4 bg-muted/50 text-left">
                        <CardHeader className="p-0 pb-2">
                            <CardTitle className="text-base">{t('todays_challenge')}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <p className="text-sm text-muted-foreground mt-1">{t('log_segregation_desc')}</p>
                        </CardContent>
                        <CardFooter className="p-0 pt-4">
                           <Button size="sm" className="w-full" onClick={logSegregation}>{t('log_segregation')}</Button>
                        </CardFooter>
                    </Card>
                </div>
            </CardContent>
        </Card>
        
         <Card>
            <CardHeader>
                <CardTitle>{t('discover_learn')}</CardTitle>
                <CardDescription>{t('discover_learn_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-sm">
                <Link href="/education" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                    <BookOpen className="h-4 w-4 text-accent-foreground"/>
                    <span>{t('articles')}</span>
                </Link>
                 <Link href="/community" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                    <Users className="h-4 w-4 text-accent-foreground"/>
                    <span>{t('community')}</span>
                </Link>
                 <Link href="/impact" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                    <Award className="h-4 w-4 text-accent-foreground"/>
                    <span>{t('rewards')}</span>
                </Link>
                 <Link href="/report" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                    <Trash2 className="h-4 w-4 text-accent-foreground"/>
                    <span>{t('new_report')}</span>
                </Link>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
