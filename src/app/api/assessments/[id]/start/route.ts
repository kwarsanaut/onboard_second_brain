import { NextResponse } from 'next/server';
import { getAssessmentById, getQuestions, getUser, createOngoingTest } from '@/lib/storage';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const assessmentId = Number((await params).id);
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: 'userId wajib' }, { status: 400 });

  const user = await getUser(userId);
  if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });

  const assessment = await getAssessmentById(assessmentId);
  if (!assessment) return NextResponse.json({ error: 'Assessment tidak ditemukan' }, { status: 404 });

  const questions = await getQuestions(assessmentId);
  if (questions.length === 0) return NextResponse.json({ error: 'Assessment ini belum punya soal' }, { status: 400 });

  const ongoingTest = await createOngoingTest(userId, assessmentId);

  // Jangan kirim jawaban benar ke klien — biar tidak bisa dicurangi lewat devtools.
  const safeQuestions = questions.map(q => ({
    id: q.id, assessmentId: q.assessmentId, questionText: q.questionText,
    options: q.options, points: q.points, createdAt: q.createdAt,
  }));

  return NextResponse.json({
    ongoingTestId: ongoingTest.id,
    assessment,
    questions: safeQuestions,
  }, { status: 201 });
}
