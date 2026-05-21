import Groq from 'groq-sdk';
import OpenAI from 'openai';
import type { ModelId, ModelOption, ChecklistItem, AdditionalCategory, OnboardingType } from '@/types';

const GROQ_MODELS: ModelOption[] = [
  { id: 'llama-3.3-70b-versatile', name: 'LLaMA 3.3 70B', provider: 'groq', description: 'Terbaik untuk dokumen kompleks', speed: 'medium' },
  { id: 'llama-3.1-8b-instant', name: 'LLaMA 3.1 8B Instant', provider: 'groq', description: 'Tercepat, dokumen singkat', speed: 'fast' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', provider: 'groq', description: 'Konteks panjang 32K', speed: 'medium' },
  { id: 'qwen-qwq-32b', name: 'Qwen QwQ 32B', provider: 'qwen', description: 'Reasoning kuat via Groq', speed: 'slow' },
];

const QWEN_MODELS: ModelOption[] = [
  { id: 'qwen-plus', name: 'Qwen Plus', provider: 'qwen', description: 'Seimbang kecepatan & kualitas', speed: 'medium' },
  { id: 'qwen-turbo', name: 'Qwen Turbo', provider: 'qwen', description: 'Paling cepat dari Qwen', speed: 'fast' },
  { id: 'qwen-max', name: 'Qwen Max', provider: 'qwen', description: 'Terbaik Qwen', speed: 'slow' },
  { id: 'qwq-32b', name: 'QwQ 32B', provider: 'qwen', description: 'Reasoning mendalam', speed: 'slow' },
];

export type ActiveProvider = 'groq' | 'qwen';

function detectProvider(): ActiveProvider {
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.QWEN_API_KEY) return 'qwen';
  throw new Error('Set GROQ_API_KEY atau QWEN_API_KEY di .env.local');
}

export function getAvailableModels(): ModelOption[] {
  try { return detectProvider() === 'groq' ? GROQ_MODELS : QWEN_MODELS; }
  catch { return GROQ_MODELS; }
}

export function getDefaultModel(): ModelId {
  try { return detectProvider() === 'groq' ? 'llama-3.3-70b-versatile' : 'qwen-plus'; }
  catch { return 'llama-3.3-70b-versatile'; }
}

async function callLLM(model: string, prompt: string): Promise<string> {
  const provider = detectProvider();
  const params = { model, messages: [{ role: 'user' as const, content: prompt }], temperature: 0.2, max_tokens: 4096 };
  if (provider === 'groq') {
    const res = await new Groq({ apiKey: process.env.GROQ_API_KEY }).chat.completions.create(params);
    return res.choices[0]?.message?.content ?? '';
  }
  const res = await new OpenAI({ apiKey: process.env.QWEN_API_KEY, baseURL: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1' }).chat.completions.create(params);
  return res.choices[0]?.message?.content ?? '';
}

function parseItems(content: string, source: ChecklistItem['source'] = 'document'): ChecklistItem[] {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Model tidak mengembalikan JSON valid');
  const parsed = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(parsed.items)) throw new Error('Format JSON tidak sesuai');
  return parsed.items.map((item: Omit<ChecklistItem, 'id'>, i: number) => ({
    ...item,
    id: `item-${Date.now()}-${i}`,
    order: item.order ?? i + 1,
    isRequired: item.isRequired ?? true,
    source,
  }));
}

const ADDITIONAL_PROMPTS: Record<AdditionalCategory, string> = {
  'it-setup': `Buat 5-7 checklist item untuk SETUP IT & AKSES:
- Penerimaan dan setup laptop/komputer
- Pembuatan akun email perusahaan
- Setup VPN dan remote access
- Akses ke sistem dan tools internal
- Badge/kartu akses gedung
- Setup software wajib`,

  'hr-admin': `Buat 5-7 checklist item untuk ADMINISTRASI HR:
- Penandatanganan kontrak kerja
- Pendaftaran BPJS Kesehatan & Ketenagakerjaan
- Setup informasi payroll & rekening bank
- Pemahaman kebijakan cuti & izin
- Pengenalan kebijakan perusahaan (code of conduct)
- Pengisian formulir-formulir HR`,

  'team-intro': `Buat 5-7 checklist item untuk PERKENALAN TIM & STAKEHOLDER:
- Perkenalan dengan direct manager
- Perkenalan dengan anggota tim langsung
- Identifikasi key stakeholders di luar tim
- Setup dengan buddy/mentor
- Sesi 1-on-1 dengan manager minggu pertama
- Pemahaman struktur organisasi tim`,
};

const ADDITIONAL_LABELS: Record<AdditionalCategory, string> = {
  'it-setup': 'Setup IT & Akses',
  'hr-admin': 'Administrasi HR',
  'team-intro': 'Perkenalan Tim',
};

interface GenerateContext {
  positionName: string;
  departmentName: string;
  replacingPerson?: string;
  onboardingType: OnboardingType;
  model: ModelId;
}

function buildContext(ctx: GenerateContext): string {
  const who = ctx.onboardingType === 'replacement' && ctx.replacingPerson
    ? `Karyawan baru ini **menggantikan ${ctx.replacingPerson}** di posisi ${ctx.positionName}.`
    : `Ini adalah rekrutan baru (fresh hire) untuk posisi ${ctx.positionName}.`;
  return `Departemen: ${ctx.departmentName} | Posisi: ${ctx.positionName}\n${who}`;
}

export async function generateChecklist(
  documentText: string,
  ctx: GenerateContext
): Promise<ChecklistItem[]> {
  const context = buildContext(ctx);
  const prompt = `Kamu adalah asisten HR berpengalaman yang membuat onboarding checklist spesifik.

${context}

DOKUMEN KERJA${ctx.replacingPerson ? ` DARI ${ctx.replacingPerson.toUpperCase()}` : ''}:
---
${documentText.slice(0, 10000)}
---

Buat 12-18 checklist item yang SPESIFIK untuk posisi ini, mencakup:
- Tugas dan tanggung jawab utama berdasarkan dokumen
- Proses dan alur kerja yang harus dipahami
- Tools dan sistem yang digunakan
- Target 30/60/90 hari pertama

Output HANYA JSON valid:
{
  "items": [
    {
      "title": "Judul singkat dan spesifik",
      "description": "Deskripsi detail dan actionable",
      "category": "Setup / Teknis / Operasional / Komunikasi / Administrasi",
      "isRequired": true,
      "order": 1
    }
  ]
}`;
  const content = await callLLM(ctx.model, prompt);
  return parseItems(content, 'document');
}

export async function generateChecklistManual(
  notes: string,
  ctx: GenerateContext
): Promise<ChecklistItem[]> {
  const context = buildContext(ctx);
  const prompt = `Kamu adalah asisten HR berpengalaman.

${context}

Catatan tugas & tanggung jawab:
${notes}

Buat 10-15 checklist item spesifik untuk posisi ini.

Output HANYA JSON valid:
{
  "items": [{ "title": "", "description": "", "category": "", "isRequired": true, "order": 1 }]
}`;
  const content = await callLLM(ctx.model, prompt);
  return parseItems(content, 'document');
}

export async function generateAdditionalItems(
  categories: AdditionalCategory[],
  ctx: GenerateContext
): Promise<ChecklistItem[]> {
  if (categories.length === 0) return [];

  const context = buildContext(ctx);
  const categoryPrompts = categories.map(c => `## ${ADDITIONAL_LABELS[c]}\n${ADDITIONAL_PROMPTS[c]}`).join('\n\n');

  const prompt = `Kamu adalah asisten HR. Buat checklist tambahan untuk karyawan baru.

${context}

${categoryPrompts}

Output HANYA JSON valid dengan semua item dari semua kategori:
{
  "items": [
    {
      "title": "Judul item",
      "description": "Deskripsi actionable",
      "category": "Setup IT & Akses / Administrasi HR / Perkenalan Tim",
      "isRequired": true,
      "order": 1
    }
  ]
}`;
  const content = await callLLM(ctx.model, prompt);
  return parseItems(content, 'additional');
}

export async function mergeChecklistWiki(
  existingItems: ChecklistItem[],
  newDocumentText: string,
  ctx: GenerateContext
): Promise<{ items: ChecklistItem[]; added: number; updated: number; removed: number }> {
  const context = buildContext(ctx);
  const existingSummary = existingItems
    .filter(i => i.source !== 'additional')
    .map(i => `[${i.id}] ${i.title} (${i.category})`)
    .join('\n');

  const prompt = `Kamu membangun wiki onboarding secara inkremental.

${context}

WIKI YANG SUDAH ADA (${existingItems.filter(i => i.source !== 'additional').length} item spesifik posisi):
${existingSummary}

DOKUMEN BARU:
---
${newDocumentText.slice(0, 9000)}
---

Update wiki secara inkremental: pertahankan id lama untuk update, gunakan "new-N" untuk item baru.

Output HANYA JSON valid:
{
  "items": [
    {
      "id": "id lama PERSIS jika update, atau 'new-0' jika baru",
      "title": "", "description": "", "category": "", "isRequired": true, "order": 1
    }
  ]
}`;

  const content = await callLLM(ctx.model, prompt);
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Model tidak mengembalikan JSON valid');
  const parsed = JSON.parse(jsonMatch[0]);

  const existingIds = new Set(existingItems.filter(i => i.source !== 'additional').map(i => i.id));
  const returnedIds = new Set<string>();
  let added = 0, updated = 0;

  const docItems: ChecklistItem[] = parsed.items.map((item: ChecklistItem, i: number) => {
    const isNew = !item.id || item.id.startsWith('new-') || !existingIds.has(item.id);
    if (isNew) { added++; return { ...item, id: `item-${Date.now()}-wiki-${i}`, order: item.order ?? i + 1, isRequired: item.isRequired ?? true, source: 'document' as const }; }
    updated++;
    returnedIds.add(item.id);
    return { ...item, order: item.order ?? i + 1, isRequired: item.isRequired ?? true, source: 'document' as const };
  });

  const removed = [...existingIds].filter(id => !returnedIds.has(id) && !docItems.some(m => m.id === id)).length;
  const additionalItems = existingItems.filter(i => i.source === 'additional');
  const allItems = [...docItems, ...additionalItems].map((item, i) => ({ ...item, order: i + 1 }));

  return { items: allItems, added, updated, removed };
}
