import { NextResponse } from 'next/server';
import { getPositions, getPositionsByDept, savePosition, getDepartments } from '@/lib/storage';
import { generateId } from '@/lib/utils';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const deptId = searchParams.get('departmentId');
  const positions = deptId ? await getPositionsByDept(deptId) : await getPositions();
  return NextResponse.json(positions);
}

export async function POST(req: Request) {
  const { name, departmentId } = await req.json();
  if (!name?.trim() || !departmentId) return NextResponse.json({ error: 'name dan departmentId wajib' }, { status: 400 });
  const depts = await getDepartments();
  const dept = depts.find(d => d.id === departmentId);
  if (!dept) return NextResponse.json({ error: 'Departemen tidak ditemukan' }, { status: 404 });
  const pos = { id: generateId(), departmentId, departmentName: dept.name, name: name.trim(), createdAt: new Date().toISOString() };
  await savePosition(pos);
  return NextResponse.json(pos, { status: 201 });
}
