import { NextResponse } from 'next/server';
import { updateSupabaseCustomer, deleteSupabaseCustomer } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const customers = await updateSupabaseCustomer(id, body);
    return NextResponse.json(customers);
  } catch (error) {
    console.error('API Error PUT /api/customers/[id]:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customers = await deleteSupabaseCustomer(id);
    return NextResponse.json(customers);
  } catch (error) {
    console.error('API Error DELETE /api/customers/[id]:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
