import { errorResponse, json, options } from '@/server/http';
import { completeJson } from '@/server/openai';

export const runtime = 'nodejs';

export function OPTIONS() {
  return options();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
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
    return json(200, await completeJson(prompt, 1000));
  } catch (error) {
    return errorResponse(error);
  }
}
