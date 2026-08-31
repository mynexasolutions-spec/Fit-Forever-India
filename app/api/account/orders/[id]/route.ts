import { NextResponse } from 'next/server';
import { getCustomerOrderById } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

const globalStore = (globalThis as any);
if (!globalStore.inMemoryOrders) {
  globalStore.inMemoryOrders = {};
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId') || request.headers.get('x-customer-id');

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    try {
      const order = await getCustomerOrderById(id, customerId);
      if (order) {
        return NextResponse.json(order);
      }
    } catch (dbError) {
      console.warn(`Supabase order query failed for ${id}, checking in-memory:`, dbError);
    }

    // In-memory fallback
    const customerOrders = globalStore.inMemoryOrders[customerId] || [];
    const order = customerOrders.find((o: any) => o.id === id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);

  } catch (error: any) {
    console.error(`API GET /api/account/orders/[id] error:`, error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
