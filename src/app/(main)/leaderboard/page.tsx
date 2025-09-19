

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table"
import { getLeaderboardData } from "@/lib/data"
import type { LeaderboardEntry } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/hooks/use-language';

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    async function loadData() {
        setLoading(true);
        const leaderboard = await getLeaderboardData();
        setData(leaderboard);
        setLoading(false);
    }
    loadData();
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('leaderboard_title')}</CardTitle>
        <CardDescription>
          {t('leaderboard_description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        ) : (
            <LeaderboardTable data={data} />
        )}
      </CardContent>
    </Card>
  )
}
