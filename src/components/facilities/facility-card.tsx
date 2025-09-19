
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Facility } from "@/lib/types"
import { Recycle, Sprout, LandPlot, Biohazard, ArrowRight, Factory, Flame } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

const facilityIcons: { [key: string]: React.ReactNode } = {
  "recycling_center": <Recycle className="h-6 w-6 text-blue-500" />,
  "compost_plant": <Sprout className="h-6 w-6 text-green-500" />,
  "landfill": <LandPlot className="h-6 w-6 text-gray-500" />,
  "hazardous_waste_collection": <Biohazard className="h-6 w-6 text-red-500" />,
  "biomethanization_plant": <LandPlot className="h-6 w-6 text-purple-500" />,
  "waste_to_energy_plant": <Biohazard className="h-6 w-6 text-orange-500" />,
};

export function FacilityCard({ facility }: { facility: Facility }) {
  const { t } = useLanguage();

  const getFacilityTypeKey = (type: string) => {
    return type.toLowerCase().replace(/-/g, '_');
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">
          {facility.name}
        </CardTitle>
        {facilityIcons[facility.type]}
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{t(getFacilityTypeKey(facility.type))}</p>
        <p className="text-sm mt-2">{facility.address}</p>
        <div className="flex items-center justify-between mt-4">
            <p className="text-sm font-semibold">{facility.distance} {t('away')}</p>
            <Button variant="outline" size="sm">
                {t('directions')} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
      </CardContent>
    </Card>
  )
}
