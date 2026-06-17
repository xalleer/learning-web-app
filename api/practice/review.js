import { completeJson } from '../_lib/openai.js';
import { handleError, handleOptions, readBody, sendJson } from '../_lib/http.js';

export default async function handler(req, res) {
  try {
    if (handleOptions(req, res)) return;
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

    const body = await readBody(req);
    const prompt = `Ти senior Full Stack developer. Зроби детальний code review українською.

Модуль: ${body.moduleTitle}
Завдання: ${body.practiceTitle}
Опис: ${body.description}
Критерії:
${(body.criteria || []).map((criterion, index) => `${index + 1}. ${criterion}`).join('\n')}

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

    return sendJson(res, 200, await completeJson(prompt, 1600));
  } catch (error) {
    return handleError(res, error);
  }
}
