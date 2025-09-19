
"use client";

import { useAuth } from "@/hooks/use-auth";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { CitizenDashboard } from "@/components/dashboard/citizen-dashboard";
import { WasteWorkerDashboard } from "@/components/dashboard/waste-worker-dashboard";
import { BulkProducerDashboard } from "@/components/dashboard/dashboard/bulk-producer-dashboard";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) {
    return (
       <div className="flex flex-1 items-center justify-center">
         <div className="flex items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">{t('dashboard_loading')}</p>
        </div>
      </div>
    );
  }
  
  const renderDashboard = () => {
    switch (user.role) {
      case "Admin":
        return <AdminDashboard />;
      case "Citizen":
      case "Green Champion":
        return <CitizenDashboard />;
      case "Waste Worker":
        return <WasteWorkerDashboard />;
      case "Bulk Producer":
        return <BulkProducerDashboard />;
      default:
         return (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
              <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="text-2xl font-bold tracking-tight">
                  {t('welcome_user', { name: user.name })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('dashboard_under_construction')}
                </p>
              </div>
            </div>
        )
    }
  }

  return (
    <div className="flex flex-col gap-4 md:gap-8">
       {renderDashboard()}
    </div>
  );
}
