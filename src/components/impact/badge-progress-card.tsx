
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BadgeTier } from "@/lib/types"
import { Award, Recycle, Shield, Star } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

const badgeIcons: { [key: string]: React.ReactNode } = {
  "Recycle Pro": <Recycle className="h-8 w-8 text-blue-500" />,
  "Waste Warrior": <Shield className="h-8 w-8 text-green-500" />,
  "Eco-Star": <Star className="h-8 w-8 text-yellow-500" />,
  "Community Hero": <Award className="h-8 w-8 text-purple-500" />,
  "Cleanliness Captain": <Shield className="h-8 w-8 text-red-500" />,
};

interface BadgeProgressCardProps {
  tier: BadgeTier;
  currentPoints: number;
}

export function BadgeProgressCard({ tier, currentPoints }: BadgeProgressCardProps) {
  const { t } = useLanguage();
  const progress = Math.min(100, (currentPoints / tier.requiredPoints) * 100);
  const pointsNeeded = Math.max(0, tier.requiredPoints - currentPoints);

  return (
    <Card>
        <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
            {badgeIcons[tier.name] || <Star className="h-8 w-8 text-muted-foreground" />}
            <div>
                <CardTitle className="text-lg">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground">
                    {pointsNeeded > 0 ? t('points_to_unlock', { points: pointsNeeded.toLocaleString() }) : t('unlocked')}
                </p>
            </div>
        </CardContent>
    </Card>
  )
}

    
