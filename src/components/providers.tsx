
"use client";

import { AuthProvider } from "@/hooks/use-auth";
import { LanguageProvider } from "@/hooks/use-language";
import { CartProvider } from "@/hooks/use-cart";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { RoutePreloader } from "@/components/route-preloader";
import { InstantNavigation } from "@/components/instant-navigation";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <CartProvider>
          {/* Components to optimize page navigation speed */}
          <ServiceWorkerRegistration />
          <RoutePreloader />
          <InstantNavigation />
          {children}
        </CartProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
