
"use client"

import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { EducationArticle } from "@/lib/types"
import { ArrowRight, Clock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from "@/hooks/use-language"

export function EducationArticleCard({ article }: { article: EducationArticle }) {
  const { t } = useLanguage();

  return (
    <Dialog>
      <Card className="flex flex-col">
        <CardHeader className="p-0">
          <div className="relative aspect-video">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover rounded-t-lg"
              data-ai-hint={article.aiHint}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-1">
          <Badge variant="outline" className="mb-2">{t(article.category)}</Badge>
          <h3 className="text-lg font-semibold leading-tight">{article.title}</h3>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{t('min_read', { time: article.readTime })}</span>
          </div>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-auto p-0">
                {t('read_more')} <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </DialogTrigger>
        </CardFooter>
      </Card>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover"
                data-ai-hint={article.aiHint}
              />
          </div>
          <Badge variant="outline" className="w-fit">{t(article.category)}</Badge>
          <DialogTitle className="text-2xl">{article.title}</DialogTitle>
          <DialogDescription>
            {t('by_author_read_time', { author: article.author, time: article.readTime })}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
            <div className="prose max-w-none text-foreground dark:prose-invert">
                <p>{article.content}</p>
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
