import { NextResponse } from 'next/server';
import { updateSupabaseHeroSlide, deleteSupabaseHeroSlide } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const slides = await updateSupabaseHeroSlide(id, body);
    return NextResponse.json(slides);
  } catch (error) {
    console.error('API Error PUT /api/hero-slides/[id]:', error);
    return NextResponse.json({ error: 'Failed to update hero slide' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const slides = await deleteSupabaseHeroSlide(id);
    return NextResponse.json(slides);
  } catch (error) {
    console.error('API Error DELETE /api/hero-slides/[id]:', error);
    return NextResponse.json({ error: 'Failed to delete hero slide' }, { status: 500 });
  }
}
