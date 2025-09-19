
"use client";

import Link from "next/link";
import { SmartLink } from "@/components/ui/smart-link";
import {
  Home,
  PanelLeft,
  Trash2,
  Trophy,
  Bot,
  MapPin,
  Search,
  BookOpen,
  LineChart,
  GraduationCap,
  Gift,
  Users,
  User as UserIcon,
  ShoppingCart,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { UserNav } from "@/components/layout/user-nav";
import { Icons } from "@/components/icons";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/lib/types";
import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { CartSheet } from "../shop/cart-sheet";

const navItems = [
  { href: "/dashboard", icon: Home, labelKey: "dashboard", roles: ["Admin", "Citizen", "Green Champion", "Waste Worker"] as UserRole[] },
  { href: "/report", icon: Trash2, labelKey: "report_waste", roles: ["Citizen", "Green Champion"] as UserRole[] },
  { href: "/shop", icon: ShoppingCart, labelKey: "shop", roles: ["Admin", "Citizen", "Green Champion", "Waste Worker"] as UserRole[] },
  { href: "/leaderboard", icon: Trophy, labelKey: "leaderboard", roles: ["Citizen", "Green Champion", "Admin"] as UserRole[] },
  { href: "/impact", icon: LineChart, labelKey: "my_impact", roles: ["Citizen", "Green Champion"] as UserRole[] },
  { href: "/profile", icon: UserIcon, labelKey: "profile", roles: ["Admin", "Citizen", "Green Champion", "Waste Worker"] as UserRole[] },
  { href: "/course", icon: GraduationCap, labelKey: "training_course", roles: ["Admin", "Citizen", "Green Champion", "Waste Worker"] as UserRole[] },
  { href: "/education", icon: BookOpen, labelKey: "learn", roles: ["Admin", "Citizen", "Green Champion", "Waste Worker"] as UserRole[] },
  { href: "/training", icon: Bot, labelKey: "training", roles: ["Waste Worker", "Admin"] as UserRole[] },
  { href: "/facilities", icon: MapPin, labelKey: "facilities", roles: ["Admin", "Citizen", "Green Champion", "Waste Worker"] as UserRole[] },
  { href: "/wow", icon: Gift, labelKey: "wall_of_worth", roles: ["Admin", "Citizen", "Green Champion", "Waste Worker"] as UserRole[] },
  { href: "/community", icon: Users, labelKey: "community", roles: ["Admin", "Citizen", "Green Champion", "Waste Worker"] as UserRole[] },
];

export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const currentNavItem = navItems.find(item => pathname.startsWith(item.href));
  const pageTitle = currentNavItem ? t(currentNavItem.labelKey) : t('dashboard');


  const userHasAccess = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };
  
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">{t('toggle_menu')}</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <SheetTitle className="sr-only">{t('menu')}</SheetTitle>
          <nav className="grid gap-6 text-lg font-medium">
            <SmartLink
              href="/dashboard"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
              onClick={() => setIsSheetOpen(false)}
            >
              <Icons.logo className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">Swachh Bharat</span>
            </SmartLink>
            {navItems.map(item => userHasAccess(item.roles) ? (
              <SmartLink
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                onClick={() => setIsSheetOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {t(item.labelKey)}
              </SmartLink>
            ) : null
            )}
          </nav>
        </SheetContent>
      </Sheet>
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <SmartLink href="/dashboard">{t('dashboard')}</SmartLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t('search_placeholder')}
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
        />
      </div>
      <CartSheet />
      <UserNav />
    </header>
  );
}
