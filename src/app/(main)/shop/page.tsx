

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getShopProducts } from "@/lib/data";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/shop/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, UploadCloud, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createProductAction } from "@/lib/actions";
import { cn } from "@/lib/utils";

function AddProductDialog({ onProductAdded }: { onProductAdded: (product: Product) => void }) {
    const { toast } = useToast();
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!preview) {
            toast({ variant: 'destructive', title: "Image Required", description: "Please upload a product image." });
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        
        try {
            const result = await createProductAction({
                name: formData.get('name') as string,
                price: parseFloat(formData.get('price') as string),
                description: formData.get('description') as string,
                photoDataUri: preview,
            });

            if (result.error || !result.data) {
                throw new Error(result.error || "Failed to create product");
            }
            
            onProductAdded(result.data);

            toast({
                title: "Product Added",
                description: `${result.data.name} has been added to the shop.`,
            });
            setOpen(false);
            setPreview(null);
            (e.target as HTMLFormElement).reset();
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: "Error",
                description: error.message || "Failed to add product.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Product
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                 <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to add a new product to the shop.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="image">Product Image</Label>
                        <div className="flex flex-col items-center justify-center w-full mt-1">
                            <label htmlFor="dropzone-file" className={cn("flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted relative")}>
                                {preview ? (
                                    <Image src={preview} alt="Image preview" fill className="object-contain rounded-lg p-2" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">{t('upload_or_drag')}</span></p>
                                        <p className="text-xs text-muted-foreground">{t('image_formats')}</p>
                                    </div>
                                )}
                                <Input id="dropzone-file" type="file" className="hidden" onChange={handleImageChange} accept="image/*" required />
                                {isSubmitting && (
                                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="name">Product Name</Label>
                        <Input id="name" name="name" placeholder="e.g., Biodegradable Bags" required />
                    </div>
                     <div>
                        <Label htmlFor="price">Price (Rs.)</Label>
                        <Input id="price" name="price" type="number" step="0.01" placeholder="e.g., 299.00" required />
                    </div>
                     <div>
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" name="description" placeholder="Short description of the product." required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Add Product
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();
    const { user } = useAuth();

    useEffect(() => {
        async function loadProducts() {
            setLoading(true);
            const data = await getShopProducts();
            setProducts(data);
            setLoading(false);
        }
        loadProducts();
    }, []);

    const handleProductAdded = (newProduct: Product) => {
        setProducts(prev => [newProduct, ...prev]);
    }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('shop_title')}</h1>
            <p className="text-muted-foreground">
                {t('shop_description')}
            </p>
        </div>
        {user?.role === 'Admin' && <AddProductDialog onProductAdded={handleProductAdded} />}
      </div>
      
       <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t('search_products')} className="pl-8 max-w-sm" />
        </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))
        ) : (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </div>
  );
}
