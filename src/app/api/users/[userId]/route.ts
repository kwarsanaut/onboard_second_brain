import { NextResponse } from 'next/server';
import { getUser, saveUser, deleteUser } from '@/lib/storage';

export async function GET(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const user = await getUser(userId);
  if (!user) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const user = await getUser(userId);
  if (!user) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
  const { itemId, completed, notes } = await req.json();
  const updated = {
    ...user,
    items: user.items.map(item => item.id !== itemId ? item : {
      ...item, completed, notes: notes ?? item.notes,
      completedAt: completed ? new Date().toISOString() : undefined,
    }),
  };
  await saveUser(updated);
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  await deleteUser(userId);
  return NextResponse.json({ success: true });
}
