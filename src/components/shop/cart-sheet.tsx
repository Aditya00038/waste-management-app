
"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingCart, X, Plus, Minus, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Separator } from "../ui/separator";
import { useToast } from "@/hooks/use-toast";
import { createOrderAction } from "@/lib/actions";

export function CartSheet() {
  const { cart, total, removeFromCart, updateQuantity, clearCart } = useCart();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleCheckout = () => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Not Logged In",
            description: "Please log in to proceed to checkout."
        });
        return;
    }
    
    startTransition(async () => {
        const result = await createOrderAction({ userId: user.id, items: cart, total });
        if (result.success) {
            toast({
                title: "Order Placed!",
                description: "Thank you for your purchase. Your order is being processed."
            });
            clearCart();
            setIsOpen(false);
        } else {
            toast({
                variant: "destructive",
                title: "Checkout Failed",
                description: result.error || "An unknown error occurred."
            });
        }
    })
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cart.length > 0 && (
             <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0">{cart.reduce((acc, item) => acc + item.quantity, 0)}</Badge>
          )}
          <span className="sr-only">{t('shopping_cart')}</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>{t('shopping_cart')}</SheetTitle>
        </SheetHeader>
        <Separator />
        {cart.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-lg">
                <div className="text-center text-muted-foreground">
                    <ShoppingCart className="mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-medium">{t('cart_is_empty')}</h3>
                    <p className="mt-2 text-sm">{t('cart_is_empty_desc')}</p>
                </div>
            </div>
        ) : (
            <>
            <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                <div className="flex flex-col gap-6 pr-6">
                {cart.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                            <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                            {t('quantity')}: {item.quantity}
                        </p>
                        <p className="mt-2 text-lg font-semibold">
                            Rs. {item.price.toFixed(2)}
                        </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                         <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => removeFromCart(item.id)}>
                            <X className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center">
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </ScrollArea>
             <SheetFooter className="px-6 py-4 bg-background border-t">
                <div className="w-full space-y-4">
                    <div className="flex justify-between font-semibold text-lg">
                        <p>{t('subtotal')}</p>
                        <p>Rs. {total.toFixed(2)}</p>
                    </div>
                    <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('proceed_to_checkout')}
                    </Button>
                </div>
            </SheetFooter>
            </>
        )}
      </SheetContent>
    </Sheet>
  );
}
