import type { PracticeReview, Progress, TeacherMessage } from '@/shared/types';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...init?.headers,
    },
  });
  const data = (await response.json()) as T & { error?: string; hint?: string };
  if (!response.ok) {
    const details = [data.error || 'API request failed', data.hint].filter(Boolean).join(' ');
    throw new Error(details);
  }
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

export async function explainTopic(params: {
  moduleTitle: string;
  topic: string;
}) {
  return request<{ explanation: string }>('/api/topic/explain', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
