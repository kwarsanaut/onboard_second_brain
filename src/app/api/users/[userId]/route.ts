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
  const { itemId, completed, notes, verified } = await req.json();
  const now = new Date().toISOString();
  const updated = {
    ...user,
    items: user.items.map(item => item.id !== itemId ? item : {
      ...item,
      ...(completed !== undefined && { completed, completedAt: completed ? now : undefined }),
      ...(notes !== undefined && { notes }),
      ...(verified !== undefined && { verified, verifiedAt: verified ? now : undefined }),
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
