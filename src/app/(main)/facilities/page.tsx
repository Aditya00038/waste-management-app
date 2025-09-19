

"use client";

import { useState, useEffect } from "react";
import { DynamicFacilityCard } from "@/components/facilities/dynamic-facility-card";
import { getFacilities } from "@/lib/data"
import type { Facility } from "@/lib/types";
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/use-language";

export default function FacilitiesPage() {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        async function loadFacilities() {
            setLoading(true);
            const data = await getFacilities();
            setFacilities(data);
            setLoading(false);
        }
        loadFacilities();
    }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('find_facilities')}</h1>
        <p className="text-muted-foreground">
          {t('find_facilities_description')}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder={t('search_by_name_or_address')} className="pl-8 max-w-sm" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
             Array.from({length: 6}).map((_, i) => (
                <Skeleton key={i} className="h-36 w-full" />
            ))
        ): (
            facilities.map((facility) => (
                <DynamicFacilityCard key={facility.id} facility={facility} />
            ))
        )}
      </div>
    </div>
  )
}
