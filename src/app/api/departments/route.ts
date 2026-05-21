import { NextResponse } from 'next/server';
import { getDepartments, saveDepartment } from '@/lib/storage';
import { generateId } from '@/lib/utils';

export async function GET() {
  return NextResponse.json(await getDepartments());
}

export async function POST(req: Request) {
  const { name, description } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 });
  const dept = { id: generateId(), name: name.trim(), description: description?.trim() ?? '', createdAt: new Date().toISOString() };
  await saveDepartment(dept);
  return NextResponse.json(dept, { status: 201 });
}
