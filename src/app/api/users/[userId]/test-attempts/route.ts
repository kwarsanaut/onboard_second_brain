import { NextResponse } from 'next/server';
import { getOngoingTestsByUser } from '@/lib/storage';

export async function GET(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const attempts = await getOngoingTestsByUser(userId);
  return NextResponse.json(attempts);
}
