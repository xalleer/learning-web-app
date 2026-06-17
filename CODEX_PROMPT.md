# Full Stack Developer Roadmap — Learning Platform

## Завдання

Побудуй повноцінний learning platform — Single Page Application на React + TypeScript + Vite.

Весь контент курсу (модулі, теми, питання тестів, практичні завдання) знаходиться у файлі `course-content.json` в корені проекту. **Не генеруй контент самостійно** — імпортуй з цього файлу.

---

## Стек

- **React 18** + **TypeScript**
- **Vite**
- **React Router v6** (SPA роутинг)
- **Zustand** (стан: прогрес, поточний модуль, теми)
- **TanStack Query** (API запити до Claude)
- **Tailwind CSS v3** (стилі)
- **Framer Motion** (анімації)
- **Anthropic API** (`/v1/messages`, claude-sonnet-4-6) для AI вчителя
- **window.storage API** (persistent прогрес між сесіями — деталі нижче)

---

## Структура проекту (Feature-Sliced Design)

```
src/
  app/
    App.tsx
    router.tsx
    store.ts          # Zustand store
  pages/
    DashboardPage/
    ModulePage/
    QuizPage/
    PracticePage/
  widgets/
    Sidebar/
    ModuleProgress/
    AITeacher/
  features/
    quiz/
    practice/
    progress/
  entities/
    module/
    lesson/
  shared/
    ui/               # Button, Card, Badge, Input, Textarea, Modal, Spinner
    api/              # Anthropic API client
    lib/              # utils
    types/            # global types
  assets/
    icons/            # tech icons (деталі нижче)
```

---

## Дизайн

### Загальний стиль
Не корпоративний, не AI-шаблонний. Орієнтир: **Linear.app** або **Vercel dashboard** — темна тема, мінімалістичний, технічний.

- **Темна тема за замовчуванням**
- Background: `#0A0A0F` (майже чорний з синім відтінком)
- Surface: `#111118` (картки, сайдбар)
- Border: `#1E1E2E` (тонкі межі)
- Accent: `#6366F1` (indigo-500) — primary дії
- Accent hover: `#4F46E5`
- Text primary: `#F1F5F9`
- Text secondary: `#94A3B8`
- Text muted: `#475569`
- Success: `#10B981`
- Warning: `#F59E0B`
- Error: `#EF4444`

### Шрифти (через Google Fonts)
- Display/заголовки: **Inter** (weights: 400, 500, 600, 700)
- Code блоки: **JetBrains Mono**

### Іконки технологій
Завантажити з **Devicons CDN**: `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/`

Маппінг для кожного модуля (використовується в course-content.json поле `icon`):
```typescript
const ICON_MAP: Record<string, string> = {
  // формат: "devicon-{name}-plain" або "devicon-{name}-original"
  "devicon-vscode-plain": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-plain.svg",
  "devicon-html5-plain": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-plain.svg",
  "devicon-css3-plain": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-plain.svg",
  "devicon-javascript-plain": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-plain.svg",
  "devicon-typescript-plain": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-plain.svg",
  "devicon-git-plain": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-plain.svg",
  "devicon-linux-plain": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-plain.svg",
  "devicon-react-original": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
  "devicon-vuejs-plain": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-plain.svg",
  "devicon-nuxtjs-plain": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nuxtjs/nuxtjs-plain.svg",
  "devicon-nodejs-plain": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-plain.svg",
  "devicon-express-original": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg",
  "devicon-nestjs-plain": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nestjs/nestjs-plain.svg",
  "devicon-postgresql-plain": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-plain.svg",
  "devicon-docker-plain": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-plain.svg",
  "devicon-nginx-original": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nginx/nginx-original.svg",
  "devicon-github-original": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg",
  "devicon-redis-plain": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redis/redis-plain.svg",
  "devicon-jest-plain": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jest/jest-plain.svg",
  "devicon-figma-plain": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-plain.svg",
  "devicon-threejs-original": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/threejs/threejs-original.svg",
  "devicon-fastapi-plain": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-plain.svg",
}
```

Якщо SVG не завантажується — fallback до кольорового кружечка з першою літерою назви модуля.

---

## Сторінки та компоненти

### 1. Dashboard (`/`)

**Хедер:**
- Логотип / назва "FSdev Roadmap"
- Загальний прогрес (X з 29 модулів завершено) — progress bar
- Streak (днів поспіль навчання)

**Основний контент:**
- Grid з картками модулів (4 колонки на десктопі, 2 на планшеті, 1 на мобільному)

**Картка модуля:**
```
┌─────────────────────────────────┐
│ [SVG icon]  Module 4            │
│                                 │
│ JavaScript                      │
│ ──────────────────────── 60%   │
│                                 │
│ 15 тем  •  2 практики  •  5 тестів │
│                                 │
│  [locked/in-progress/done]      │
└─────────────────────────────────┘
```

Статуси:
- `locked` — сірий, заблокований (попередній не завершений). Показуй lock іконку.
- `in-progress` — accent border, показуй % прогресу
- `available` — доступний але не розпочатий
- `completed` — зелений, checkmark

Клік на картку → `/module/:id`

---

### 2. Module Page (`/module/:id`)

**Left sidebar (sticky):**
- Назва модуля + іконка
- Список всіх тем (чекбокс чи ні — прочитано)
- Кнопка "Пройти тест" (активна якщо всі теми відмічені)
- Кнопка "Практика" (активна після тесту)
- Progress кільце (topics / quiz / practice)

**Main content area:**

**Секція Теми:**
- Accordion список тем
- Кожна тема має кнопку "Пояснити з AI" → відкриває AI чат вбудований в сторінку
- Чекбокс "Вивчено" біля кожної теми

**AI Teacher панель** (права сторона або модальне вікно):
- Chat інтерфейс
- System prompt: ти вчитель цього конкретного модуля, контекст — список тем модуля
- Можна запитувати пояснення, приклади, аналогії
- Повідомлення зберігаються в сесії (не між сесіями)

---

### 3. Quiz Page (`/module/:id/quiz`)

**Процес:**
1. Показуємо питання одне за одним
2. Кожне питання — відкрита відповідь (textarea)
3. Після відповіді → надсилаємо до AI для перевірки
4. AI повертає: оцінку (1-5), чи правильно, детальне пояснення

**UI питання:**
```
┌─────────────────────────────────────────────┐
│  Питання 3 з 5                              │
│  ─────────────────────────────────────────  │
│                                             │
│  Що таке closure і наведи практичний        │
│  приклад де він корисний?                   │
│                                             │
│  💡 Підказка (розгорнути)                  │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Твоя відповідь...                   │   │
│  │                                     │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│              [Перевірити відповідь]         │
└─────────────────────────────────────────────┘
```

**Після відповіді — AI feedback:**
```
┌─────────────────────────────────────────────┐
│  ✅ Добре! Оцінка: 4/5                      │
│  ─────────────────────────────────────────  │
│  Ти правильно описав основну ідею           │
│  closure. Але пропустив важливий нюанс:     │
│  [детальне пояснення]                       │
│                                             │
│  Повна відповідь мала б включати:           │
│  • [пункт 1]                                │
│  • [пункт 2]                                │
│                                             │
│              [Наступне питання →]           │
└─────────────────────────────────────────────┘
```

**Результат тесту:**
- Загальна оцінка
- Перелік питань з оцінками
- Кнопка "Повторити слабкі питання" (score < 3)
- Кнопка "Перейти до практики"
- Якщо середня оцінка < 3 → пропонуємо повторити модуль

---

### 4. Practice Page (`/module/:id/practice`)

**Для кожного завдання:**
- Опис завдання
- Список критеріїв оцінювання (checkpoints)
- Code editor (Monaco Editor або `<textarea>` з моноширинним шрифтом)
- Вибір мови (з поля `codeLanguage` завдання)
- Кнопка "Відправити на Code Review"

**AI Code Review:**
- Надсилаємо код + опис завдання + критерії оцінювання до Anthropic API
- System prompt: ти senior developer, роби детальний code review
- AI повертає:
  - Загальна оцінка (1-10)
  - Пройдені критерії (✅/❌)
  - Детальний фідбек по кожному критерію
  - Конкретні покращення з прикладами коду
  - Що зроблено добре

**UI code review відповіді:**
```
┌─────────────────────────────────────────────┐
│  Code Review — Dashboard Layout             │
│  Оцінка: 7/10                               │
│  ─────────────────────────────────────────  │
│  Критерії:                                  │
│  ✅ CSS Grid для основного layout           │
│  ✅ Flexbox для компонентів                 │
│  ✅ CSS variables                           │
│  ❌ Mobile sidebar                          │
│  ✅ Без магічних чисел                      │
│  ❌ БЕМ нейменування                        │
│                                             │
│  Деталі...                                  │
│                                             │
│  [Покращити і відправити знову]             │
│  [Завершити і перейти далі]                 │
└─────────────────────────────────────────────┘
```

---

## Storage (persistent прогрес)

Використовуй `window.storage` API (вже доступний в Claude artifacts):

```typescript
// Зберігати
await window.storage.set('progress', JSON.stringify(progressData));

// Читати
const result = await window.storage.get('progress');
const data = result ? JSON.parse(result.value) : defaultProgress;

// Структура прогресу
interface Progress {
  completedTopics: Record<string, string[]>;   // moduleSlug → [topicIndex]
  quizResults: Record<string, QuizResult>;     // moduleSlug → результат
  practiceResults: Record<string, PracticeResult[]>; // moduleSlug → [результати]
  startedAt: string;
  lastActivityAt: string;
  streakDays: number;
  lastStreakDate: string;
}
```

---

## Anthropic API інтеграція

```typescript
// src/shared/api/anthropic.ts

const API_URL = "https://api.anthropic.com/v1/messages";

// Перевірка відповіді на питання тесту
export async function checkQuizAnswer(params: {
  moduleTitle: string;
  question: string;
  expectedKeywords: string[];
  hint: string;
  userAnswer: string;
}): Promise<{ score: number; isCorrect: boolean; feedback: string; fullAnswer: string }> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `Ти викладач курсу Full Stack Development. Перевір відповідь студента.

Модуль: ${params.moduleTitle}
Питання: ${params.question}
Ключові слова правильної відповіді: ${params.expectedKeywords.join(', ')}
Підказка що була доступна: ${params.hint}

Відповідь студента: ${params.userAnswer}

Відповідь ТІЛЬКИ у форматі JSON (без \`\`\`json):
{
  "score": 1-5,
  "isCorrect": true/false,
  "feedback": "2-3 речення: що правильно, що пропущено або неточно",
  "fullAnswer": "Повна правильна відповідь на це питання, 3-5 речень"
}`
      }]
    })
  });
  
  const data = await response.json();
  const text = data.content[0].text;
  return JSON.parse(text);
}

// Code Review
export async function reviewCode(params: {
  moduleTitle: string;
  practiceTitle: string;
  description: string;
  criteria: string[];
  code: string;
  language: string;
}): Promise<{ score: number; criteriaResults: Record<string, boolean>; feedback: string; goodParts: string; improvements: string }> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{
        role: "user",
        content: `Ти senior Full Stack developer. Зроби детальний code review.

Модуль: ${params.moduleTitle}
Завдання: ${params.practiceTitle}
Опис: ${params.description}

Критерії оцінювання:
${params.criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Код (${params.language}):
\`\`\`${params.language}
${params.code}
\`\`\`

Відповідь ТІЛЬКИ у форматі JSON (без \`\`\`json):
{
  "score": 1-10,
  "criteriaResults": { "критерій 1": true/false, ... },
  "feedback": "Детальний фідбек по кожному критерію, конкретні зауваження",
  "goodParts": "Що зроблено добре",
  "improvements": "Конкретні покращення з прикладами коду"
}`
      }]
    })
  });
  
  const data = await response.json();
  const text = data.content[0].text;
  return JSON.parse(text);
}

// AI Teacher chat
export async function askTeacher(params: {
  moduleTitle: string;
  moduleTopics: string[];
  conversationHistory: { role: 'user' | 'assistant'; content: string }[];
  userMessage: string;
}): Promise<string> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: `Ти досвідчений Full Stack developer і викладач. Зараз допомагаєш студенту з модулем "${params.moduleTitle}".

Теми модуля:
${params.moduleTopics.join('\n')}

Правила:
- Відповідай українською
- Пояснюй просто, з аналогіями і прикладами коду
- Якщо питання не стосується теми модуля — м'яко поверни до теми
- Markdown форматування для коду (\`\`\`language)
- Не пиши занадто довго, 3-5 абзаців максимум`,
      messages: [
        ...params.conversationHistory,
        { role: "user", content: params.userMessage }
      ]
    })
  });
  
  const data = await response.json();
  return data.content[0].text;
}
```

---

## Zustand Store

```typescript
// src/app/store.ts

interface AppStore {
  // Прогрес
  progress: Progress;
  loadProgress: () => Promise<void>;
  saveProgress: () => Promise<void>;
  
  // Теми
  markTopicDone: (moduleSlug: string, topicIndex: number) => void;
  isTopicDone: (moduleSlug: string, topicIndex: number) => boolean;
  
  // Тест
  saveQuizResult: (moduleSlug: string, result: QuizResult) => void;
  getQuizResult: (moduleSlug: string) => QuizResult | null;
  
  // Практика
  savePracticeResult: (moduleSlug: string, result: PracticeResult) => void;
  
  // Стан модуля
  getModuleStatus: (moduleId: number) => 'locked' | 'available' | 'in-progress' | 'completed';
  getModuleProgress: (moduleSlug: string) => number; // 0-100
  
  // AI Teacher
  teacherMessages: Record<string, Message[]>; // moduleSlug → messages
  addTeacherMessage: (moduleSlug: string, message: Message) => void;
  clearTeacherMessages: (moduleSlug: string) => void;
}
```

---

## Анімації (Framer Motion)

- **Dashboard cards**: stagger reveal при завантаженні (0.05s між картками)
- **Module sidebar**: smooth transition при відкритті/закритті теми
- **Quiz**: slide transition між питаннями (slide left out, slide right in)
- **AI feedback**: fade + slide up при появі
- **Progress bar**: animate width при зміні
- **Page transitions**: fade між сторінками

---

## Мобільна адаптація

- **Dashboard**: 1 колонка
- **Module page**: sidebar → hamburger menu, content full width
- **Quiz**: textarea менший, але readable
- **AI chat**: full screen drawer

---

## Налаштування

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### tailwind.config.ts
```typescript
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0A0A0F',
          surface: '#111118',
          elevated: '#1A1A27',
        },
        border: {
          DEFAULT: '#1E1E2E',
          hover: '#2D2D42',
        },
        accent: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          muted: '#6366F120',
        },
        text: {
          primary: '#F1F5F9',
          secondary: '#94A3B8',
          muted: '#475569',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
}
```

### package.json dependencies
```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.26.0",
    "zustand": "^5.0.0",
    "@tanstack/react-query": "^5.56.0",
    "framer-motion": "^11.5.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.2"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## Деталі реалізації

### Блокування модулів
Модуль `n` доступний якщо модуль `n-1` завершений (quiz passed + хоча б одна практика здана). Модуль 0 — завжди доступний.

### Streak calculation
При кожній активності (markTopicDone, saveQuizResult, savePracticeResult) — перевіряти lastStreakDate. Якщо сьогодні або вчора — інкрементувати або зберегти. Якщо давніше — обнулити.

### Markdown rendering
AI відповіді можуть містити markdown з code блоками. Встанови `react-markdown` + `react-syntax-highlighter` для рендерингу. Тема для syntax highlighting: `atomOneDark` або схожа темна.

### Error handling
- API помилки → toast notification
- Storage помилки → fallback до in-memory state з попередженням
- Всі async дії → loading стани

### Loading стани
- Skeleton loader для карток модулів при завантаженні прогресу
- Spinner + disabled кнопка під час AI запиту
- Typing indicator (три крапки) в AI чаті

---

## Що НЕ робити

- Не використовувати localStorage (використовувати тільки window.storage)
- Не хардкодити контент — все з course-content.json
- Не робити `any` в TypeScript
- Не забувати обробляти помилки API
- Не робити кнопки без disabled стану під час loading
- Не ігнорувати мобільну адаптацію

---

## Фінальний результат

Запущений `npm run dev` має показувати:
1. Dashboard з усіма 29 модулями у вигляді карток з іконками
2. Клік на модуль → список тем з AI поясненнями
3. Кнопка "Пройти тест" → quiz з AI перевіркою
4. Після тесту → практика з code review
5. Прогрес зберігається між сесіями через window.storage
