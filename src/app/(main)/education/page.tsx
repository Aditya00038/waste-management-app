

"use client";

import { useState, useEffect } from "react";
import { EducationArticleCard } from "@/components/education/article-card"
import { getEducationArticles } from "@/lib/data"
import type { EducationArticle } from "@/lib/types";
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/use-language";

export default function EducationPage() {
    const [articles, setArticles] = useState<EducationArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();
    
    useEffect(() => {
      async function loadArticles() {
        setLoading(true);
        const fetchedArticles = await getEducationArticles();
        setArticles(fetchedArticles);
        setLoading(false);
      }
      loadArticles();
    }, []);
    
    const categories = loading ? ["All", "Recycling", "Composting"] : ["All", ...Array.from(new Set(articles.map(a => a.category)))];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('learn')}</h1>
        <p className="text-muted-foreground">
          {t('learn_description')}
        </p>
      </div>

      <Tabs defaultValue="All" className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <TabsList className="overflow-x-auto self-start">
                {categories.map(category => (
                    <TabsTrigger key={category} value={category}>{category === 'All' ? t('all') : t(category)}</TabsTrigger>
                ))}
            </TabsList>
             <div className="relative max-w-xs w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t('search_articles')} className="pl-8" />
            </div>
        </div>
        
        {categories.map(category => (
            <TabsContent key={category} value={category}>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {loading ? (
                        Array.from({length: 4}).map((_, i) => (
                           <div key={i} className="space-y-2">
                             <Skeleton className="aspect-video w-full" />
                             <Skeleton className="h-5 w-1/4" />
                             <Skeleton className="h-6 w-3/4" />
                           </div>
                        ))
                    ) : (category === "All" ? articles : articles.filter(a => a.category === category)).map(article => (
                        <EducationArticleCard key={article.id} article={article} />
                    ))}
                </div>
            </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
