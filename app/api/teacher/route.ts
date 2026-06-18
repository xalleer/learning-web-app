import { errorResponse, json, options } from '@/server/http';
import { completeText, findModule } from '@/server/openai';

export const runtime = 'nodejs';

export function OPTIONS() {
  return options();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
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
    return json(200, { message: await completeText(system, messages, 1200) });
  } catch (error) {
    return errorResponse(error);
  }
}
