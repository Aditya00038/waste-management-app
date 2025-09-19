
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { SmartLink } from "@/components/ui/smart-link";
import {
  Home,
  Trash2,
  Trophy,
  Bot,
  MapPin,
  Settings,
  BookOpen,
  LineChart,
  GraduationCap,
  Gift,
  Users,
  User,
  ShoppingCart,
} from "lucide-react";
import { Icons } from "@/components/icons";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";
import { useLanguage } from "@/hooks/use-language";

const navItems = [
  { href: "/dashboard", icon: Home, labelKey: "dashboard", roles: ["Admin", "Citizen", "Green Champion", "Waste Worker"] as UserRole[] },
  { href: "/report", icon: Trash2, labelKey: "report_waste", roles: ["Citizen", "Green Champion"] as UserRole[] },
  { href: "/shop", icon: ShoppingCart, labelKey: "shop", roles: ["Admin", "Citizen", "Green Champion", "Waste Worker"] as UserRole[] },
  { href: "/leaderboard", icon: Trophy, labelKey: "leaderboard", roles: ["Citizen", "Green Champion", "Admin"] as UserRole[] },
  { href: "/impact", icon: LineChart, labelKey: "my_impact", roles: ["Citizen", "Green Champion"] as UserRole[] },
  { href: "/profile", icon: User, labelKey: "profile", roles: ["Admin", "Citizen", "Green Champion", "Waste Worker"] as UserRole[] },
  { href: "/course", icon: GraduationCap, labelKey: "training_course", roles: ["Admin", "Citizen", "Green Champion", "Waste Worker"] as UserRole[] },
  { href: "/education", icon: BookOpen, labelKey: "learn", roles: ["Admin", "Citizen", "Green Champion", "Waste Worker"] as UserRole[] },
  { href: "/training", icon: Bot, labelKey: "training", roles: ["Waste Worker", "Admin"] as UserRole[] },
  { href: "/facilities", icon: MapPin, labelKey: "facilities", roles: ["Admin", "Citizen", "Green Champion", "Waste Worker"] as UserRole[] },
  { href: "/wow", icon: Gift, labelKey: "wall_of_worth", roles: ["Admin", "Citizen", "Green Champion", "Waste Worker"] as UserRole[] },
  { href: "/community", icon: Users, labelKey: "community", roles: ["Admin", "Citizen", "Green Champion", "Waste Worker"] as UserRole[] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLanguage();

  const userHasAccess = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };
  
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <SmartLink
            href="/dashboard"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Icons.logo className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">Swachh Bharat</span>
          </SmartLink>

          {navItems.map((item) =>
            userHasAccess(item.roles) ? (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <SmartLink
                  href={item.href}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                    pathname.startsWith(item.href) && "bg-accent text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{t(item.labelKey)}</span>
                </SmartLink>
              </TooltipTrigger>
              <TooltipContent side="right">{t(item.labelKey)}</TooltipContent>
            </Tooltip>
          ) : null
          )}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <SmartLink
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">{t('settings')}</span>
              </SmartLink>
            </TooltipTrigger>
            <TooltipContent side="right">{t('settings')}</TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>
    </aside>
  );
}
