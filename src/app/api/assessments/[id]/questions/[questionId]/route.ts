import { NextResponse } from 'next/server';
import { updateQuestion, deleteQuestion } from '@/lib/storage';

export async function PATCH(req: Request, { params }: { params: Promise<{ questionId: string }> }) {
  const { questionId } = await params;
  const body = await req.json();
  const { questionText, options, correctAnswer, points } = body;

  if (options !== undefined && (!Array.isArray(options) || options.length < 2)) {
    return NextResponse.json({ error: 'Minimal 2 opsi jawaban' }, { status: 400 });
  }
  if (correctAnswer !== undefined && options !== undefined && !options.includes(correctAnswer)) {
    return NextResponse.json({ error: 'Jawaban benar harus salah satu dari opsi' }, { status: 400 });
  }

  const question = await updateQuestion(Number(questionId), {
    ...(questionText !== undefined && { questionText: questionText.trim() }),
    ...(options !== undefined && { options }),
    ...(correctAnswer !== undefined && { correctAnswer }),
    ...(points !== undefined && { points }),
  });
  return NextResponse.json(question);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ questionId: string }> }) {
  const { questionId } = await params;
  await deleteQuestion(Number(questionId));
  return NextResponse.json({ success: true });
}
