

"use client";

import React, { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import { getDonationItems, createDonationItem } from "@/lib/data";
import type { DonationItem } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Tag, MapPin, HandHeart, Loader2, Sparkles, UploadCloud } from "lucide-react";
import { Label } from "@/components/ui/label";
import { classifyDonationItemAction } from "@/lib/actions";
import { cn } from "@/lib/utils";
import type { ClassifyDonationItemOutput } from "@/lib/types"; // Updated import from types
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";

function AddDonationDialog({onAdd}: { onAdd: (item: DonationItem) => void }) {
    const { toast } = useToast();
    const { t } = useLanguage();
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [isClassifying, startClassification] = useTransition();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [aiResult, setAiResult] = useState<ClassifyDonationItemOutput | null>(null);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
                setAiResult(null);
                setTitle('');
                setCategory('');

                startClassification(async () => {
                    const result = await classifyDonationItemAction(reader.result as string);
                    if (result.data) {
                        setAiResult(result.data);
                        // Use optional chaining and fallbacks for potentially missing properties
                        setTitle(result.data.suggestedTitle || result.data.itemType || 'Donation Item');
                        setCategory(result.data.category || 'Other');
                         toast({
                            title: t('ai_analysis_complete'),
                            description: t('ai_analysis_complete_desc'),
                        });
                    } else {
                         toast({
                            variant: 'destructive',
                            title: t('ai_analysis_failed'),
                            description: t('ai_analysis_failed_desc'),
                        });
                    }
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!preview || !user) {
            toast({ variant: 'destructive', title: "Missing information", description: "Please upload an image." });
            return;
        }

        setIsSubmitting(true);
        try {
            const newItem = await createDonationItem({
                title,
                category: category as DonationItem['category'],
                description,
                donatedBy: user.name,
                location: user.address?.split(',').slice(-1)[0].trim() || 'Pune',
                photoDataUri: preview
            });
            onAdd(newItem);
            toast({
                title: t('item_submitted'),
                description: t('item_submitted_desc'),
            });
            setOpen(false);
            // Reset form
            setPreview(null);
            setTitle('');
            setCategory('');
            setDescription('');
            setAiResult(null);

        } catch (error) {
            toast({ variant: 'destructive', title: "Submission Failed", description: "Could not submit your item." });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    return (
         <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t('add_donation')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('add_new_donation')}</DialogTitle>
                    <DialogDescription>
                        {t('add_new_donation_desc')}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddItem} className="space-y-4">
                     <div>
                        <Label htmlFor="image">{t('image')}</Label>
                        <div className="flex flex-col items-center justify-center w-full mt-1">
                            <label htmlFor="dropzone-file" className={cn("flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted relative")}>
                                {preview ? (
                                <Image src={preview} alt="Image preview" fill className="object-contain rounded-lg p-2" />
                                ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">{t('upload_or_drag')}</span></p>
                                    <p className="text-xs text-muted-foreground">{t('image_formats')}</p>
                                </div>
                                )}
                                <Input id="dropzone-file" type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                {(isClassifying || isSubmitting) && (
                                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                     <div>
                        <Label htmlFor="title" className="flex items-center gap-2">{t('item_title')} {aiResult && <Sparkles className="h-4 w-4 text-yellow-500"/>}</Label>
                        <Input id="title" placeholder="e.g., Gently Used Winter Clothes" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                     <div>
                        <Label htmlFor="category" className="flex items-center gap-2">{t('category')} {aiResult && <Sparkles className="h-4 w-4 text-yellow-500"/>}</Label>
                        <Select value={category} onValueChange={setCategory} required>
                            <SelectTrigger>
                                <SelectValue placeholder={t('select_a_type')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Clothes">Clothes</SelectItem>
                                <SelectItem value="Books">Books</SelectItem>
                                <SelectItem value="Electronics">Electronics</SelectItem>
                                <SelectItem value="Furniture">Furniture</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label htmlFor="description">{t('description')}</Label>
                        <Textarea id="description" placeholder="Provide a brief description of the item." value={description} onChange={(e) => setDescription(e.target.value)} required />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting || isClassifying || !preview}>{t('submit_item')}</Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}


export default function WallOfWorthPage() {
    const { toast } = useToast();
    const { t } = useLanguage();
    const [donationItems, setDonationItems] = useState<DonationItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadItems() {
            setLoading(true);
            const items = await getDonationItems();
            setDonationItems(items);
            setLoading(false);
        }
        loadItems();
    }, [])

    const handleRequestItem = (title: string) => {
        toast({
            title: t('request_sent'),
            description: t('request_sent_desc', { title }),
        });
    }

    const handleNewItem = (item: DonationItem) => {
        setDonationItems(prev => [item, ...prev]);
    }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('wow_title')}</h1>
            <p className="text-muted-foreground">
            {t('wow_desc')}
            </p>
        </div>
        <AddDonationDialog onAdd={handleNewItem} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
            Array.from({length: 4}).map((_, i) => (
                <Card key={i}>
                    <Skeleton className="aspect-video w-full rounded-t-lg"/>
                    <CardContent className="p-4 space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                    </CardContent>
                    <CardFooter className="p-4 pt-0 border-t mt-4">
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            ))
        ) : donationItems.map((item) => (
          <Card key={item.id} className="flex flex-col">
            <CardHeader className="p-0">
              <div className="relative aspect-video">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover rounded-t-lg"
                  data-ai-hint={item.aiHint || 'donation item'}
                />
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-1">
              <Badge variant="secondary" className="mb-2">{item.category}</Badge>
              <h3 className="text-lg font-semibold leading-tight">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0 border-t mt-4">
                <div className="w-full">
                    <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{item.location}</span>
                        </div>
                         <div className="flex items-center gap-1">
                            <HandHeart className="h-3 w-3" />
                            <span>{t('donated_by')} {item.donatedBy}</span>
                        </div>
                    </div>
                     <Button className="w-full" onClick={() => handleRequestItem(item.title)}>{t('request_item')}</Button>
                </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
