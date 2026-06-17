import { completeText, findModule } from './_lib/openai.js';
import { handleError, handleOptions, readBody, sendJson } from './_lib/http.js';

export default async function handler(req, res) {
  try {
    if (handleOptions(req, res)) return;
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

    const body = await readBody(req);
    const module = findModule(body.moduleSlug);
    const topics = module?.topics || body.moduleTopics || [];
    const system = `Ти досвідчений Full Stack developer і викладач. Допомагаєш студенту з модулем "${body.moduleTitle}".

Теми модуля:
${topics.join('\n')}

Правила:
- Відповідай українською
- Пояснюй просто, з аналогіями і прикладами коду
- Якщо питання не стосується теми модуля, м'яко поверни до теми
- Markdown форматування для коду
- 3-5 абзаців максимум`;
    const history = (body.conversationHistory || []).slice(-10);
    const messages = [...history, { role: 'user', content: body.userMessage }];

    return sendJson(res, 200, { message: await completeText(system, messages, 1200) });
  } catch (error) {
    return handleError(res, error);
  }
}
