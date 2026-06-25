import { NextResponse } from 'next/server';
import { getUser, getTeamMembers } from '@/lib/storage';
import Groq from 'groq-sdk';
import type { QuizQuestion } from '@/types';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export async function GET(req: Request) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId wajib' }, { status: 400 });

  const user = await getUser(userId);
  if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });

  const questions: QuizQuestion[] = [];

  // ── 1. Team Quiz (eye-crop) ──────────────────────────────────────────────────
  const members = await getTeamMembers(user.departmentId);
  const membersWithPhoto = members.filter(m => m.photoUrl);

  if (membersWithPhoto.length >= 2) {
    const allNames = members.map(m => m.name);
    for (const member of membersWithPhoto.slice(0, 5)) {
      const wrongNames = shuffle(allNames.filter(n => n !== member.name)).slice(0, 3);
      const options = shuffle([member.name, ...wrongNames]);
      questions.push({
        id: `team-${member.id}`,
        type: 'team',
        question: 'Siapa anggota tim ini?',
        options,
        correctAnswer: member.name,
        explanation: `${member.name} adalah ${member.role} di tim ${user.departmentName}.`,
        memberId: member.id,
        photoUrl: member.photoUrl,
      });
    }
  }

  // ── 2. Handover Quiz (LLM-generated) ─────────────────────────────────────────
  const checklistSummary = user.items.slice(0, 15).map(i => `- ${i.title}: ${i.description}`).join('\n');

  const prompt = `Kamu adalah pembuat soal kuis onboarding. Berdasarkan checklist onboarding berikut untuk posisi ${user.positionName} (menggantikan ${user.replacingPerson ?? 'karyawan sebelumnya'}):

${checklistSummary}

Buat TEPAT 5 pertanyaan pilihan ganda (4 opsi, 1 benar) dalam bahasa Indonesia yang menguji pemahaman karyawan baru tentang tugas dan tanggung jawab mereka.

Balas HANYA dengan JSON array, tanpa teks lain:
[
  {
    "question": "pertanyaan?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "jawaban yang benar (persis sama dengan salah satu opsi)",
    "explanation": "penjelasan singkat kenapa itu benar"
  }
]`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const raw = completion.choices[0].message.content ?? '[]';
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      for (let i = 0; i < parsed.length; i++) {
        const q = parsed[i];
        if (q.question && q.options?.length === 4 && q.correctAnswer) {
          questions.push({
            id: `handover-${i}`,
            type: 'handover',
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          });
        }
      }
    }
  } catch {
    // LLM gagal, lanjut tanpa handover questions
  }

  return NextResponse.json({ questions: shuffle(questions) });
}
