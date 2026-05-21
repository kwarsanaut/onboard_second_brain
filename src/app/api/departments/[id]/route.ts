import { NextResponse } from 'next/server';
import { getDepartments, saveDepartment, deleteDepartment } from '@/lib/storage';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const list = await getDepartments();
  const dept = list.find(d => d.id === id);
  if (!dept) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
  const updated = { ...dept, ...(await req.json()), id };
  await saveDepartment(updated);
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteDepartment(id);
  return NextResponse.json({ success: true });
}
