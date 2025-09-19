
"use client";

import { useState, useEffect, useTransition } from "react";
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
import type { User, UserRole } from "@/lib/types"
import { getUsers } from "@/lib/data"
import { MoreHorizontal, Users, Info, Loader2, UserCheck } from "lucide-react"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "../ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Skeleton } from "../ui/skeleton";
import { useLanguage } from "@/hooks/use-language";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { updateUserRoleAction } from "@/lib/actions";


const roleColors: { [key: string]: string } = {
    "Admin": "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700",
    "Green Champion": "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700",
    "Waste Worker": "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700",
    "Citizen": "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/50 dark:text-gray-400 dark:border-gray-700",
    "Bulk Producer": "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700",
}

const availableRoles: UserRole[] = ["Citizen", "Green Champion", "Waste Worker", "Bulk Producer", "Admin"];


export function UserManagementTable() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, startUpdate] = useTransition();

  useEffect(() => {
    async function loadUsers() {
        setLoading(true);
        const data = await getUsers();
        setUsers(data);
        setLoading(false);
    }
    loadUsers();
  }, []);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    startUpdate(async () => {
      const originalUsers = users;
      // Optimistic UI update
      setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, role: newRole } : u));
      
      const result = await updateUserRoleAction({ userId, newRole });
      
      if (result.success) {
        toast({
          title: "User Role Updated",
          description: `User has been successfully updated to ${newRole}.`,
        });
      } else {
        // Revert UI on failure
        setUsers(originalUsers);
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: result.error || "Failed to update user role.",
        });
      }
    });
  }

  const handleSimulatedAction = (action: string, userName: string) => {
    toast({
        title: `Simulated Action: ${action}`,
        description: `The "${action}" action for ${userName} is for demonstration purposes only.`,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          {t('user_management')}
        </CardTitle>
        <CardDescription>{t('user_management_desc')}</CardDescription>
      </CardHeader>
      <CardContent>
         <Alert className="mb-4 bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300 [&>svg]:text-blue-600">
            <Info className="h-4 w-4" />
            <AlertTitle>Demo Note</AlertTitle>
            <AlertDescription>
                Promoting roles is fully functional. Other actions (Reset, Suspend) are simulated.
            </AlertDescription>
        </Alert>
        {loading ? (
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        ) : (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>{t('user')}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('contact')}</TableHead>
                <TableHead>{t('profile_role')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('details')}</TableHead>
                <TableHead><span className="sr-only">{t('actions')}</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                <TableRow key={user.id} className={cn(isUpdating && 'opacity-50')}>
                    <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{user.name}</div>
                    </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <div className="text-xs">
                            <p>{user.email}</p>
                            <p className="text-muted-foreground">{user.phone}</p>
                        </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline" className={cn("font-medium", roleColors[user.role])}>{t(user.role.toLowerCase().replace(' ', '_'))}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {user.role === 'Citizen' && user.address}
                        {user.role === 'Green Champion' && `${t('zone')}: ${user.assignedZone}`}
                        {user.role === 'Waste Worker' && `${t('route')}: ${user.assignedRoute}`}
                        {user.role === 'Bulk Producer' && user.institutionName}
                    </TableCell>
                    <TableCell className="text-right">
                       {isUpdating ? <Loader2 className="h-4 w-4 animate-spin ml-auto" /> : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">{t('user_actions')}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleSimulatedAction('View Profile', user.name)}>{t('view_profile')}</DropdownMenuItem>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        <span>{t('promote_role')}</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                         <DropdownMenuRadioGroup 
                                            value={user.role} 
                                            onValueChange={(newRole) => handleRoleChange(user.id, newRole as UserRole)}
                                        >
                                            <DropdownMenuLabel>Select New Role</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {availableRoles.map(role => (
                                                <DropdownMenuRadioItem 
                                                    key={role} 
                                                    value={role}
                                                    disabled={user.role === role}
                                                >
                                                    {t(role.toLowerCase().replace(' ', '_'))}
                                                </DropdownMenuRadioItem>
                                            ))}
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuItem onClick={() => handleSimulatedAction('Reset Password', user.name)}>{t('reset_password')}</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={() => handleSimulatedAction('Suspend User', user.name)}>{t('suspend_user')}</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                       )}
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>
  )
}
