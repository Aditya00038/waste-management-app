
"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { classifyWasteImageAction } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { CameraCapture } from "./camera-capture";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UploadCloud, Loader2, Award, Send, AlertTriangle, MapPin, Camera, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ClassifyWasteImageOutput } from "@/lib/types"; // Updated import from types
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { storage, db } from "@/lib/firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";

const formSchema = z.object({
  image: z.any().refine((files) => files?.length > 0, "image_upload_error"),
  description: z.string().optional(),
  location: z.string().min(1, "Location is required."),
  isHighPriority: z.boolean().default(false),
});

type FormSchema = z.infer<typeof formSchema>;

export function ReportForm() {
  const { user, login } = useAuth();
  const [isClassifying, startClassification] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ClassifyWasteImageOutput | null>(null);
  const [step, setStep] = useState(1);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const { toast } = useToast();
  const { t } = useLanguage();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      location: user?.address || "Pune, Maharashtra",
      isHighPriority: false,
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        form.setValue("image", e.target.files);
        form.clearErrors("image");
        setResult(null);
        setMediaType('image');
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCameraCapture = (dataUrl: string, type: 'image' | 'video') => {
    setPreview(dataUrl);
    setIsCameraOpen(false);
    setMediaType(type);
    
    // Create a file from the data URL
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeType = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([arrayBuffer], { type: mimeType });
    const fileName = `captured-${type}-${Date.now()}.${type === 'image' ? 'jpg' : 'webm'}`;
    const file = new File([blob], fileName, { type: mimeType });
    
    // Create a synthetic event to pass to the form
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    
    form.setValue("image", dataTransfer.files);
    form.clearErrors("image");
    setResult(null);
  };

  const onClassify = async () => {
    if (!preview) {
      form.setError("image", { type: "manual", message: t('image_upload_error') });
      return;
    };
    
    // Only process if it's an image (videos would require different AI processing)
    if (mediaType !== 'image') {
      toast({
        variant: "default",
        title: "Video Processing",
        description: "Video will be uploaded as-is. AI classification is only available for images.",
      });
      // Skip AI classification for videos and go directly to step 2
      setResult({
        category: 'dry', // Default category, can be changed by user
        confidence: 0.5
      });
      setStep(2);
      return;
    }
    
    startClassification(async () => {
      try {
        setResult(null);
        const { data, error } = await classifyWasteImageAction(preview);
        if (error) {
          throw new Error(error);
        }
        if (data) {
          // Ensure the result has the expected format with required properties
          const processedResult = {
            category: data.category || 'dry',
            confidence: data.confidence || 0.7
          };
          setResult(processedResult);
          setStep(2);
        }
      } catch (e: any) {
         toast({
          variant: "destructive",
          title: t('error_occurred'),
          description: e.message || 'Failed to analyze image.',
        });
      }
    });
  };

  const onSubmitReport = async (values: FormSchema) => {
    if (!preview || !user || !result) return;

    setIsSubmitting(true);
    try {
      // 1. Upload media to Firebase Storage
      const fileType = mediaType === 'image' ? 'images' : 'videos';
      const storageRef = ref(storage, `reports/${user.id}/${fileType}/${Date.now()}`);
      const uploadTask = await uploadString(storageRef, preview, 'data_url');
      const mediaUrl = await getDownloadURL(uploadTask.ref);

      // 2. Save report to Firestore
      await addDoc(collection(db, "reports"), {
        userId: user.id,
        mediaUrl: mediaUrl,
        mediaType: mediaType,
        category: result.category,
        confidence: result.confidence,
        location: values.location,
        description: values.description,
        isHighPriority: values.isHighPriority,
        status: "Pending",
        createdAt: serverTimestamp(),
      });

      // 3. Update user's points
      const newPoints = (user.points || 0) + (mediaType === 'video' ? 15 : 10); // Extra points for video
      const userDocRef = doc(db, "users", user.id);
      await updateDoc(userDocRef, { points: newPoints });
      login({ ...user, points: newPoints }); // This updates the context immediately

      setIsSubmitting(false);
      setStep(3);

    } catch (error: any) {
      setIsSubmitting(false);
      toast({
        variant: "destructive",
        title: t('error_occurred'),
        description: error.message || "Failed to submit report. Please try again.",
      });
    }
  }
  
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'wet': return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700';
      case 'dry': return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700';
      case 'hazardous': return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleReset = () => {
    form.reset({
      description: "",
      location: user?.address || "Pune, Maharashtra",
      isHighPriority: false,
    });
    setPreview(null);
    setResult(null);
    setStep(1);
  }

  if (step === 3) {
    return (
        <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="p-8">
                <Award className="mx-auto h-16 w-16 text-yellow-400 mb-4" />
                <h2 className="text-3xl font-bold tracking-tight text-primary">{t('report_submitted_success')}</h2>
                <p className="text-muted-foreground mt-2">
                    {t('report_submitted_success_desc')}
                </p>
                 <Alert className={`mt-6 ${getCategoryColor(result?.category)} text-left`}>
                    <AlertTriangle className={`h-4 w-4 ${getCategoryColor(result?.category).split(' ')[1]}`} />
                    <AlertTitle className="font-bold">{t('submission_summary')}</AlertTitle>
                    <AlertDescription>
                            {t('submission_summary_desc', { category: result?.category || '', location: form.getValues('location') || '' })}
                             {form.getValues('isHighPriority') && (
                                <span className="block mt-2 font-semibold text-destructive-foreground bg-destructive p-2 rounded-md">{t('high_priority_submission')}</span>
                            )}
                    </AlertDescription>
                </Alert>
                <Button onClick={handleReset} className="mt-6 w-full">{t('report_more_waste')}</Button>
            </CardContent>
        </Card>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(step === 1 ? onClassify : onSubmitReport)} className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>{t('report_waste_title')}</CardTitle>
                <CardDescription>
                    {step === 1 ? t('ai_classify_desc') : t('confirm_details_desc')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className={step === 2 ? "grid md:grid-cols-2 gap-6" : ""}>
                    <div>
                        <FormField
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>{t('waste_image')}</FormLabel>
                            <FormControl>
                                <div className="flex flex-col items-center justify-center w-full">
                                {isCameraOpen ? (
                                  <CameraCapture 
                                    onCapture={handleCameraCapture} 
                                    onCancel={() => setIsCameraOpen(false)}
                                  />
                                ) : (
                                  <div className="w-full space-y-2">
                                    <label htmlFor="dropzone-file" className={cn("flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted relative", (step === 2 || isClassifying) && "cursor-not-allowed opacity-70")}>
                                        {preview ? (
                                            <>
                                              {mediaType === 'image' ? (
                                                <Image src={preview} alt="Image preview" fill className="object-contain rounded-lg p-2" />
                                              ) : (
                                                <video src={preview} controls className="w-full h-full object-contain rounded-lg p-2" />
                                              )}
                                            </>
                                        ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">{t('upload_or_drag')}</span></p>
                                            <p className="text-xs text-muted-foreground">{t('image_formats')}</p>
                                        </div>
                                        )}
                                        <Input id="dropzone-file" type="file" className="hidden" onChange={handleImageChange} accept="image/*" disabled={step === 2 || isClassifying} />
                                        {isClassifying && (
                                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                            </div>
                                        )}
                                    </label>
                                    <div className="flex gap-2 justify-center">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsCameraOpen(true)}
                                        disabled={step === 2 || isClassifying}
                                        className="flex-1"
                                      >
                                        <Camera className="mr-2 h-4 w-4" />
                                        Use Camera
                                      </Button>
                                    </div>
                                  </div>
                                )}
                                </div>
                            </FormControl>
                            <FormMessage>{form.formState.errors.image?.message ? t(form.formState.errors.image.message as string) : ''}</FormMessage>
                            </FormItem>
                        )}
                        />
                         {result && (
                            <Alert className={`mt-4 ${getCategoryColor(result.category)}`}>
                                <AlertTriangle className={`h-4 w-4 ${getCategoryColor(result.category).split(' ')[1]}`} />
                                <AlertTitle className="font-bold">{t('ai_classification')}</AlertTitle>
                                <AlertDescription>
                                    {t('ai_classification_desc', { category: result.category, confidence: (result.confidence * 100).toFixed(0) })}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                    <div className={cn("space-y-4", step === 1 && "hidden")}>
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>{t('location')}</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                    <Input {...field} placeholder={t('location')} className="pl-8" />
                                    <MapPin className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>{t('description_optional')}</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder={t('description_placeholder')} rows={4} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="isHighPriority"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                                    <FormControl>
                                        <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-destructive"/>
                                            {t('high_priority')}
                                        </FormLabel>
                                        <FormMessage />
                                        <p className="text-xs text-muted-foreground">
                                            {t('high_priority_desc')}
                                        </p>
                                    </div>
                                </FormItem>
                            )}
                        />
                         <div className="relative aspect-video rounded-md overflow-hidden">
                            <Image src="https://picsum.photos/seed/map-report/1200/800" alt="Map" fill className="object-cover" data-ai-hint="city map"/>
                        </div>
                    </div>
               </div>
            </CardContent>
            <CardFooter>
                 {step === 1 ? (
                    <Button type="button" onClick={onClassify} className="w-full" disabled={isClassifying || !preview}>
                        {isClassifying ? (
                            <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('analyzing_image')}
                            </>
                        ) : (
                            t('classify_and_continue')
                        )}
                        </Button>
                 ) : (
                    <div className="w-full flex flex-col sm:flex-row gap-2">
                        <Button type="button" variant="outline" className="w-full sm:w-1/3" onClick={() => setStep(1)}>{t('back')}</Button>
                        <Button type="submit" className="w-full sm:w-2/3" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('submitting_report')}
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    {t('submit_report')}
                                </>
                            )}
                        </Button>
                    </div>
                 )}
            </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
