'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/lib/customer-auth';
import { 
  ArrowLeft, 
  Check, 
  Clock, 
  Loader2, 
  MapPin, 
  Phone, 
  User, 
  IndianRupee, 
  XCircle,
  Truck,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Order } from '@/lib/types';

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const { user } = useCustomerAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const customerId = user?.id;
    if (!customerId || !orderId) return;

    async function loadOrder() {
      try {
        const res = await fetch(`/api/account/orders/${orderId}?customerId=${customerId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        } else {
          setOrder(null);
        }
      } catch (err) {
        console.error('Failed to load order details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [user, orderId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-40 rounded-full" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <XCircle className="mx-auto h-12 w-12 text-destructive mb-3" />
        <h3 className="font-display text-sm font-bold text-slate-800">Order Not Found</h3>
        <p className="text-xs text-slate-400 mt-1">We couldn&apos;t retrieve the details for order ID: {orderId}.</p>
        <Button asChild className="mt-4 rounded-full bg-primary font-bold text-white shadow-sm text-xs h-9">
          <Link href="/account/orders">Back to My Orders</Link>
        </Button>
      </div>
    );
  }

  const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calculate order progress steps
  const steps = [
    { label: 'Order Confirmed', key: 'Confirmed' },
    { label: 'Processing', key: 'Processing' },
    { label: 'Shipped', key: 'Shipped' },
    { label: 'Out for Delivery', key: 'OutForDelivery' },
    { label: 'Delivered', key: 'Delivered' }
  ];

  const getStepActiveIndex = (status: string) => {
    if (status === 'Cancelled') return -1;
    switch (status) {
      case 'Processing':
        return 1; // Confirmed & Processing active
      case 'Shipped':
        return 2; // Confirmed, Processing, Shipped active
      case 'Delivered':
        return 4; // All active
      default:
        return 0; // Confirmed active (Pending or other)
    }
  };

  const activeIndex = getStepActiveIndex(order.status);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="rounded-full text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 pl-2">
          <Link href="/account/orders" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <span className="text-[11px] font-bold text-slate-400 bg-slate-50 border px-3 py-1 rounded-full uppercase tracking-wider font-mono">
          Invoice Available
        </span>
      </div>

      {/* Basic Order Stats */}
      <div className="rounded-2xl border border-slate-200/50 bg-white p-5 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-base font-black text-slate-900">{order.id}</h2>
              {order.status === 'Cancelled' && (
                <span className="inline-flex items-center border rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-red-50 text-red-700 border-red-100">
                  Cancelled
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Placed on {dateStr}
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Amount</p>
            <p className="font-mono text-lg font-black text-primary mt-0.5">
              ₹{order.total.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Visual Order Progress Component */}
        {order.status !== 'Cancelled' ? (
          <div className="mt-8 border-t border-slate-100 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">Delivery Progress</h3>
            
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
              {/* Connection Line (Desktop) */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-100 hidden md:block -z-10" />
              <div 
                className="absolute top-4 left-4 h-0.5 bg-primary hidden md:block -z-10 transition-all duration-500"
                style={{ width: `${(activeIndex / 4) * 100}%` }}
              />

              {steps.map((step, idx) => {
                const isCompleted = idx <= activeIndex;
                const isCurrent = idx === activeIndex;

                return (
                  <div key={step.key} className="flex md:flex-col items-center gap-3.5 md:gap-2.5 w-full md:w-auto relative md:text-center">
                    {/* Circle icon indicator */}
                    <div 
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 font-bold text-xs ${
                        isCompleted 
                          ? 'bg-primary border-primary text-white shadow-md shadow-primary/20' 
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      {isCompleted ? (
                        idx < activeIndex ? (
                          <Check className="h-4 w-4 stroke-[3]" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        )
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>

                    {/* Step description */}
                    <div className="text-left md:text-center">
                      <p className={`text-xs font-bold tracking-tight leading-none ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <span className="inline-block text-[9px] font-black uppercase text-primary tracking-wider mt-1 md:mt-0.5 animate-pulse">
                          Current Stage
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-6 border-t border-slate-100 pt-6 flex items-center gap-3 text-red-600 bg-red-50/50 rounded-xl p-4 border border-red-100/50">
            <XCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="text-xs font-bold">This order has been cancelled.</p>
              <p className="text-[10px] text-red-500 mt-0.5">Refund details are not applicable as no payments were processed.</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Products Table (Span 2) */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200/50 bg-white p-5 md:p-6 shadow-sm space-y-4">
          <h3 className="font-display text-sm font-bold text-slate-800 border-b pb-3 mb-1.5">
            Ordered Items ({order.items?.length || 0})
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items?.map((item) => {
              const itemSubtotal = item.price * item.quantity;
              return (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="h-12 w-12 rounded-xl bg-slate-50 object-contain border p-1"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs border">
                        FF
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-sans text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                        {item.productName}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium font-mono">
                        ₹{item.price.toLocaleString('en-IN')} x {item.quantity}
                      </p>
                    </div>
                  </div>

                  <p className="font-mono text-xs font-bold text-slate-950 shrink-0">
                    ₹{itemSubtotal.toLocaleString('en-IN')}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shipping & Summary (Span 1) */}
        <div className="md:col-span-1 space-y-6">
          {/* Shipping Address */}
          <div className="rounded-2xl border border-slate-200/50 bg-white p-5 md:p-6 shadow-sm space-y-4">
            <h3 className="font-display text-sm font-bold text-slate-800 border-b pb-3 mb-1.5 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-slate-400" />
              Delivery Address
            </h3>

            <div className="space-y-2 text-xs text-slate-600 font-medium leading-relaxed">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                {order.shippingName}
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                {order.shippingPhone}
              </p>
              <div className="border-t border-slate-50 pt-2 mt-1 space-y-0.5">
                <p>{order.shippingAddressLine1}</p>
                {order.shippingAddressLine2 && <p>{order.shippingAddressLine2}</p>}
                <p>
                  {order.shippingCity}, {order.shippingState} - {order.shippingPinCode}
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="rounded-2xl border border-slate-200/50 bg-white p-5 md:p-6 shadow-sm space-y-4">
            <h3 className="font-display text-sm font-bold text-slate-800 border-b pb-3 mb-1.5 flex items-center gap-1.5">
              <IndianRupee className="h-4 w-4 text-slate-400" />
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Subtotal</span>
                <span className="font-mono">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Shipping</span>
                <span className="font-mono">
                  {order.shipping === 0 ? 'Free' : `₹${order.shipping.toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount</span>
                <span className="font-mono">- ₹{order.discount.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between font-black text-sm text-slate-900 uppercase">
                <span>Total Amount</span>
                <span className="font-mono text-primary text-base">
                  ₹{order.total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
