import { errorResponse, json, options } from '@/server/http';
import { completeText } from '@/server/openai';

export const runtime = 'nodejs';

export function OPTIONS() {
  return options();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const system = `Ти досвідчений Full Stack developer і викладач курсу. Поясни тему студенту чітко і по суті.

Формат відповіді (Markdown):
1. **Коротке пояснення** — що це таке і навіщо (2-3 речення)
2. **Ключові концепції** — найважливіші поняття які треба знати
3. **Приклад коду** — короткий практичний приклад (якщо є що показати)
4. **Що вчити** — конкретні кроки для самостійного опрацювання

Відповідай українською. Будь конкретним, уникай води.`;
    const explanation = await completeText(system, [{ role: 'user', content: `Модуль: ${body.moduleTitle}\nТема: ${body.topic}` }], 1400);
    return json(200, { explanation });
  } catch (error) {
    return errorResponse(error);
  }
}
