'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { ProductCard } from '@/components/store/product-card';
import { useProductsStore } from '@/lib/products-store';
import type { Product } from '@/lib/types';

export function FeaturedProducts({ products: initialProducts }: { products?: Product[] }) {
  const { products: dynamicProducts } = useProductsStore();

  // Combine initial server products and client dynamic store products
  const allProducts = dynamicProducts && dynamicProducts.length > 0 ? dynamicProducts : (initialProducts || []);

  // Filter ONLY products explicitly marked as featured by admin in database and in stock/active
  const featuredList = allProducts.filter((p) => Boolean(p.featured) && p.inStock !== false);
  const items = featuredList.slice(0, 8);

  if (items.length === 0) return null;

  return (
    <section className="bg-secondary/50 py-8 sm:py-12">
      <div className="container-fit">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <Reveal>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Popular Picks
            </span>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Featured Products
            </h2>
            <span className="mt-2 block h-1 w-14 rounded-full bg-gradient-to-r from-primary to-primary/20" />
            <p className="mt-3 text-xs sm:text-base max-w-lg text-muted-foreground">
              Loved by thousands of customers across India.
            </p>
          </Reveal>
          <Reveal direction="right">
            <Button
              asChild
              size="sm"
              className="group rounded-full bg-foreground text-background text-xs font-bold hover:bg-primary hover:text-white transition-colors"
            >
              <Link href="/products">
                View All
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </Reveal>
        </div>

        {/* 2 Products per row on Mobile (grid-cols-2) */}
        <div className="mt-6 sm:mt-12 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {items.map((product, i) => (
            <Reveal key={product.id} delay={i * 0.05}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
