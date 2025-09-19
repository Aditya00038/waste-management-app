
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Edit3, Save } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export default function ProfilePage() {
    const { user, login } = useAuth();
    const { toast } = useToast();
    const { t } = useLanguage();

    if (!user) {
        return <div>{t('dashboard_loading')}</div>;
    }

    const handleProfileUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const updatedUser = {
            ...user,
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
        };
        login(updatedUser);
        toast({
            title: t('profile_update_success'),
            description: t('profile_update_success_desc'),
        });
    }

    const handleAvatarChange = () => {
        toast({
            title: t('feature_in_development'),
            description: t('avatar_change_soon'),
        });
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('profile_title')}</h1>
                <p className="text-muted-foreground">
                    {t('profile_description')}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('profile_account_info')}</CardTitle>
                    <CardDescription>{t('profile_account_info_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <Avatar className="h-24 w-24 border-2 border-primary">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback><User className="h-10 w-10" /></AvatarFallback>
                                </Avatar>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background"
                                    onClick={handleAvatarChange}
                                >
                                    <Edit3 className="h-4 w-4" />
                                    <span className="sr-only">{t('profile_edit_avatar')}</span>
                                </Button>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-semibold">{user.name}</h2>
                                <p className="text-muted-foreground">{user.role}</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('profile_full_name')}</Label>
                                <Input id="name" name="name" defaultValue={user.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">{t('profile_email')}</Label>
                                <Input id="email" name="email" type="email" defaultValue={user.email} />
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">{t('profile_phone')}</Label>
                                <Input id="phone" name="phone" defaultValue={user.phone} />
                            </div>
                             <div className="space-y-2">
                                <Label>{t('profile_role')}</Label>
                                <Input defaultValue={user.role} disabled />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit">
                                <Save className="mr-2 h-4 w-4" />
                                {t('profile_save')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>{t('profile_additional_info')}</CardTitle>
                    <CardDescription>{t('profile_additional_info_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {user.role === 'Citizen' && (
                         <div className="space-y-2">
                            <Label>{t('profile_address')}</Label>
                            <Input defaultValue={user.address} disabled />
                        </div>
                    )}
                     {user.role === 'Green Champion' && (
                         <div className="space-y-2">
                            <Label>{t('profile_assigned_zone')}</Label>
                            <Input defaultValue={user.assignedZone} disabled />
                        </div>
                    )}
                     {user.role === 'Waste Worker' && (
                         <div className="space-y-2">
                            <Label>{t('profile_assigned_route')}</Label>
                            <Input defaultValue={user.assignedRoute} disabled />
                        </div>
                    )}
                     <div className="space-y-2">
                        <Label>{t('profile_points')}</Label>
                        <Input defaultValue={user.points || 0} disabled />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

    
