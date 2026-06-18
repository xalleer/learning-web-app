import OpenAI from 'openai';
import { course } from '@/shared/course';

let openai: OpenAI | undefined;

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not set.');
  if (!openai) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai;
}

export function findModule(slug: string) {
  return course.modules.find((module) => module.slug === slug || String(module.id) === String(slug));
}

export async function completeJson(prompt: string, maxTokens = 1200) {
  const response = await getOpenAI().chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.2,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content: prompt }],
  });
  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned an empty response.');
  return JSON.parse(content) as unknown;
}

export async function completeText(system: string, messages: Array<{ role: 'user' | 'assistant'; content: string }>, maxTokens = 1200) {
  const response = await getOpenAI().chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.5,
    max_tokens: maxTokens,
    messages: [{ role: 'system', content: system }, ...messages],
  });
  return response.choices[0]?.message?.content || '';
}
