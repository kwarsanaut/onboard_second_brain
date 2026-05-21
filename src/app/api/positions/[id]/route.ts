import { NextResponse } from 'next/server';
import { getPosition, deletePosition } from '@/lib/storage';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!await getPosition(id)) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
  await deletePosition(id);
  return NextResponse.json({ success: true });
}
