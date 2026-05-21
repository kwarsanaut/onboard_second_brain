import { NextResponse } from 'next/server';
import { getChecklist, saveChecklist } from '@/lib/storage';

export async function GET(_req: Request, { params }: { params: Promise<{ positionId: string }> }) {
  const { positionId } = await params;
  const c = await getChecklist(positionId);
  if (!c) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
  return NextResponse.json(c);
}

export async function PUT(req: Request, { params }: { params: Promise<{ positionId: string }> }) {
  const { positionId } = await params;
  const existing = await getChecklist(positionId);
  if (!existing) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
  const body = await req.json();
  const updated = { ...existing, ...body, positionId, updatedAt: new Date().toISOString() };
  await saveChecklist(updated);
  return NextResponse.json(updated);
}
