'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import {
  Star,
  Heart,
  ShoppingBag,
  Info,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  Truck,
  RotateCcw,
  Phone,
  MessageCircle,
  Plus,
  Minus,
  Check,
  Award,
  Layers,
  Box,
  ImageOff,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/store/product-card';
import { MarkdownLite } from '@/components/shared/markdown-lite';
import { PageLoader } from '@/components/ui/page-loader';
import { useStore } from '@/components/store/store-provider';
import { useProductsStore } from '@/lib/products-store';
import { formatINR, discountPercent } from '@/lib/format';
import { SITE } from '@/lib/site';
import { cn } from '@/lib/utils';
import type { Product, ColorVariant } from '@/lib/types';

const MAX_IMAGE_RETRIES = 3;

// Product images are hotlinked from third-party manufacturer sites (not our own CDN), so on a
// flaky mobile connection a handful of them intermittently fail to load — most visibly in the
// thumbnail rail, where several requests fire at once. A plain <img> never retries a failed
// load on its own, so we do it manually with a short backoff before giving up on that image.
function RetryImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setAttempt(0);
    setFailed(false);
  }, [src]);

  if (failed) {
    return (
      <div className={cn('flex items-center justify-center bg-slate-50 dark:bg-slate-800', className)}>
        <ImageOff className="h-1/3 w-1/3 text-slate-300 dark:text-slate-600" />
      </div>
    );
  }

  return (
    <img
      key={attempt}
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => {
        if (attempt < MAX_IMAGE_RETRIES) {
          setTimeout(() => setAttempt((a) => a + 1), 600 * (attempt + 1));
        } else {
          setFailed(true);
        }
      }}
    />
  );
}

// Thumbnail rail with arrow-based paging instead of a raw scrollbar: an edge arrow
// appears only when there's more to see in that direction, and scrolls one "page" at a time.
function ThumbnailNav({
  images,
  selectedImage,
  onSelect,
  productName,
}: {
  images: string[];
  selectedImage: string;
  onSelect: (url: string) => void;
  productName: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);

  const updateArrows = () => {
    const el = containerRef.current;
    if (!el) return;
    const vertical = window.innerWidth >= 640;
    if (vertical) {
      setCanScrollBack(el.scrollTop > 4);
      setCanScrollForward(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
    } else {
      setCanScrollBack(el.scrollLeft > 4);
      setCanScrollForward(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }
  };

  useEffect(() => {
    updateArrows();
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  const scroll = (direction: -1 | 1) => {
    const el = containerRef.current;
    if (!el) return;
    const vertical = window.innerWidth >= 640;
    el.scrollBy(
      vertical ? { top: direction * 180, behavior: 'smooth' } : { left: direction * 180, behavior: 'smooth' }
    );
  };

  const arrowButtonClass =
    'flex h-14 w-8 sm:h-7 sm:w-full shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white';

  return (
    <div className="flex w-full shrink-0 flex-row items-center gap-2 sm:w-16 sm:flex-col sm:items-stretch">
      {canScrollBack && (
        <button type="button" onClick={() => scroll(-1)} aria-label="Show earlier images" className={arrowButtonClass}>
          <ChevronLeft className="h-4 w-4 sm:hidden" />
          <ChevronUp className="hidden h-4 w-4 sm:block" />
        </button>
      )}

      <div
        ref={containerRef}
        className="hide-scrollbar flex flex-1 flex-row gap-2 overflow-x-auto scroll-smooth sm:max-h-[440px] sm:flex-none sm:flex-col sm:overflow-y-auto"
      >
        {images.map((imgUrl, index) => (
          <button
            key={index}
            onClick={() => onSelect(imgUrl)}
            className={cn(
              'relative h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-xl bg-white p-1 transition-all duration-200 border-2 shrink-0',
              selectedImage === imgUrl
                ? 'border-[#1E1E1E] shadow-md dark:border-white'
                : 'border-slate-200 opacity-70 hover:opacity-100 dark:border-slate-800'
            )}
          >
            <RetryImage
              src={imgUrl}
              alt={`${productName} thumbnail ${index + 1}`}
              className="h-full w-full object-contain rounded-lg"
            />
          </button>
        ))}
      </div>

      {canScrollForward && (
        <button type="button" onClick={() => scroll(1)} aria-label="Show more images" className={arrowButtonClass}>
          <ChevronRight className="h-4 w-4 sm:hidden" />
          <ChevronDown className="hidden h-4 w-4 sm:block" />
        </button>
      )}
    </div>
  );
}

// Label/value spec table styled identically to MarkdownLite's "| table |" rendering, so the
// Specification and Warranty tabs read visually the same as the Description tab.
function SpecTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="my-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full border-collapse text-xs sm:text-sm">
        <tbody>
          {rows.map(([label, value], idx) => (
            <tr
              key={idx}
              className="odd:bg-white even:bg-slate-50/60 dark:odd:bg-transparent dark:even:bg-slate-900/40"
            >
              <td className="border-b border-slate-100 px-3 py-2 font-semibold text-slate-500 dark:border-slate-800">
                {label}
              </td>
              <td className="border-b border-slate-100 px-3 py-2 font-mono text-slate-800 dark:border-slate-800 dark:text-slate-200">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const rawSlug = params?.slug as string;
  const decodedSlug = rawSlug ? decodeURIComponent(rawSlug) : '';

  const { products } = useProductsStore();
  const [loading, setLoading] = useState(true);
  const [fetchedProduct, setFetchedProduct] = useState<Product | null>(null);

  // Find product in store by slug or ID
  const productInStore = products.find(
    (p) =>
      p.slug === decodedSlug ||
      p.id === decodedSlug ||
      p.slug.toLowerCase() === decodedSlug.toLowerCase()
  );

  // Fetch product from API if not yet loaded in store
  useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      if (productInStore) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/products');
        const list = await res.json();
        if (Array.isArray(list) && isMounted) {
          const match = list.find(
            (p: Product) =>
              p.slug === decodedSlug ||
              p.id === decodedSlug ||
              p.slug.toLowerCase() === decodedSlug.toLowerCase()
          );
          if (match) {
            setFetchedProduct(match);
          }
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [decodedSlug, productInStore]);

  const product = productInStore || fetchedProduct;

  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const wished = product ? isInWishlist(product.id) : false;

  // Options & Color Variants State
  const [selectedColorVariant, setSelectedColorVariant] = useState<ColorVariant | null>(
    product?.colorVariants && product.colorVariants.length > 0 ? product.colorVariants[0] : null
  );

  // Gallery state - reactive to selected color variant!
  const currentGallery =
    selectedColorVariant && selectedColorVariant.imageUrls && selectedColorVariant.imageUrls.length > 0
      ? selectedColorVariant.imageUrls
      : product?.gallery && product.gallery.length > 0
      ? product.gallery
      : [product?.image || ''];

  const [selectedImage, setSelectedImage] = useState<string>(currentGallery[0] || product?.image || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'logistics' | 'faqs' | 'video'>('description');

  // Update selected image when color variant changes
  useEffect(() => {
    if (product?.colorVariants && product.colorVariants.length > 0) {
      const first = product.colorVariants[0];
      setSelectedColorVariant(first);
      if (first.imageUrls && first.imageUrls.length > 0) {
        setSelectedImage(first.imageUrls[0]);
      }
    } else if (product) {
      setSelectedImage(product.image);
    }
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-20 dark:bg-slate-950">
        <PageLoader message="Loading product details..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-20 text-center dark:bg-slate-950 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Product Not Found</h2>
        <p className="mt-2 text-sm text-slate-500">The product you are looking for does not exist or may have been updated.</p>
        <Link href="/products" className="mt-6 inline-block rounded-full bg-[#1E1E1E] px-6 py-2.5 text-xs font-bold text-white hover:bg-black">
          Back to All Products
        </Link>
      </div>
    );
  }

  const discount = discountPercent(product.price, product.compareAtPrice);

  const handleSelectColorVariant = (variant: ColorVariant) => {
    setSelectedColorVariant(variant);
    if (variant.imageUrls && variant.imageUrls.length > 0) {
      setSelectedImage(variant.imageUrls[0]);
    }
    toast.info(`Selected color variant: ${variant.colorName}`);
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    toast.success(
      `${product.name} (${quantity}x) ${
        selectedColorVariant ? `[${selectedColorVariant.colorName}]` : ''
      } added to bag!`
    );
  };

  // Related products from dynamic store
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.categorySlug === product.categorySlug)
    .slice(0, 4);

  const fallbackRelated =
    relatedProducts.length > 0
      ? relatedProducts
      : products.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-white pb-20 dark:bg-slate-950">
      <div className="container-fit pt-8">
        {/* Top Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium sm:text-sm">
          <Link href="/" className="hover:text-[#C81E4E] transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <Link href="/products" className="hover:text-[#C81E4E] transition-colors">
            Shop
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <Link
            href={`/products?category=${product.categorySlug}`}
            className="hover:text-[#C81E4E] transition-colors"
          >
            {product.categoryName}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-semibold text-slate-900 line-clamp-1 dark:text-foreground">
            {product.name}
          </span>
        </nav>

        {/* Product Details Section: Image Gallery (Left) & Info Column (Right) */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Side: Thumbnail List + Main Display Image */}
          <div className="lg:col-span-7 flex flex-col-reverse gap-4 sm:flex-row">
            <ThumbnailNav
              images={currentGallery}
              selectedImage={selectedImage}
              onSelect={setSelectedImage}
              productName={product.name}
            />

            {/* Main Product Image Container */}
            <div className="relative flex-1 aspect-square sm:aspect-[4/5] sm:max-h-[520px] overflow-hidden rounded-[32px] border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm flex items-center justify-center p-6 sm:p-8">
              <RetryImage
                src={selectedImage}
                alt={product.name}
                className="h-full w-full object-contain transition-all duration-500 hover:scale-105"
              />

              {discount > 0 && (
                <Badge className="absolute left-6 top-6 border-0 bg-[#1E1E1E] px-3 py-1.5 text-xs font-bold text-white shadow-md">
                  -{discount}% OFF
                </Badge>
              )}

              {product.model && (
                <div className="absolute right-6 top-6 rounded-full bg-white/90 backdrop-blur-md px-3.5 py-1 text-xs font-mono font-bold text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white">
                  Model: {product.model}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Product Details & Controls */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Category & Badge Pills */}
              <div className="mb-3 flex items-center gap-2 flex-wrap">
                <span className="inline-block rounded-full bg-[#1E1E1E] px-4 py-1.5 text-xs font-extrabold tracking-wider uppercase text-white shadow-sm">
                  {product.badge || product.categoryName}
                </span>
                {product.model && (
                  <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-mono font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {product.model}
                  </span>
                )}
              </div>

              {/* Rating Row */}
              <div className="mb-3 flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i <= Math.round(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  ({product.rating}/5)
                </span>
                <span className="text-xs text-slate-400">
                  ({product.reviewCount} verified customer reviews)
                </span>
              </div>

              {/* Main Product Title */}
              <h1 className="font-sans text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl lg:text-3xl dark:text-foreground">
                {product.name}
              </h1>

              {/* Price Row */}
              <div className="mt-4 flex flex-wrap items-baseline gap-3">
                <span className="font-sans text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                  {formatINR(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-lg font-medium text-slate-400 line-through">
                    {formatINR(product.compareAtPrice)}
                  </span>
                )}
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    You save {formatINR(product.compareAtPrice - product.price)} ({discount}%)
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">(inclusive of all taxes)</p>

              {/* Stock Availability Notice */}
              <div
                className={cn(
                  'mt-4 flex items-center gap-2 text-xs font-semibold',
                  product.inStock ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                )}
              >
                <span className={cn('flex h-2 w-2 rounded-full', product.inStock ? 'bg-emerald-500' : 'bg-red-500')} />
                <span>{product.inStock ? 'In Stock & Ready for Free Express Dispatch' : 'Out of Stock'}</span>
              </div>
              {product.model && (
                <p className="mt-1 text-[11px] font-mono text-slate-400">Model: {product.model}</p>
              )}

              {/* COLOR / VARIANT SELECTOR */}
              {product.colorVariants && product.colorVariants.length > 0 && (
                <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                    <span>Select Color / Finish:</span>
                    <span className="text-primary font-medium">
                      {selectedColorVariant?.colorName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {product.colorVariants.map((variant, idx) => {
                      const isSelected = selectedColorVariant?.colorName === variant.colorName;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectColorVariant(variant)}
                          className={cn(
                            'flex items-center gap-2.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all border',
                            isSelected
                              ? 'border-slate-900 bg-slate-900 text-white shadow-md dark:border-white dark:bg-white dark:text-slate-900'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                          )}
                        >
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-slate-300 shadow-2xs"
                            style={{ backgroundColor: variant.colorCode || '#2C1D11' }}
                          />
                          <span>{variant.colorName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CERTIFICATIONS BADGES */}
              {product.certifications && product.certifications.length > 0 && (
                <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider dark:text-slate-300">
                    Quality & Safety Certifications:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {product.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                      >
                        <Award className="h-3 w-3" />
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper & Add To Cart Button Row */}
              <div className="mt-8 flex items-center gap-3">
                {/* Stepper capsule */}
                <div className="flex h-11 items-center justify-between rounded-full border border-slate-200 bg-white px-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Add To Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#1E1E1E] px-6 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-black active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  <ShoppingBag className="h-4 w-4 text-white" />
                  Add To Cart
                </button>

                {/* Wishlist Heart Button */}
                <button
                  onClick={() => {
                    toggleWishlist(product);
                    toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist');
                  }}
                  aria-label="Toggle Wishlist"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900"
                >
                  <Heart
                    className={cn(
                      'h-4 w-4 transition-colors',
                      wished ? 'fill-[#1E1E1E] text-[#1E1E1E]' : 'text-slate-400 hover:text-[#1E1E1E]'
                    )}
                  />
                </button>
              </div>

              {/* Highlights & Guarantees */}
              <div className="mt-8 grid grid-cols-3 gap-3 border-t border-slate-200/80 pt-6 dark:border-slate-800">
                <div className="flex flex-col items-center text-center p-2">
                  <Truck className="h-5 w-5 text-slate-900 dark:text-white" />
                  <span className="mt-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Free Express Shipping
                  </span>
                </div>
                <div className="flex flex-col items-center text-center p-2">
                  <ShieldCheck className="h-5 w-5 text-slate-900 dark:text-white" />
                  <span className="mt-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    {product.warranty || '3 Year Warranty Included'}
                  </span>
                </div>
                <div className="flex flex-col items-center text-center p-2">
                  <RotateCcw className="h-5 w-5 text-slate-900 dark:text-white" />
                  <span className="mt-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    On-Site Tech Support
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Specification & Description Box */}
        <div className="mt-16 rounded-[32px] border border-slate-100 bg-white p-6 sm:p-10 shadow-sm dark:border-slate-800 dark:bg-card">
          <div className="flex gap-4 overflow-x-auto scrollbar-none border-b border-slate-200 scroll-smooth touch-pan-x dark:border-slate-800">
            <button
              onClick={() => setActiveTab('description')}
              className={cn(
                'shrink-0 whitespace-nowrap pb-4 px-2 text-sm sm:text-base font-bold transition-all relative',
                activeTab === 'description'
                  ? 'text-[#1E1E1E] dark:text-white'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              Description
              {activeTab === 'description' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E1E1E] rounded-full dark:bg-white" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('specifications')}
              className={cn(
                'shrink-0 whitespace-nowrap pb-4 px-2 text-sm sm:text-base font-bold transition-all relative',
                activeTab === 'specifications'
                  ? 'text-[#1E1E1E] dark:text-white'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              Specification
              {activeTab === 'specifications' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E1E1E] rounded-full dark:bg-white" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('logistics')}
              className={cn(
                'shrink-0 whitespace-nowrap pb-4 px-2 text-sm sm:text-base font-bold transition-all relative',
                activeTab === 'logistics'
                  ? 'text-[#1E1E1E] dark:text-white'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              Warranty
              {activeTab === 'logistics' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E1E1E] rounded-full dark:bg-white" />
              )}
            </button>

            {product.faqs && product.faqs.length > 0 && (
              <button
                onClick={() => setActiveTab('faqs')}
                className={cn(
                  'shrink-0 whitespace-nowrap pb-4 px-2 text-sm sm:text-base font-bold transition-all relative',
                  activeTab === 'faqs'
                    ? 'text-[#1E1E1E] dark:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                FAQs
                {activeTab === 'faqs' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E1E1E] rounded-full dark:bg-white" />
                )}
              </button>
            )}

            {product.videoUrl && (
              <button
                onClick={() => setActiveTab('video')}
                className={cn(
                  'shrink-0 whitespace-nowrap pb-4 px-2 text-sm sm:text-base font-bold transition-all relative',
                  activeTab === 'video'
                    ? 'text-[#1E1E1E] dark:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                Video
                {activeTab === 'video' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E1E1E] rounded-full dark:bg-white" />
                )}
              </button>
            )}
          </div>

          <div className="pt-6">
            {/* TAB 1: DESCRIPTION — render exact HTML from PowerMax when available */}
            {activeTab === 'description' && (
              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
                {product.descriptionHtml ? (
                  <div
                    className="prose prose-slate dark:prose-invert max-w-none [&_img]:rounded-xl [&_img]:border [&_img]:border-slate-200 [&_img]:dark:border-slate-800 [&_img]:my-4 [&_img]:w-full [&_img]:object-cover"
                    dangerouslySetInnerHTML={{ __html: product.descriptionHtml.replace(/<img /g, '<img referrerpolicy="no-referrer" ') }}
                  />
                ) : product.description ? (
                  <div className="prose prose-slate dark:prose-invert max-w-none space-y-3">
                    <MarkdownLite text={product.description} />
                  </div>
                ) : (
                  <p>{product.shortDescription}</p>
                )}
              </div>
            )}

            {/* TAB 2: SPECIFICATION — render exact HTML table from PowerMax when available */}
            {activeTab === 'specifications' && (
              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
                {product.specificationHtml ? (
                  <div
                    className="prose prose-slate dark:prose-invert max-w-none [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs [&_table]:sm:text-sm [&_table]:rounded-xl [&_table]:overflow-hidden [&_table]:border [&_table]:border-slate-200 [&_table]:dark:border-slate-800 [&_th]:bg-slate-50 [&_th]:dark:bg-slate-900 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-bold [&_td]:px-3 [&_td]:py-2 [&_td]:border-b [&_td]:border-slate-100 [&_td]:dark:border-slate-800 [&_tr:nth-child(odd)]:bg-white [&_tr:nth-child(even)]:bg-slate-50/60 [&_tr:nth-child(odd)]:dark:bg-transparent [&_tr:nth-child(even)]:dark:bg-slate-900/40"
                    dangerouslySetInnerHTML={{ __html: product.specificationHtml }}
                  />
                ) : (
                  <div className="prose prose-slate dark:prose-invert max-w-none space-y-3">
                    <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">
                      Electrical & Engineering Specs
                    </h3>
                    <SpecTable
                      rows={[
                        ['Model Number', product.model || 'AM-333'],
                        ['Rated Voltage', product.ratedVoltage || '220V - 240V'],
                        ['Rated Frequency', product.ratedFrequency || '50/60Hz'],
                        ['Rated Power', product.ratedPower || '150W'],
                        ['Safety Class', product.safetyClass || 'Class I Isolation'],
                        ['Noise Level', product.noiseLevel || '≤ 60dB'],
                      ]}
                    />

                    <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">
                      Weight & Dimensions
                    </h3>
                    <SpecTable
                      rows={[
                        ['Net Weight (KG)', product.netWeight || '85 KG'],
                        ['Gross Weight (KG)', product.grossWeight || '98 KG'],
                        ['Sit-Up Dimensions (L x W x H)', product.dimensionsSitUp || '145 x 75 x 115 cm'],
                        ['Lay-Down Dimensions (L x W x H)', product.dimensionsLayDown || '180 x 75 x 85 cm'],
                        ['Package Dimensions', product.packageSize || '150 x 80 x 120 cm'],
                      ]}
                    />

                    {product.specifications && product.specifications.length > 0 && (
                      <>
                        <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">
                          Product Specifications
                        </h3>
                        <SpecTable rows={product.specifications.map((s) => [s.label, s.value])} />
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: WARRANTY — render exact HTML from PowerMax when available */}
            {activeTab === 'logistics' && (
              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
                {product.warrantyHtml ? (
                  <div
                    className="prose prose-slate dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.warrantyHtml }}
                  />
                ) : (
                  <div className="prose prose-slate dark:prose-invert max-w-none space-y-3">
                    <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      {product.warranty || '3 Years On-Site Comprehensive Warranty'}
                    </h3>
                    <p>
                      Covers manufacturing defects and on-site technical support for the warranty period from the date
                      of purchase.
                    </p>
                  </div>
                )}

                {/* Certifications */}
                {product.certifications && product.certifications.length > 0 && (
                  <div className="prose prose-slate dark:prose-invert max-w-none space-y-3 mt-6">
                    <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">
                      Quality Assurance & Certifications
                    </h3>
                    <ul className="list-disc space-y-1.5 pl-5">
                      {product.certifications.map((cert) => (
                        <li key={cert} className="text-slate-700 dark:text-slate-300">
                          {cert}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sales CTA + Trust Badges */}
                <div className="not-prose mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Still Confused? Call Sales at{' '}
                    <a
                      href={`tel:${SITE.phones[0].replace(/\s+/g, '')}`}
                      className="text-primary hover:underline"
                    >
                      {SITE.phones[0]}
                    </a>
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Call our sales team for queries and better assistance. Our sales team will guide you to buy the
                    best suitable fitness equipment.
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                      <Truck className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                      <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                        Nationwide Service Network
                      </p>
                      <p className="text-xs text-slate-500">On-site service anywhere in India</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                      <Award className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                      <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">Certified Products</p>
                      <p className="text-xs text-slate-500">CE, GS, RoHS certified products</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                      <Phone className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                      <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">Customer Support</p>
                      <p className="text-xs text-slate-500">Call us on {SITE.headOfficePhone}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                      <Box className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                      <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">Free Delivery</p>
                      <p className="text-xs text-slate-500">Free & lightning fast delivery</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: FAQs — accordion from PowerMax data */}
            {activeTab === 'faqs' && product.faqs && product.faqs.length > 0 && (
              <div className="space-y-3">
                {product.faqs.map((faq, idx) => (
                  <details
                    key={idx}
                    className="group rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm sm:text-base font-semibold text-slate-900 dark:text-white list-none [&::-webkit-details-marker]:hidden">
                      <span>{faq.question}</span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-400">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            )}

            {/* TAB 5: VIDEO — embedded YouTube or other video */}
            {activeTab === 'video' && product.videoUrl && (
              <div className="flex justify-center">
                <div className="w-full max-w-3xl aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                  <iframe
                    src={product.videoUrl}
                    title={`${product.name} Video`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Grid */}
        <div className="mt-20">
          <h2 className="mb-8 font-sans text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-foreground">
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {fallbackRelated.map((relProd) => (
              <ProductCard key={relProd.id} product={relProd} />
            ))}
          </div>
        </div>
      </div>

      {/* Floating Contact Buttons on Bottom-Right */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <a
          href={`https://wa.me/${SITE.headOfficePhone.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform duration-300 hover:scale-110 active:scale-95"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="h-6 w-6 fill-white" />
        </a>

        <a
          href={`tel:${SITE.headOfficePhone}`}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1E1E1E] text-white shadow-xl transition-transform duration-300 hover:scale-110 active:scale-95"
          aria-label="Call Customer Care"
        >
          <Phone className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
}
