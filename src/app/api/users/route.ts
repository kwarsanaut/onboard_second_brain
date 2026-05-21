import { NextResponse } from 'next/server';
import { getUsers, saveUser, getChecklist, getPosition } from '@/lib/storage';
import { generateId } from '@/lib/utils';

export async function GET() {
  return NextResponse.json(await getUsers());
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, positionId, startDate } = body;
  if (!name?.trim() || !positionId) return NextResponse.json({ error: 'Nama dan posisi wajib diisi' }, { status: 400 });

  const position = await getPosition(positionId);
  if (!position) return NextResponse.json({ error: 'Posisi tidak ditemukan' }, { status: 404 });

  const checklist = await getChecklist(positionId);
  if (!checklist) return NextResponse.json({ error: `Belum ada checklist untuk posisi "${position.name}". Minta HR generate dulu.` }, { status: 400 });

  const user = {
    id: generateId(),
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
