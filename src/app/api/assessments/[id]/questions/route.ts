import { NextResponse } from 'next/server';
import { getQuestions, createQuestion, getAssessmentById } from '@/lib/storage';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const assessmentId = Number((await params).id);
  return NextResponse.json(await getQuestions(assessmentId));
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const assessmentId = Number((await params).id);
  const body = await req.json();
  const { questionText, options, correctAnswer, points } = body;

  if (!questionText?.trim()) return NextResponse.json({ error: 'Pertanyaan wajib diisi' }, { status: 400 });
  if (!Array.isArray(options) || options.length < 2) return NextResponse.json({ error: 'Minimal 2 opsi jawaban' }, { status: 400 });
  if (!correctAnswer || !options.includes(correctAnswer)) return NextResponse.json({ error: 'Jawaban benar harus salah satu dari opsi' }, { status: 400 });

  const assessment = await getAssessmentById(assessmentId);
  if (!assessment) return NextResponse.json({ error: 'Assessment tidak ditemukan' }, { status: 404 });

  const question = await createQuestion({
    assessmentId,
    questionText: questionText.trim(),
    options,
    correctAnswer,
    points: Number.isFinite(points) && points > 0 ? points : 1,
  });
  return NextResponse.json(question, { status: 201 });
}
