
"use client";

import { useLanguage } from "@/hooks/use-language";
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent
} from "@/components/ui/dropdown-menu";
import { Languages, Globe } from "lucide-react";
import { Button } from "./ui/button";

interface LanguageSwitcherProps {
    isSubMenu?: boolean;
}

export function LanguageSwitcher({ isSubMenu = false }: LanguageSwitcherProps) {
    const { t, language, setLanguage } = useLanguage();

    const content = (
         <DropdownMenuRadioGroup value={language} onValueChange={(value) => setLanguage(value as 'en' | 'hi' | 'mr')}>
            <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="hi">हिन्दी (Hindi)</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="mr">मराठी (Marathi)</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
    );

    if (isSubMenu) {
        return (
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    <Languages className="mr-2 h-4 w-4" />
                    <span>{t('language')}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                        {content}
                         <DropdownMenuSeparator />
                         <DropdownMenuItem disabled className="text-xs justify-center">{t('more_languages_soon')}</DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuPortal>
            </DropdownMenuSub>
        );
    }
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <Globe className="h-5 w-5" />
                    <span className="sr-only">{t('language')}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {content}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

    
