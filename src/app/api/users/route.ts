import { NextResponse } from 'next/server';
import { getUsers, getUserByAuthId, saveUser, getChecklist, getPosition } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  return NextResponse.json(await getUsers());
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, positionId, startDate } = body;
  if (!name?.trim() || !positionId) return NextResponse.json({ error: 'Nama dan posisi wajib diisi' }, { status: 400 });

  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (authUser) {
    const existing = await getUserByAuthId(authUser.id);
    if (existing) return NextResponse.json(existing, { status: 200 });
  }

  const position = await getPosition(positionId);
  if (!position) return NextResponse.json({ error: 'Posisi tidak ditemukan' }, { status: 404 });

  const checklist = await getChecklist(positionId);
  if (!checklist) return NextResponse.json({ error: `Belum ada checklist untuk posisi "${position.name}". Minta Manager generate dulu.` }, { status: 400 });

  const user = {
    id: generateId(),
    authUserId: authUser?.id,
    name: name.trim(),
    positionId,
    positionName: position.name,
    departmentId: position.departmentId,
    departmentName: position.departmentName,
    replacingPerson: checklist.replacingPerson,
    onboardingType: checklist.onboardingType,
    startDate: startDate ?? new Date().toISOString().split('T')[0],
    items: checklist.items.map(item => ({ ...item, completed: false, completedAt: undefined, notes: '' })),
    createdAt: new Date().toISOString(),
  };

  await saveUser(user);
  return NextResponse.json(user, { status: 201 });
}
