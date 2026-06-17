import { completeText } from '../_lib/openai.js';
import { handleError, handleOptions, readBody, sendJson } from '../_lib/http.js';

export default async function handler(req, res) {
  try {
    if (handleOptions(req, res)) return;
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

    const body = await readBody(req);
    const system = `Ти досвідчений Full Stack developer і викладач курсу. Поясни тему студенту чітко і по суті.

Формат відповіді (Markdown):
1. **Коротке пояснення** — що це таке і навіщо (2-3 речення)
2. **Ключові концепції** — найважливіші поняття які треба знати
3. **Приклад коду** — короткий практичний приклад (якщо є що показати)
4. **Що вчити** — конкретні кроки для самостійного опрацювання

Відповідай українською. Будь конкретним, уникай води.`;
    const explanation = await completeText(system, [{ role: 'user', content: `Модуль: ${body.moduleTitle}\nТема: ${body.topic}` }], 1400);

    return sendJson(res, 200, { explanation });
  } catch (error) {
    return handleError(res, error);
  }
}
