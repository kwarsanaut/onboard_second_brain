import Groq from 'groq-sdk';
import { ModelId, ModelOption, ChecklistItem } from '@/types';

export const MODELS: ModelOption[] = [
  {
    id: 'llama-3.3-70b-versatile',
    name: 'LLaMA 3.3 70B',
    provider: 'groq',
    description: 'Terbaik untuk dokumen kompleks, konteks panjang',
    speed: 'medium',
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'LLaMA 3.1 8B Instant',
    provider: 'groq',
    description: 'Tercepat, cocok untuk dokumen singkat',
    speed: 'fast',
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    provider: 'groq',
    description: 'Konteks sangat panjang (32K token)',
    speed: 'medium',
  },
  {
    id: 'qwen-qwq-32b',
    name: 'Qwen QwQ 32B',
    provider: 'qwen',
    description: 'Reasoning mendalam dari Alibaba, via Groq',
    speed: 'slow',
  },
];

function getClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY tidak ditemukan di environment');
  return new Groq({ apiKey });
}

export async function generateChecklist(
  documentText: string,
  departmentName: string,
  model: ModelId = 'llama-3.3-70b-versatile'
): Promise<ChecklistItem[]> {
  const groq = getClient();

  const truncated = documentText.slice(0, 10000);

  const prompt = `Kamu adalah asisten HR berpengalaman yang ahli membuat onboarding checklist.

Analisis dokumen kerja berikut dari departemen **${departmentName}**, lalu buat onboarding checklist komprehensif untuk karyawan baru yang menggantikan posisi tersebut.

DOKUMEN:
---
${truncated}
---

Buat 12-20 item checklist yang mencakup:
- Setup awal (akses sistem, email, tools)
- Pemahaman proses dan alur kerja
- Kontak dan relasi penting
- Tanggung jawab utama
- Target 30/60/90 hari

Format respons HANYA JSON valid berikut, tanpa teks lain:
{
  "items": [
    {
      "title": "Judul singkat tugas",
      "description": "Deskripsi detail langkah-langkah yang harus dilakukan",
      "category": "Kategori (Setup / Administrasi / Teknis / Komunikasi / Operasional)",
      "isRequired": true,
      "order": 1
    }
  ]
}`;

  const response = await groq.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content ?? '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('LLM tidak mengembalikan JSON yang valid');

  const parsed = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(parsed.items)) throw new Error('Format JSON tidak sesuai');

  return parsed.items.map((item: Omit<ChecklistItem, 'id'>, i: number) => ({
    ...item,
    id: `item-${Date.now()}-${i}`,
    order: item.order ?? i + 1,
    isRequired: item.isRequired ?? true,
  }));
}

export async function generateChecklistManual(
  departmentName: string,
  notes: string,
  model: ModelId = 'llama-3.3-70b-versatile'
): Promise<ChecklistItem[]> {
  const groq = getClient();

  const prompt = `Kamu adalah asisten HR berpengalaman.

Buat onboarding checklist untuk karyawan baru di departemen **${departmentName}**.

Catatan tambahan dari HR/manajer:
${notes}

Buat 10-15 item checklist yang praktis dan actionable.

Format respons HANYA JSON valid:
{
  "items": [
    {
      "title": "Judul tugas",
      "description": "Deskripsi detail",
      "category": "Kategori",
      "isRequired": true,
      "order": 1
    }
  ]
}`;

  const response = await groq.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 3000,
  });

  const content = response.choices[0]?.message?.content ?? '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('LLM tidak mengembalikan JSON yang valid');

  const parsed = JSON.parse(jsonMatch[0]);
  return parsed.items.map((item: Omit<ChecklistItem, 'id'>, i: number) => ({
    ...item,
    id: `item-${Date.now()}-${i}`,
    order: item.order ?? i + 1,
    isRequired: item.isRequired ?? true,
  }));
}
