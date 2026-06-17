import http from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getProgressCollection } from '../api/_lib/mongo.js';
import { completeJson, completeText, findModule } from '../api/_lib/openai.js';
import { handleError, handleOptions, readBody, sendJson } from '../api/_lib/http.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const envPath = join(root, '.env');
if (existsSync(envPath)) {
  const env = readFileSync(envPath, 'utf8');
  for (const line of env.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

const port = Number(process.env.PORT || 8787);

const server = http.createServer(async (req, res) => {
  try {
    if (handleOptions(req, res)) return;
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname.startsWith('/api/progress/')) {
      const userId = decodeURIComponent(url.pathname.split('/').pop() || 'default');
      const collection = await getProgressCollection();
      const row = await collection.findOne({ userId }, { projection: { _id: 0, payload: 1 } });
      return sendJson(res, 200, { progress: row?.payload || null });
    }

    if (req.method === 'POST' && url.pathname.startsWith('/api/progress/')) {
      const userId = decodeURIComponent(url.pathname.split('/').pop() || 'default');
      const body = await readBody(req);
      const collection = await getProgressCollection();
      await collection.updateOne(
        { userId },
        { $set: { payload: body.progress, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        { upsert: true },
      );
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === 'POST' && url.pathname === '/api/quiz/check') {
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
    }

    if (req.method === 'POST' && url.pathname === '/api/practice/review') {
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
    }

    if (req.method === 'POST' && url.pathname === '/api/topic/explain') {
      const body = await readBody(req);
      const system = `Ти досвідчений Full Stack developer і викладач курсу. Поясни тему студенту чітко і по суті.

Формат відповіді (Markdown):
1. **Коротке пояснення** — що це таке і навіщо (2-3 речення)
2. **Ключові концепції** — найважливіші поняття які треба знати
3. **Приклад коду** — короткий практичний приклад (якщо є що показати)
4. **Що вчити** — конкретні кроки для самостійного опрацювання

Відповідай українською. Будь конкретним, уникай води.`;
      const text = await completeText(system, [{ role: 'user', content: `Модуль: ${body.moduleTitle}\nТема: ${body.topic}` }], 1400);
      return sendJson(res, 200, { explanation: text });
    }

    if (req.method === 'POST' && url.pathname === '/api/teacher') {
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
    }

    return sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    return handleError(res, error);
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`API server listening on http://127.0.0.1:${port}`);
});
