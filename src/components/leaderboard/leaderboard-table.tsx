
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { LeaderboardEntry } from "@/lib/types"
import { Award, Star, Shield, GraduationCap } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

const badgeIcons: { [key: string]: React.ReactNode } = {
  "Recycle Pro": <Award className="mr-1 h-3 w-3 text-yellow-500" />,
  "Waste Warrior": <Shield className="mr-1 h-3 w-3 text-blue-500" />,
  "Eco-Star": <Star className="mr-1 h-3 w-3 text-green-500" />,
  "Community Hero": <Star className="mr-1 h-3 w-3 text-purple-500" />,
  "Cleanliness Captain": <Shield className="mr-1 h-3 w-3 text-red-500" />,
  "Certified Recycler": <GraduationCap className="mr-1 h-3 w-3 text-orange-500" />
};

export function LeaderboardTable({ data }: { data: LeaderboardEntry[] }) {
  const { t } = useLanguage();

  const getBadgeKey = (badgeName: string) => {
    return badgeName.toLowerCase().replace(/ /g, '_').replace(/-/g, '_');
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">{t('rank')}</TableHead>
          <TableHead>{t('user')}</TableHead>
          <TableHead className="hidden md:table-cell">{t('badges')}</TableHead>
          <TableHead className="text-right">{t('points')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((entry) => (
          <TableRow key={entry.rank}>
            <TableCell className="font-medium text-lg">{entry.rank}</TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={entry.user.avatar} alt={entry.user.name} />
                  <AvatarFallback>{entry.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{entry.user.name}</p>
                  <p className="text-sm text-muted-foreground">{entry.user.role}</p>
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <div className="flex items-center gap-2 flex-wrap">
                {entry.user.badges?.map((badge) => (
                  <Badge key={badge} variant="secondary" className="flex items-center">
                    {badgeIcons[badge] || <Star className="mr-1 h-3 w-3" />}
                    {t(getBadgeKey(badge))}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell className="text-right font-semibold">{entry.user.points?.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
