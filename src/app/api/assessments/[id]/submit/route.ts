import { NextResponse } from 'next/server';
import { getAssessmentById, getQuestions, getOngoingTest, finishOngoingTest } from '@/lib/storage';
import { ONGOING_TEST_STATUS } from '@/types';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const assessmentId = Number((await params).id);
  const { ongoingTestId, answers } = await req.json();

  if (!ongoingTestId) return NextResponse.json({ error: 'ongoingTestId wajib' }, { status: 400 });
  if (!Array.isArray(answers)) return NextResponse.json({ error: 'answers wajib berupa array' }, { status: 400 });

  const ongoingTest = await getOngoingTest(ongoingTestId);
  if (!ongoingTest || ongoingTest.assessmentId !== assessmentId) {
    return NextResponse.json({ error: 'Sesi tes tidak ditemukan' }, { status: 404 });
  }
  if (ongoingTest.status !== ONGOING_TEST_STATUS.IN_PROGRESS) {
    return NextResponse.json({ error: 'Sesi tes ini sudah selesai' }, { status: 400 });
  }

  const assessment = await getAssessmentById(assessmentId);
  if (!assessment) return NextResponse.json({ error: 'Assessment tidak ditemukan' }, { status: 404 });

  const questions = await getQuestions(assessmentId);
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  let earnedPoints = 0;
  let correctCount = 0;
  const review = questions.map(q => {
    const answer = answers.find((a: { questionId: number; answer: string }) => a.questionId === q.id);
    const correct = answer?.answer === q.correctAnswer;
    if (correct) { earnedPoints += q.points; correctCount++; }
    return { questionId: q.id, questionText: q.questionText, picked: answer?.answer ?? null, correctAnswer: q.correctAnswer, correct };
  });

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = score >= assessment.threshold;
  const status = passed ? ONGOING_TEST_STATUS.PASSED : ONGOING_TEST_STATUS.FAILED;

  await finishOngoingTest(ongoingTestId, status);

  return NextResponse.json({
    score,
    threshold: assessment.threshold,
    passed,
    correctCount,
    totalQuestions: questions.length,
    review,
  });
}
