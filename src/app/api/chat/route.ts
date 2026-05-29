import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    const systemPrompt = `Kamu adalah asisten onboarding personal untuk ${context.userName}, yang baru bergabung sebagai ${context.positionName} di departemen ${context.departmentName}.
${context.replacingPerson ? `Dia menggantikan ${context.replacingPerson}.` : ''}

Kamu punya akses ke checklist onboarding mereka. Berikut daftar tugas yang perlu diselesaikan:

${context.items.map((item: { title: string; description: string; category: string; completed: boolean }, i: number) => `${i + 1}. [${item.completed ? 'SELESAI' : 'BELUM'}] ${item.title}${item.description ? ` — ${item.description}` : ''} (kategori: ${item.category})`).join('\n')}

Tugasmu:
- Bantu ${context.userName} memahami setiap tugas dalam checklist mereka
- Jelaskan kenapa suatu tugas penting untuk onboarding
- Berikan tips praktis untuk menyelesaikan tugas
- Jawab pertanyaan seputar jobdesk, tanggung jawab, dan ekspektasi posisi ${context.positionName}
- Bahasa: Indonesia, santai tapi profesional
- Jawab singkat dan to the point (maks 3-4 kalimat kecuali diminta detail)`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 512,
      temperature: 0.7,
    });

    return NextResponse.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
