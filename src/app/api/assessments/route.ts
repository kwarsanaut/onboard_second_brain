import { NextResponse } from 'next/server';
import { getAssessments, createAssessment } from '@/lib/storage';

export async function GET() {
  return NextResponse.json(await getAssessments());
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, description, duration, threshold } = body;

  if (!title?.trim()) return NextResponse.json({ error: 'Judul wajib diisi' }, { status: 400 });
  if (!Number.isFinite(duration) || duration <= 0) return NextResponse.json({ error: 'Durasi harus lebih dari 0 menit' }, { status: 400 });
  if (!Number.isFinite(threshold) || threshold < 0 || threshold > 100) return NextResponse.json({ error: 'Threshold harus antara 0-100' }, { status: 400 });

  const assessment = await createAssessment({
    title: title.trim(),
    description: (description ?? '').trim(),
    duration,
    threshold,
  });
  return NextResponse.json(assessment, { status: 201 });
}
