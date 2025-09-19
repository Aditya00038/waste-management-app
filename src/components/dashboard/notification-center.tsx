'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { getUserNotifications, markAllNotificationsAsRead, markNotificationAsRead, deleteNotification } from '@/lib/notifications';
import type { Notification } from '@/lib/notifications';
import { formatDistanceToNow } from 'date-fns';

export function NotificationCenter() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  
  // Fetch notifications when the component mounts or when it's opened
  useEffect(() => {
    if (user && open) {
      fetchNotifications();
    }
  }, [user, open]);
  
  // Periodically check for new notifications (every 30 seconds)
  useEffect(() => {
    if (!user) return;
    
    const intervalId = setInterval(() => {
      // Only fetch if the user is not looking at notifications
      if (!open) {
        fetchUnreadCount();
      }
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [user, open]);
  
  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userNotifications = await getUserNotifications(user.id, 20, true);
      setNotifications(userNotifications);
      
      // Update unread count
      const unread = userNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      const userNotifications = await getUserNotifications(user.id, 100, false);
      setUnreadCount(userNotifications.length);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };
  
  const handleMarkAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      await markNotificationAsRead(notificationId);
      
      // Update the local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    if (!user) return;
    
    try {
      await markAllNotificationsAsRead(user.id);
      
      // Update the local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  const handleDeleteNotification = async (notificationId: string) => {
    if (!user) return;
    
    try {
      await deleteNotification(notificationId);
      
      // Update the local state
      const deleted = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count if the deleted notification was unread
      if (deleted && !deleted.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  // Get the icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'vehicle':
        return <span className="text-lg mr-1">🚛</span>;
      case 'waste':
        return <span className="text-lg mr-1">🗑️</span>;
      case 'achievement':
        return <span className="text-lg mr-1">🏆</span>;
      case 'reward':
        return <span className="text-lg mr-1">🎁</span>;
      default:
        return <span className="text-lg mr-1">📢</span>;
    }
  };
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            {t('notifications')}
            {unreadCount > 0 && (
              <Badge variant="secondary">
                {unreadCount} {t('unread')}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            {t('notifications_description')}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 flex justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchNotifications}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t('refresh')}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || loading}
          >
            <Check className="h-4 w-4 mr-2" />
            {t('mark_all_read')}
          </Button>
        </div>
        
        <ScrollArea className="h-[calc(100vh-12rem)] mt-4 pr-4">
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map(notification => (
                <Card 
                  key={notification.id}
                  className={`p-4 relative ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="mr-2 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => notification.id && handleMarkAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => notification.id && handleDeleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-center">
              <div className="space-y-2">
                <Bell className="h-10 w-10 mx-auto text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  {loading ? t('loading_notifications') : t('no_notifications')}
                </p>
              </div>
            </div>
          )}
        </ScrollArea>
        
        <SheetFooter className="mt-4">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4 mr-2" />
            {t('close')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
