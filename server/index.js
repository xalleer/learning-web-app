import http from 'node:http';
import { existsSync, readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import OpenAI from 'openai';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dataDir = join(root, 'server', 'data');
mkdirSync(dataDir, { recursive: true });

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

const db = new Database(join(dataDir, 'progress.sqlite'));
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS progress (
    user_id TEXT PRIMARY KEY,
    payload TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

const course = JSON.parse(readFileSync(join(root, 'course-content.json'), 'utf8'));
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'missing-key' });
const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const port = Number(process.env.PORT || 8787);

function json(res, status, payload) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
  });
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function requireKey() {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error('OPENAI_API_KEY is not set. Add it to your shell or .env before using AI features.');
    error.status = 500;
    throw error;
  }
}

async function completeJson(prompt, maxTokens = 1200) {
  requireKey();
  const response = await openai.chat.completions.create({
    model,
    temperature: 0.2,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content: prompt }],
  });
  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned an empty response.');
  return JSON.parse(content);
}

async function completeText(system, messages, maxTokens = 1200) {
  requireKey();
  const response = await openai.chat.completions.create({
    model,
    temperature: 0.5,
    max_tokens: maxTokens,
    messages: [{ role: 'system', content: system }, ...messages],
  });
  return response.choices[0]?.message?.content || '';
}

function findModule(slug) {
  return course.modules.find((module) => module.slug === slug || String(module.id) === String(slug));
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') return json(res, 204, {});
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname.startsWith('/api/progress/')) {
      const userId = decodeURIComponent(url.pathname.split('/').pop() || 'default');
      const row = db.prepare('SELECT payload FROM progress WHERE user_id = ?').get(userId);
      return json(res, 200, { progress: row ? JSON.parse(row.payload) : null });
    }

    if (req.method === 'POST' && url.pathname.startsWith('/api/progress/')) {
      const userId = decodeURIComponent(url.pathname.split('/').pop() || 'default');
      const body = await readBody(req);
      db.prepare('INSERT INTO progress (user_id, payload, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at')
        .run(userId, JSON.stringify(body.progress), new Date().toISOString());
      return json(res, 200, { ok: true });
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
      return json(res, 200, await completeJson(prompt, 1000));
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
      return json(res, 200, await completeJson(prompt, 1600));
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
      return json(res, 200, { explanation: text });
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
      return json(res, 200, { message: await completeText(system, messages, 1200) });
    }

    return json(res, 404, { error: 'Not found' });
  } catch (error) {
    const status = error.status || 500;
    return json(res, status, { error: error.message || 'Server error' });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`API server listening on http://127.0.0.1:${port}`);
});
