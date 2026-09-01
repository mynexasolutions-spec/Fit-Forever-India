'use client';

import Link from 'next/link';
import { ArrowRight, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { useCategoriesStore } from '@/lib/categories-store';
import type { Category } from '@/lib/types';

export function CategoryGrid({ categories: initialCategories }: { categories?: Category[] }) {
  const { categories: dynamicCategories } = useCategoriesStore();
  const rawCategories = dynamicCategories && dynamicCategories.length > 0 ? dynamicCategories : (initialCategories || []);
  const categories = Array.isArray(rawCategories) ? rawCategories : [];

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-8 sm:py-12 dark:bg-background">
      <div className="container-fit">
        {/* Header - Matching Featured Products design */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <Reveal>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Discover Your Favorites
            </span>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Explore by Category
            </h2>
            <span className="mt-2 block h-1 w-14 rounded-full bg-gradient-to-r from-primary to-primary/20" />
            <p className="mt-3 text-xs sm:text-base max-w-lg text-muted-foreground">
              Explore premium wellness & fitness equipment by category.
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

        {/* Uniform Grid */}
        <div className="mt-6 sm:mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
          {categories.map((cat, i) => (
            <Reveal key={cat.slug || cat.id} delay={i * 0.05}>
              <Link
                href={`/products?category=${cat.slug}`}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-2.5 shadow-sm transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.2)] dark:bg-muted dark:border-border sm:p-3.5 block"
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    className="h-full w-full rounded-xl object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-xl text-slate-400">
                    <Layers className="h-10 w-10" />
                  </div>
                )}

                {/* Name badge */}
                <span className="absolute left-2 top-2 sm:left-3 sm:top-3 inline-flex items-center justify-start gap-1.5 whitespace-nowrap rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-left text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.12em] text-slate-900 shadow-[0_2px_10px_rgba(0,0,0,0.18)] backdrop-blur-md transition-transform duration-300 group-hover:scale-105 dark:bg-card/90 dark:border-border dark:text-foreground">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {cat.name}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
