
"use client"

import { ReportForm } from "@/components/report/report-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

export default function ReportWastePage() {
    const { user } = useAuth()
    const { t } = useLanguage();
    
    if(!user || (user.role !== "Citizen" && user.role !== "Green Champion")) {
        return (
            <div className="flex flex-1 items-center justify-center rounded-lg">
                <Alert variant="destructive" className="max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{t('access_denied')}</AlertTitle>
                    <AlertDescription>
                        {t('report_waste_access_denied')}
                    </AlertDescription>
                </Alert>
            </div>
        )
    }
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
          <ReportForm />
      </div>
    </div>
  )
}

    
