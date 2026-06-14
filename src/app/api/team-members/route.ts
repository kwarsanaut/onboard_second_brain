import { NextResponse } from 'next/server';
import { getTeamMembers, saveTeamMember } from '@/lib/storage';
import { createServiceClient } from '@/lib/supabase/server';
import { generateId } from '@/lib/utils';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const departmentId = searchParams.get('departmentId');
  if (!departmentId) return NextResponse.json({ error: 'departmentId wajib' }, { status: 400 });
  return NextResponse.json(await getTeamMembers(departmentId));
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const name = formData.get('name') as string;
  const role = formData.get('role') as string;
  const departmentId = formData.get('departmentId') as string;
  const departmentName = formData.get('departmentName') as string;
  const photo = formData.get('photo') as File | null;

  if (!name || !departmentId) return NextResponse.json({ error: 'name dan departmentId wajib' }, { status: 400 });

  let photoUrl: string | undefined;

  if (photo && photo.size > 0) {
    const supabase = createServiceClient();
    const ext = photo.name.split('.').pop() ?? 'jpg';
    const path = `${departmentId}/${generateId()}.${ext}`;
    const buffer = Buffer.from(await photo.arrayBuffer());
    const { error } = await supabase.storage.from('team-photos').upload(path, buffer, { contentType: photo.type, upsert: true });
    if (error) {
      return NextResponse.json({ error: `Gagal upload foto: ${error.message}` }, { status: 500 });
    }
    const { data } = supabase.storage.from('team-photos').getPublicUrl(path);
    photoUrl = data.publicUrl;
  }

  const member = {
    id: generateId(),
    departmentId,
    departmentName,
    name: name.trim(),
    role: (role ?? '').trim(),
    photoUrl,
    createdAt: new Date().toISOString(),
  };

  await saveTeamMember(member);
  return NextResponse.json(member, { status: 201 });
}
