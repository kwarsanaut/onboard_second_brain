import { NextResponse } from 'next/server';
import { getChecklists } from '@/lib/storage';

export async function GET() {
  return NextResponse.json(await getChecklists());
}
