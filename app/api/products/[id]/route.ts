import { NextResponse } from 'next/server';
import { updateSupabaseProduct, deleteSupabaseProduct } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const products = await updateSupabaseProduct(id, body);
    return NextResponse.json(products);
  } catch (error) {
    console.error('API Error PUT /api/products/[id]:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const products = await deleteSupabaseProduct(id);
    return NextResponse.json(products);
  } catch (error) {
    console.error('API Error DELETE /api/products/[id]:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
