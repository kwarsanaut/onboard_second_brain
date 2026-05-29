import { NextResponse } from 'next/server';
import { deleteTeamMember } from '@/lib/storage';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteTeamMember(id);
  return NextResponse.json({ success: true });
}
