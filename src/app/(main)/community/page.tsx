

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getCommunityEvents, createCommunityEvent } from "@/lib/data";
import type { CommunityEvent } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, User, ArrowRight, PlusCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/use-language";


function AddEventDialog({ onCreate }: { onCreate: (event: CommunityEvent) => void }) {
    const { toast } = useToast();
    const { user } = useAuth();
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        
        try {
            const newEventData = {
                title: formData.get('title') as string,
                type: formData.get('type') as 'Cleanup Drive' | 'Workshop' | 'Plantation' | 'Swachh Camp',
                date: (formData.get('date') as string),
                location: formData.get('location') as string,
                organizer: user?.name || 'Community Leader',
            };
            
            const newEvent = await createCommunityEvent(newEventData);

            onCreate(newEvent);

            toast({
                title: t('event_created'),
                description: t('event_created_desc', { title: newEvent.title }),
            });
            setOpen(false);
        } catch (error) {
             toast({
                variant: 'destructive',
                title: "Error",
                description: "Failed to create event.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t('create_event')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                 <DialogHeader>
                    <DialogTitle>{t('schedule_new_event')}</DialogTitle>
                    <DialogDescription>
                        {t('schedule_new_event_desc')}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="title">{t('event_title')}</Label>
                        <Input id="title" name="title" placeholder="e.g., Koregaon Park Cleanup" required />
                    </div>
                     <div>
                        <Label htmlFor="type">{t('event_type')}</Label>
                        <Select name="type" required>
                            <SelectTrigger>
                                <SelectValue placeholder={t('select_a_type')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Cleanup Drive">{t('cleanup_drive')}</SelectItem>
                                <SelectItem value="Workshop">{t('workshop')}</SelectItem>
                                <SelectItem value="Plantation">{t('plantation')}</SelectItem>
                                <SelectItem value="Swachh Camp">{t('swachh_camp')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label htmlFor="date">{t('date')}</Label>
                        <Input id="date" name="date" type="date" required />
                    </div>
                     <div>
                        <Label htmlFor="location">{t('location')}</Label>
                        <Input id="location" name="location" placeholder="e.g., Near Bund Garden Bridge" required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {t('schedule_event')}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}


export default function CommunityPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const { t } = useLanguage();
    const [communityEvents, setCommunityEvents] = useState<CommunityEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      async function loadEvents() {
        setLoading(true);
        const events = await getCommunityEvents();
        setCommunityEvents(events);
        setLoading(false);
      }
      loadEvents();
    }, [])

    const handleJoinEvent = (title: string) => {
        toast({
            title: t('you_joined_event'),
            description: t('join_event_desc', { title }),
        });
    }

    const handleCreateEvent = (event: CommunityEvent) => {
        setCommunityEvents(prev => [event, ...prev]);
    }
    
    const getEventTypeKey = (type: string) => {
      return type.toLowerCase().replace(/ /g, '_');
    }

  return (
    <div className="space-y-8">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('community_hub_title')}</h1>
                <p className="text-muted-foreground">
                    {t('community_hub_description')}
                </p>
            </div>
             {user && (user.role === 'Admin' || user.role === 'Green Champion') && (
                <AddEventDialog onCreate={handleCreateEvent} />
            )}
        </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
            Array.from({length: 3}).map((_, i) => (
                <Card key={i}>
                    <Skeleton className="aspect-video w-full rounded-t-lg"/>
                    <CardContent className="p-4 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            ))
        ) : communityEvents.map((event) => (
          <Card key={event.id} className="flex flex-col">
            <CardHeader className="p-0">
              <div className="relative aspect-video">
                <Image
                  src={event.imageUrl || ''}
                  alt={event.title}
                  width={800}
                  height={600}
                  className="object-cover rounded-t-lg w-full h-auto"
                  data-ai-hint={event.aiHint}
                />
                 <Badge className="absolute top-2 right-2">{t(getEventTypeKey(event.type))}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-1">
              <h3 className="text-xl font-bold leading-tight mb-2">{event.title}</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {event.location}</p>
                <p className="flex items-center gap-2"><User className="h-4 w-4" /> {t('organized_by', { organizer: event.organizer })}</p>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button className="w-full" onClick={() => handleJoinEvent(event.title)}>
                    {t('join_event')} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
