import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';

let openai;
let course;

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error('OPENAI_API_KEY is not set.');
    error.status = 500;
    throw error;
  }
  if (!openai) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai;
}

export function getCourse() {
  if (!course) {
    const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
    course = JSON.parse(readFileSync(join(root, 'course-content.json'), 'utf8'));
  }
  return course;
}

export function findModule(slug) {
  return getCourse().modules.find((module) => module.slug === slug || String(module.id) === String(slug));
}

export async function completeJson(prompt, maxTokens = 1200) {
  const response = await getOpenAI().chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.2,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content: prompt }],
  });
  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned an empty response.');
  return JSON.parse(content);
}

export async function completeText(system, messages, maxTokens = 1200) {
  const response = await getOpenAI().chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.5,
    max_tokens: maxTokens,
    messages: [{ role: 'system', content: system }, ...messages],
  });
  return response.choices[0]?.message?.content || '';
}
