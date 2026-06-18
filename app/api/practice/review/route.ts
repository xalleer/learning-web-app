import { errorResponse, json, options } from '@/server/http';
import { completeJson } from '@/server/openai';

export const runtime = 'nodejs';

export function OPTIONS() {
  return options();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = `Ти senior Full Stack developer. Зроби детальний code review українською.

Модуль: ${body.moduleTitle}
Завдання: ${body.practiceTitle}
Опис: ${body.description}
Критерії:
${(body.criteria || []).map((criterion: string, index: number) => `${index + 1}. ${criterion}`).join('\n')}

Код (${body.language}):
\`\`\`${body.language}
${body.code}
\`\`\`

Поверни тільки JSON:
{
  "score": 1-10,
  "criteriaResults": { "критерій": true/false },
  "feedback": "Детальний фідбек по кожному критерію",
  "goodParts": "Що зроблено добре",
  "improvements": "Конкретні покращення з прикладами коду"
}`;
    return json(200, await completeJson(prompt, 1600));
  } catch (error) {
    return errorResponse(error);
  }
}
