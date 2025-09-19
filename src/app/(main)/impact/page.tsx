

"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Award, Gift, Recycle, Star, Shield, Leaf, Trophy } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getBadgeTiers, getRewards } from "@/lib/data"
import type { BadgeTier, Reward } from "@/lib/types"
import { BadgeProgressCard } from "@/components/impact/badge-progress-card"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useLanguage } from "@/hooks/use-language"

const badgeIcons: { [key: string]: React.ReactNode } = {
  "Recycle Pro": <Recycle className="mr-1 h-3 w-3 text-blue-500" />,
  "Waste Warrior": <Shield className="mr-1 h-3 w-3 text-green-500" />,
  "Eco-Star": <Star className="mr-1 h-3 w-3 text-yellow-500" />,
  "Community Hero": <Award className="mr-1 h-3 w-3 text-purple-500" />,
  "Cleanliness Captain": <Shield className="mr-1 h-3 w-3 text-red-500" />,
  "Certified Recycler": <Trophy className="mr-1 h-3 w-3 text-orange-500" />,
};

export default function ImpactPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [badgeTiers, setBadgeTiers] = useState<BadgeTier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
        setLoading(true);
        const [rewardsData, tiersData] = await Promise.all([getRewards(), getBadgeTiers()]);
        setRewards(rewardsData);
        setBadgeTiers(tiersData);
        setLoading(false);
    }
    loadData();
  }, []);

  if (loading || !user) {
    return (
        <div className="container mx-auto py-8">
            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2 space-y-8">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
                <div className="space-y-8">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        </div>
    )
  }

  if (user.role !== "Citizen" && user.role !== "Green Champion") {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('impact_access_denied')}</AlertTitle>
          <AlertDescription>
            {t('impact_access_denied_desc')}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const points = user.points || 0;
  const reportsSubmitted = Math.floor(points / 10);
  const co2Saved = (reportsSubmitted * 1.5).toFixed(1); // Assuming 1.5kg CO2 saved per report
  const nextTier = user.role === 'Citizen' ? 2000 : 5000;
  const progressToNextRole = (points / nextTier) * 100;
  const nextRole = user.role === 'Citizen' ? 'Green Champion' : 'Eco-Legend';
  
  const handleRedeem = (rewardName: string, rewardPoints: number) => {
    toast({
        title: t('redemption_request_received'),
        description: t('redemption_request_desc', { rewardName, points: rewardPoints }),
    });
  }

  const earnedBadges = user.badges || [];
  const upcomingBadges = badgeTiers.filter(tier => !earnedBadges.includes(tier.name));

  const getBadgeKey = (badgeName: string) => {
    return badgeName.toLowerCase().replace(/ /g, '_').replace(/-/g, '_');
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                <CardTitle>{t('my_impact_dashboard')}</CardTitle>
                <CardDescription>
                    {t('my_impact_description')}
                </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                    <CardDescription>{t('total_points')}</CardDescription>
                    <CardTitle className="text-4xl">{points.toLocaleString()}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                    <CardDescription>{t('reports_submitted')}</CardDescription>
                    <CardTitle className="text-4xl">{reportsSubmitted}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                    <CardHeader className="pb-2">
                    <CardDescription className="text-green-800 dark:text-green-300">{t('co2_saved')}</CardDescription>
                    <CardTitle className="text-4xl text-green-700 dark:text-green-400">{co2Saved}<span className="text-2xl">kg</span></CardTitle>
                    </CardHeader>
                </Card>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('badge_progress')}</CardTitle>
                    <CardDescription>{t('badge_progress_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    {loading ? (
                        <>
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full" />
                        </>
                    ) : upcomingBadges.map(tier => (
                        <BadgeProgressCard key={tier.name} tier={tier} currentPoints={points} />
                    ))}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <Gift className="text-primary"/>
                    {t('reward_marketplace')}
                    </CardTitle>
                    <CardDescription>{t('reward_marketplace_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    {loading ? (
                        <>
                            <Skeleton className="h-28 w-full" />
                            <Skeleton className="h-28 w-full" />
                        </>
                    ) : rewards.map(reward => (
                        <div key={reward.name} className="flex flex-col items-start justify-between p-4 bg-muted/50 rounded-lg border">
                            <div>
                                <p className="font-semibold">{reward.name}</p>
                                <p className="text-sm text-muted-foreground mt-1">{reward.description}</p>
                            </div>
                            <Button size="sm" disabled={points < reward.points} className="mt-4 w-full" onClick={() => handleRedeem(reward.name, reward.points)}>
                                {t('redeem_for_points', { points: reward.points })}
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>

        </div>
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <Star className="text-yellow-400" />
                    {t('next_reward_tier')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            {t('on_your_way', { nextRole })}
                        </p>
                        <Progress value={progressToNextRole} className="h-4" />
                        <p className="text-xs font-semibold text-primary">
                            {points.toLocaleString()} / {nextTier.toLocaleString()} {t('points').toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {t('points_to_go', { points: (nextTier - points).toLocaleString() })}
                        </p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="text-amber-500" />
                        {t('your_achievements')}
                    </CardTitle>
                    <CardDescription>
                        {t('your_achievements_desc')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {earnedBadges.length > 0 ? (
                        <div className="flex items-center gap-2 flex-wrap">
                            {earnedBadges.map((badge) => (
                                <Badge key={badge} variant="secondary" className="flex items-center text-sm p-2 gap-1.5">
                                    {badgeIcons[badge] || <Star className="h-4 w-4" />}
                                    {t(getBadgeKey(badge))}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">{t('earn_first_badge')}</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
