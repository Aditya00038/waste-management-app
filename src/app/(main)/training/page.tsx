
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chatbot } from "@/components/training/chatbot"
import { useLanguage } from "@/hooks/use-language";

export default function TrainingPage() {
  const { t } = useLanguage();
  return (
    <div className="h-full flex flex-col">
       <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>{t('training_assistant_title')}</CardTitle>
          <CardDescription>{t('training_assistant_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
            <Chatbot />
        </CardContent>
       </Card>
    </div>
  )
}

    
