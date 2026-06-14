import { NextResponse } from 'next/server';
import { getAssessmentById, updateAssessment, deleteAssessment, getQuestions } from '@/lib/storage';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const assessment = await getAssessmentById(id);
  if (!assessment) return NextResponse.json({ error: 'Assessment tidak ditemukan' }, { status: 404 });

  const questions = await getQuestions(id);
  return NextResponse.json({ ...assessment, questions });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const body = await req.json();
  const { title, description, duration, threshold } = body;

  if (duration !== undefined && (!Number.isFinite(duration) || duration <= 0)) {
    return NextResponse.json({ error: 'Durasi harus lebih dari 0 menit' }, { status: 400 });
  }
  if (threshold !== undefined && (!Number.isFinite(threshold) || threshold < 0 || threshold > 100)) {
    return NextResponse.json({ error: 'Threshold harus antara 0-100' }, { status: 400 });
  }

  const assessment = await updateAssessment(id, {
    ...(title !== undefined && { title: title.trim() }),
    ...(description !== undefined && { description: description.trim() }),
    ...(duration !== undefined && { duration }),
    ...(threshold !== undefined && { threshold }),
  });
  return NextResponse.json(assessment);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  await deleteAssessment(id);
  return NextResponse.json({ success: true });
}
