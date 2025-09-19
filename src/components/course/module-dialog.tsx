
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { TrainingModule } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export type TaskType = 'video' | 'content' | 'quiz';

interface ModuleDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  module: TrainingModule;
  taskType: TaskType;
  onTaskComplete: (moduleId: string, taskType: TaskType) => void;
}

export function ModuleDialog({ isOpen, setIsOpen, module, taskType, onTaskComplete }: ModuleDialogProps) {
  const { t } = useLanguage();

  const getTitle = () => {
    switch(taskType) {
      case 'video': return t('module_video');
      case 'content': return t('reading_material');
      case 'quiz': return t('knowledge_check');
    }
  }

  const renderContent = () => {
    switch(taskType) {
      case 'video': return <VideoPlayer onVideoEnd={() => onTaskComplete(module.id, 'video')} />;
      case 'content': return <ContentReader content={module.content} onReadEnd={() => onTaskComplete(module.id, 'content')} />;
      case 'quiz': return <Quiz quizData={module.quiz} onQuizPass={() => onTaskComplete(module.id, 'quiz')} />;
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}: {module.title}</DialogTitle>
          <DialogDescription>
            {t('module_dialog_desc')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}


// --- Task Components ---

const VideoPlayer = ({ onVideoEnd }: { onVideoEnd: () => void }) => {
    const [progress, setProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if(isPlaying && progress < 100) {
            timer = setInterval(() => {
                setProgress(prev => Math.min(prev + 1, 100));
            }, 50); // Simulate 5 second video
        }
        if(progress >= 100) {
            onVideoEnd();
        }
        return () => clearInterval(timer);
    }, [isPlaying, progress, onVideoEnd])

    return (
        <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-lg flex items-center justify-center">
                <Image src="https://picsum.photos/seed/video-placeholder/1280/720" alt="video placeholder" fill className="object-cover opacity-50" data-ai-hint="waste management video"/>
                {!isPlaying && progress === 0 && <p className="text-white z-10">Click "Play" to start the video simulation</p>}
            </div>
            <Progress value={progress} />
            <Button onClick={() => setIsPlaying(true)} disabled={isPlaying || progress > 0} className="w-full">
                {progress > 0 && progress < 100 ? "Playing..." : progress === 100 ? "Complete" : "Play Video"}
            </Button>
        </div>
    )
}

const ContentReader = ({ content, onReadEnd }: { content: string, onReadEnd: () => void }) => {
    useEffect(() => {
      // Automatically mark as read when the component opens.
      const timer = setTimeout(() => {
        onReadEnd();
      }, 500); // Short delay to allow user to see the content
      return () => clearTimeout(timer);
    }, [onReadEnd]);

    return (
        <div className="space-y-4">
            <ScrollArea className="h-72 w-full rounded-md border">
                <div className="prose prose-sm max-w-none dark:prose-invert p-4">
                    <p>{content}</p>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, Orci nonummy moles tie haud, Moroz tangia, ves tilo buros ets, me ets sed libero, maxim us. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.</p>
                </div>
            </ScrollArea>
             <div className="flex items-center justify-center gap-2 p-4 rounded-md bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-800">
                <CheckCircle className="h-5 w-5" />
                <p className="text-sm font-semibold">Content marked as read!</p>
            </div>
        </div>
    )
}

const Quiz = ({ quizData, onQuizPass }: { quizData: TrainingModule['quiz'], onQuizPass: () => void }) => {
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    
    const handleSubmit = () => {
        if(selectedValue === quizData.correctAnswer) {
            setIsCorrect(true);
            setTimeout(() => {
                onQuizPass();
            }, 1000);
        } else {
            setIsCorrect(false);
        }
    }

    return (
        <div className="space-y-6">
            <p className="font-semibold">{quizData.question}</p>
            <RadioGroup onValueChange={setSelectedValue} value={selectedValue || ""}>
                {quizData.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`q1-o${index}`} />
                        <Label htmlFor={`q1-o${index}`}>{option}</Label>
                    </div>
                ))}
            </RadioGroup>
            
            <Button onClick={handleSubmit} disabled={!selectedValue} className="w-full">
                Submit Answer
            </Button>
            
            {isCorrect === false && (
                <p className="text-sm font-medium text-destructive text-center">Not quite. Try again!</p>
            )}
             {isCorrect === true && (
                <p className="text-sm font-medium text-primary text-center">Correct! Well done.</p>
            )}
        </div>
    )
}

    
