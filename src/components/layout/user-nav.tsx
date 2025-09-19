

"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { SmartLink } from "@/components/ui/smart-link";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSwitcher } from "@/components/language-switcher";
import { NotificationCenter } from "@/components/dashboard/notification-center";

export function UserNav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
    router.push("/");
  };
  
  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <NotificationCenter />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.role}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <SmartLink href="/profile">{t('profile')}</SmartLink>
          </DropdownMenuItem>
          <DropdownMenuItem>{t('settings')}</DropdownMenuItem>
          
          <LanguageSwitcher isSubMenu={true} />

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>{t('logout')}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
