

import { MapPin } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { useLanguage } from "@/hooks/use-language";

export function HotspotsMap() {
  const { t } = useLanguage();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const isApiKeySet = apiKey && apiKey !== "YOUR_GOOGLE_MAPS_API_KEY_HERE";

  // Example coordinates for Pune, India
  const lat = 18.5204;
  const lng = 73.8567;
  
  const mapSrc = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lng}&zoom=12`;

  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          {t('waste_hotspot_areas')}
        </CardTitle>
        <CardDescription>{t('waste_hotspot_areas_desc')}</CardDescription>
      </CardHeader>
      <CardContent className="relative aspect-video">
        {isApiKeySet ? (
           <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={mapSrc}>
          </iframe>
        ) : (
          <Image src="https://picsum.photos/seed/hotspot-map/1200/600" alt="Map of waste hotspots" fill className="object-cover rounded-md" data-ai-hint="city map" />
        )}
      </CardContent>
    </Card>
  )
}

    
