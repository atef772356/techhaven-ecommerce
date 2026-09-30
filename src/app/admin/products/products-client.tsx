"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Package, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Product } from "@/lib/db";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Price must be positive"),
  image: z.string().url("Must be a valid URL"),
  category: z.string().min(1, "Category is required"),
  stock: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Stock must be 0 or more"),
  rating: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 5, "0-5"),
});

type ProductForm = z.infer<typeof productSchema>;

export function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const { addToast } = useToast();
  const supabase = createSupabaseBrowserClient();

  const {
    register, handleSubmit, reset, setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductForm>({ resolver: zodResolver(productSchema) });

  const openAdd = () => {
    setEditing(null);
    reset({
      name: "", description: "", price: "", image: "",
      category: "", stock: "", rating: "4.5",
    });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setValue("name", p.name);
    setValue("description", p.description);
    setValue("price", String(p.price));
    setValue("image", p.image);
    setValue("category", p.category);
    setValue("stock", String(p.stock));
    setValue("rating", String(p.rating));
    setDialogOpen(true);
  };

  const onSubmit = async (data: ProductForm) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        image: data.image,
        category: data.category,
        stock: Number(data.stock),
        rating: Number(data.rating),
      };
      if (editing) {
        const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
        if (error) throw error;
        setProducts((prev) => prev.map((p) => p.id === editing.id ? { ...p, ...payload } : p));
        addToast({ title: "Product updated", description: data.name });
      } else {
        const { data: newProduct, error } = await supabase
          .from("products")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setProducts((prev) => [newProduct as Product, ...prev]);
        addToast({ title: "Product added", description: data.name });
      }
      setDialogOpen(false);
    } catch {
      addToast({ title: "Error", description: "Could not save product" });
    }
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", deleteId);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      addToast({ title: "Product deleted" });
    } catch {
      addToast({ title: "Error", description: "Could not delete product" });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your store inventory.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" /> Add product
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {products.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No products yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr className="text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Category</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Stock</th>
                    <th className="px-4 py-3 font-medium hidden lg:table-cell">Rating</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="h-10 w-10 rounded object-cover bg-muted" />
                          <span className="font-medium line-clamp-1 max-w-[200px]">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">{p.category}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(Number(p.price))}</td>
                      <td className="px-4 py-3 hidden md:table-cell">{p.stock}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">{Number(p.rating).toFixed(1)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(p.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit product" : "Add new product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="p-name">Name</Label>
              <Input id="p-name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-desc">Description</Label>
              <textarea
                id="p-desc"
                {...register("description")}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="p-price">Price ($)</Label>
                <Input id="p-price" type="number" step="0.01" {...register("price")} />
                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-cat">Category</Label>
                <Input id="p-cat" {...register("category")} />
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-stock">Stock</Label>
                <Input id="p-stock" type="number" {...register("stock")} />
                {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-rating">Rating (0-5)</Label>
                <Input id="p-rating" type="number" step="0.1" {...register("rating")} />
                {errors.rating && <p className="text-xs text-destructive">{errors.rating.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-image">Image URL</Label>
              <Input id="p-image" type="url" placeholder="https://..." {...register("image")} />
              {errors.image && <p className="text-xs text-destructive">{errors.image.message}</p>}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {editing ? "Save changes" : "Add product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete product?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. The product will be permanently removed.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
