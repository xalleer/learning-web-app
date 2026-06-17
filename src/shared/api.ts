import type { PracticeReview, Progress, TeacherMessage } from '@/shared/types';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...init?.headers,
    },
  });
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || 'API request failed');
  return data;
}

export async function loadProgress(userId: string) {
  return request<{ progress: Progress | null }>(`/api/progress/${encodeURIComponent(userId)}`);
}

export async function saveProgress(userId: string, progress: Progress) {
  return request<{ ok: true }>(`/api/progress/${encodeURIComponent(userId)}`, {
    method: 'POST',
    body: JSON.stringify({ progress }),
  });
}

export async function checkQuizAnswer(params: {
  moduleTitle: string;
  question: string;
  expectedKeywords: string[];
  hint: string;
  userAnswer: string;
}) {
  return request<{ score: number; isCorrect: boolean; feedback: string; fullAnswer: string }>('/api/quiz/check', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function reviewCode(params: {
  moduleTitle: string;
  practiceTitle: string;
  description: string;
  criteria: string[];
  code: string;
  language: string;
}): Promise<PracticeReview> {
  return request<PracticeReview>('/api/practice/review', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function askTeacher(params: {
  moduleSlug: string;
  moduleTitle: string;
  moduleTopics: string[];
  conversationHistory: TeacherMessage[];
  userMessage: string;
}) {
  return request<{ message: string }>('/api/teacher', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
