import { NextResponse } from 'next/server';
import { getAvailableModels, getDefaultModel } from '@/lib/llm';

export async function GET() {
  try {
    const models = getAvailableModels();
    const defaultModel = getDefaultModel();
    return NextResponse.json({ models, defaultModel, provider: process.env.GROQ_API_KEY ? 'groq' : 'qwen' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
