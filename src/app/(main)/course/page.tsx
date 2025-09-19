

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getTrainingCourse, getWasteWorkerTrainingCourse } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Lock, Award, Download, Star, PlayCircle, FileText, Puzzle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ModuleDialog, TaskType } from "@/components/course/module-dialog";
import type { TrainingCourse, TrainingModule, ModuleCompletionState } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/use-language";

export default function CoursePage() {
  const { user, login } = useAuth();
  const [trainingCourse, setTrainingCourse] = useState<TrainingCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(user?.courseProgress || 0);
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [isModuleOpen, setIsModuleOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<TrainingModule | null>(null);
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);
  
  const [moduleCompletion, setModuleCompletion] = useState<ModuleCompletionState>(user?.moduleCompletion || {});

  useEffect(() => {
    async function loadCourse() {
      setLoading(true);
      if (user) {
        const courseData = user.role === 'Waste Worker' 
            ? await getWasteWorkerTrainingCourse()
            : await getTrainingCourse();
        setTrainingCourse(courseData);
      }
      setLoading(false);
    }
    if (user) {
        loadCourse();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
        setProgress(user.courseProgress || 0);
        setModuleCompletion(user.moduleCompletion || {});
    }
  }, [user]);

  if (loading || !trainingCourse || !user) {
     return (
        <div className="container mx-auto py-8">
            <div className="grid md:grid-cols-4 gap-8">
                <div className="md:col-span-3 space-y-4">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <div className="md:col-span-1">
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        </div>
    );
  }

  const completedModules = trainingCourse ? Math.floor((progress / 100) * trainingCourse.modules.length) : 0;
  
  const handleTaskClick = (module: TrainingModule, task: TaskType) => {
    setActiveModule(module);
    setActiveTask(task);
    setIsModuleOpen(true);
  }

  const handleTaskComplete = (moduleId: string, task: TaskType) => {
    if(moduleCompletion[moduleId]?.[task]) return; // Already complete

    const newModuleCompletion = {
      ...moduleCompletion,
      [moduleId]: {
        ...moduleCompletion[moduleId],
        [task]: true,
      }
    };
    
    setModuleCompletion(newModuleCompletion);
    login({ ...user, moduleCompletion: newModuleCompletion }); // Save progress

    toast({
        title: t('task_complete'),
        description: t('task_complete_desc', { task, moduleTitle: activeModule?.title })
    });
    setIsModuleOpen(false); // Close dialog on completion
  }

  const areAllTasksCompleted = (moduleId: string) => {
    if(!moduleCompletion[moduleId]) return false;
    const moduleState = moduleCompletion[moduleId];
    return moduleState.video && moduleState.content && moduleState.quiz;
  }

  const handleCompleteModule = (moduleId: string) => {
    if (!trainingCourse) return;
    const moduleIndex = trainingCourse.modules.findIndex(m => m.id === moduleId);
    const newCompletedModules = moduleIndex + 1;
    const newProgress = Math.min(100, (newCompletedModules / trainingCourse.modules.length) * 100);
    
    if (newProgress > progress) {
        setProgress(newProgress);
        
        const updatedUser = { ...user, courseProgress: newProgress, points: (user.points || 0) + 20 };
        if (newProgress >= 100 && !user.badges?.includes("Certified Recycler")) {
            updatedUser.badges = [...(user.badges || []), "Certified Recycler"];
        }
        login(updatedUser); // Save all user updates

        toast({
          title: t('module_completed'),
          description: t('module_completed_desc', { progress: newProgress.toFixed(0) }),
        });

        if (newProgress >= 100) {
          // Force re-render to show certificate view
          setTimeout(() => router.push('/dashboard'), 500);
        }
    }
  };
  
  const handleDownload = () => {
    toast({
        title: t('request_processing'),
        description: t('certificate_generating'),
    });
  }

  const handleStart = () => {
    const updatedUser = { ...user, courseProgress: progress === 0 ? 0.1 : progress };
    login(updatedUser);
    setProgress(updatedUser.courseProgress);
  }

  if (progress === 0) {
      return (
         <div className="flex flex-1 items-center justify-center p-4">
            <Card className="max-w-2xl w-full text-center shadow-lg">
                 <CardHeader>
                    <CardTitle className="text-3xl text-primary">{trainingCourse.title}</CardTitle>
                    <CardDescription className="text-base">{trainingCourse.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="prose prose-sm dark:prose-invert mx-auto">
                        <p>{t('course_welcome', { name: user.name })}</p>
                        <p>{t('course_duration', { minutes: trainingCourse.modules.reduce((acc, m) => acc + m.duration, 0) })}</p>
                    </div>
                    <Button size="lg" onClick={handleStart}>{t('start_training')}</Button>
                </CardContent>
            </Card>
        </div>
      )
  }

  if (progress >= 100) {
    return (
        <div className="flex flex-1 items-center justify-center p-4">
            <Card className="max-w-2xl w-full text-center shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-br from-primary to-green-700 p-8 text-primary-foreground">
                     <Award className="mx-auto h-20 w-20 text-yellow-300 mb-4 animate-pulse" />
                     <h2 className="text-3xl font-bold tracking-tight">{t('congratulations', { name: user.name })}</h2>
                     <p className="text-primary-foreground/80 mt-2">{t('course_complete')}</p>
                </div>
                <CardContent className="p-8 space-y-6">
                   <div className="text-muted-foreground">{t('certified_recycler_badge')}</div>
                   <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border-2 border-dashed">
                    <div className="text-center">
                        <p className="text-sm font-semibold text-gray-500">GOVERNMENT OF INDIA</p>
                        <p className="text-2xl font-bold text-primary mt-2">{t('certificate_of_completion')}</p>
                        <p className="mt-4 text-muted-foreground">{t('certifies_that')}</p>
                        <p className="text-xl font-semibold text-accent-foreground mt-1">{user.name}</p>
                        <p className="mt-2 text-muted-foreground max-w-sm mx-auto">{t('has_completed')}</p>
                        <div className="flex justify-between items-center mt-6 text-xs text-gray-500">
                            <p>{t('date')}: {new Date().toLocaleDateString()}</p>
                            <p>Swachh Bharat Mission</p>
                        </div>
                    </div>
                   </div>
                    <div className="flex gap-4 justify-center">
                        <Button size="lg" onClick={() => router.push('/dashboard')}>
                            {t('go_to_dashboard')}
                        </Button>
                        <Button size="lg" variant="outline" onClick={handleDownload}>
                            <Download className="mr-2 h-5 w-5"/> {t('download_certificate')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <>
    {activeModule && activeTask && (
        <ModuleDialog 
            isOpen={isModuleOpen}
            setIsOpen={setIsModuleOpen}
            module={activeModule}
            taskType={activeTask}
            onTaskComplete={handleTaskComplete}
        />
    )}
    <div className="container mx-auto py-8">
      <div className="grid md:grid-cols-4 gap-8">
        <div className="md:col-span-3">
            <h1 className="text-3xl font-bold tracking-tight mb-2">{trainingCourse.title}</h1>
             <p className="text-muted-foreground mb-6">{trainingCourse.description}</p>
            <Accordion type="single" collapsible defaultValue={trainingCourse.modules[completedModules]?.id} className="w-full space-y-4">
            {trainingCourse.modules.map((module, index) => {
                const isModuleUnlocked = index <= completedModules;
                const isModuleCompleted = index < completedModules;
                const allTasksDone = areAllTasksCompleted(module.id);
                return (
                <AccordionItem key={module.id} value={module.id} className="border-none">
                    <Card className={cn("transition-all", !isModuleUnlocked && "bg-muted/50", isModuleCompleted && "border-green-500")}>
                        <AccordionTrigger
                            disabled={!isModuleUnlocked}
                            className="p-6 text-lg hover:no-underline disabled:cursor-not-allowed"
                        >
                            <div className="flex items-center gap-4 flex-1">
                                {isModuleCompleted ? <CheckCircle className="h-8 w-8 text-green-500"/> : !isModuleUnlocked ? <Lock className="h-8 w-8 text-muted-foreground" /> : <div className="h-8 w-8 rounded-full border-2 border-primary flex items-center justify-center font-bold text-primary">{index + 1}</div>}
                                <div className="text-left">
                                    <h3 className={cn("font-semibold", !isModuleUnlocked && "text-muted-foreground")}>{module.title}</h3>
                                    <p className="text-sm text-muted-foreground">{module.duration} min</p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                            <div className="prose prose-sm max-w-none text-muted-foreground border-t pt-4 dark:prose-invert">
                                <p>{module.content}</p>
                                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
                                    <Button variant={moduleCompletion[module.id]?.video ? "default" : "outline"} onClick={() => handleTaskClick(module, 'video')}>
                                        {moduleCompletion[module.id]?.video && <CheckCircle className="mr-2 h-4 w-4"/>}
                                        <PlayCircle className="mr-2 h-4 w-4"/> {t('watch_video')}
                                    </Button>
                                    <Button variant={moduleCompletion[module.id]?.content ? "default" : "outline"} onClick={() => handleTaskClick(module, 'content')}>
                                        {moduleCompletion[module.id]?.content && <CheckCircle className="mr-2 h-4 w-4"/>}
                                        <FileText className="mr-2 h-4 w-4"/> {t('read_content')}
                                    </Button>
                                    <Button variant={moduleCompletion[module.id]?.quiz ? "default" : "outline"} onClick={() => handleTaskClick(module, 'quiz')}>
                                        {moduleCompletion[module.id]?.quiz && <CheckCircle className="mr-2 h-4 w-4"/>}
                                        <Puzzle className="mr-2 h-4 w-4"/> {t('take_quiz')}
                                    </Button>
                                </div>
                                <h4 className="font-semibold">{t('key_takeaways')}</h4>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    {module.keyTakeaways.map((takeaway, i) => <li key={i}>{takeaway}</li>)}
                                </ul>
                            </div>
                            <Button onClick={() => handleCompleteModule(module.id)} className="mt-4" disabled={isModuleCompleted || !allTasksDone}>
                                {isModuleCompleted ? t('completed') : t('mark_as_complete')}
                            </Button>
                        </AccordionContent>
                    </Card>
                </AccordionItem>
                )
            })}
            </Accordion>
        </div>
        <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>{t('course_progress')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Progress value={progress} className="h-4" />
                        <p className="text-sm font-medium text-center text-primary">{t('percent_complete', { progress: progress.toFixed(0) })}</p>
                        <p className="text-xs text-muted-foreground text-center">
                            {t('modules_completed', { completed: completedModules, total: trainingCourse.modules.length })}
                        </p>
                         <Button className="w-full mt-4" disabled={progress < 100} onClick={() => router.push('/dashboard')}>{t('go_to_dashboard')}</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
    </>
  );
}
