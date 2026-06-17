import { completeJson } from '../_lib/openai.js';
import { handleError, handleOptions, readBody, sendJson } from '../_lib/http.js';

export default async function handler(req, res) {
  try {
    if (handleOptions(req, res)) return;
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

    const body = await readBody(req);
    const prompt = `Ти викладач курсу Full Stack Development. Перевір відповідь студента українською.

Модуль: ${body.moduleTitle}
Питання: ${body.question}
Ключові слова правильної відповіді: ${(body.expectedKeywords || []).join(', ')}
Підказка що була доступна: ${body.hint || ''}
Відповідь студента: ${body.userAnswer}

Поверни тільки JSON:
{
  "score": 1-5,
  "isCorrect": true/false,
  "feedback": "2-3 речення",
  "fullAnswer": "Повна правильна відповідь, 3-5 речень"
}`;

    return sendJson(res, 200, await completeJson(prompt, 1000));
  } catch (error) {
    return handleError(res, error);
  }
}
