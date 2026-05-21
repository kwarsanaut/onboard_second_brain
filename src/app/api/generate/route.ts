import { NextResponse } from 'next/server';
import { parseFile, cleanText } from '@/lib/parsers';
import { generateChecklist, generateChecklistManual, generateAdditionalItems, mergeChecklistWiki } from '@/lib/llm';
import { saveChecklist, getChecklist, getPosition } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import type { ModelId, AdditionalCategory, OnboardingType } from '@/types';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const positionId = formData.get('positionId') as string;
    const model = (formData.get('model') as ModelId) ?? 'llama-3.3-70b-versatile';
    const file = formData.get('file') as File | null;
    const manualNotes = formData.get('manualNotes') as string | null;
    const forceNew = formData.get('forceNew') === 'true';
    const replacingPerson = (formData.get('replacingPerson') as string)?.trim() || undefined;
    const onboardingType = (formData.get('onboardingType') as OnboardingType) ?? 'replacement';
    const additionalCategories: AdditionalCategory[] = JSON.parse(formData.get('additionalCategories') as string ?? '[]');

    if (!positionId) return NextResponse.json({ error: 'positionId wajib diisi' }, { status: 400 });

    const [position, existing] = await Promise.all([getPosition(positionId), getChecklist(positionId)]);
    if (!position) return NextResponse.json({ error: 'Posisi tidak ditemukan' }, { status: 404 });

    const ctx = { positionName: position.name, departmentName: position.departmentName, replacingPerson, onboardingType, model };
    const isWikiUpdate = !!existing && !forceNew;

    let docItems;
    let wikiStats: { added: number; updated: number; removed: number } | undefined;
    let generatedFrom = '';

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const text = cleanText(await parseFile(buffer, file.name));
      if (!text.trim()) return NextResponse.json({ error: 'Dokumen kosong' }, { status: 400 });
      generatedFrom = file.name;
      if (isWikiUpdate && existing) {
        const result = await mergeChecklistWiki(existing.items, text, ctx);
        docItems = result.items.filter(i => i.source !== 'additional');
        wikiStats = { added: result.added, updated: result.updated, removed: result.removed };
      } else {
        docItems = await generateChecklist(text, ctx);
      }
    } else if (manualNotes?.trim()) {
      generatedFrom = 'Manual notes';
      if (isWikiUpdate && existing) {
        const result = await mergeChecklistWiki(existing.items, manualNotes, ctx);
        docItems = result.items.filter(i => i.source !== 'additional');
        wikiStats = { added: result.added, updated: result.updated, removed: result.removed };
      } else {
        docItems = await generateChecklistManual(manualNotes, ctx);
      }
    } else {
      return NextResponse.json({ error: 'Upload file atau isi catatan manual' }, { status: 400 });
    }

    const additionalItems = await generateAdditionalItems(additionalCategories, ctx);
    const allItems = [
      ...docItems.map((item, i) => ({ ...item, order: i + 1 })),
      ...additionalItems.map((item, i) => ({ ...item, order: docItems.length + i + 1 })),
    ];

    const now = new Date().toISOString();
    const checklist = {
      id: existing?.id ?? generateId(),
      positionId,
      positionName: position.name,
      departmentId: position.departmentId,
      departmentName: position.departmentName,
      replacingPerson,
      onboardingType,
      additionalCategories,
      items: allItems,
      generatedFrom,
      model,
      wikiRevisions: (existing?.wikiRevisions ?? 0) + 1,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await saveChecklist(checklist);
    return NextResponse.json({ ...checklist, isWikiUpdate, wikiStats }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
