
"use client";

import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";
import { ShoppingCart, Star } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";

export function ProductCard({ product }: { product: Product }) {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart(product);
    toast({
        title: t('item_added_to_cart'),
        description: t('item_added_to_cart_desc', { name: product.name }),
    });
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="p-0">
        <div className="relative aspect-square">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover rounded-t-lg"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-1">
        <h3 className="text-lg font-semibold leading-tight">{product.name}</h3>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < product.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.reviews} {t('reviews')})</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
         <p className="text-xl font-bold">Rs. {product.price.toFixed(2)}</p>
         <Button onClick={handleAddToCart}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            {t('add_to_cart')}
         </Button>
      </CardFooter>
    </Card>
  );
}
