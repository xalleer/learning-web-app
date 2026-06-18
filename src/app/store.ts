import { create } from 'zustand';
import { modules } from '@/shared/course';
import { loadProgress as loadRemoteProgress, saveProgress as saveRemoteProgress } from '@/shared/api';
import type { ModuleStatus, PracticeResult, Progress, QuizResult, TeacherMessage } from '@/shared/types';
import { todayKey, yesterdayKey } from '@/shared/utils';

const syncKeyStorage = 'fsdev-sync-key';
let loadRequestId = 0;
let lastLocalChangeAt = 0;

function progressStorageKey(userId: string) {
  return `fsdev-progress:${userId}`;
}

function defaultProgress(): Progress {
  const now = new Date().toISOString();
  return {
    completedTopics: {},
    quizResults: {},
    practiceResults: {},
    startedAt: now,
    lastActivityAt: now,
    streakDays: 0,
    lastStreakDate: '',
  };
}

function normalizeProgress(progress: Progress | null | undefined): Progress {
  const fallback = defaultProgress();
  if (!progress || typeof progress !== 'object') return fallback;

  const completedTopics: Progress['completedTopics'] = {};
  for (const [moduleSlug, topics] of Object.entries(progress.completedTopics || {})) {
    completedTopics[moduleSlug] = Array.isArray(topics)
      ? [...new Set(topics.map((topic) => Number(topic)).filter(Number.isFinite))].sort((a, b) => a - b)
      : [];
  }

  return {
    completedTopics,
    quizResults: progress.quizResults && typeof progress.quizResults === 'object' ? progress.quizResults : {},
    practiceResults: progress.practiceResults && typeof progress.practiceResults === 'object' ? progress.practiceResults : {},
    startedAt: progress.startedAt || fallback.startedAt,
    lastActivityAt: progress.lastActivityAt || fallback.lastActivityAt,
    streakDays: Number.isFinite(progress.streakDays) ? progress.streakDays : 0,
    lastStreakDate: progress.lastStreakDate || '',
  };
}

function loadLocalProgress(userId: string): Progress | null {
  try {
    const raw = window.localStorage.getItem(progressStorageKey(userId));
    return raw ? normalizeProgress(JSON.parse(raw) as Progress) : null;
  } catch (error) {
    console.warn(error);
    return null;
  }
}

function saveLocalProgress(userId: string, progress: Progress) {
  try {
    window.localStorage.setItem(progressStorageKey(userId), JSON.stringify(progress));
  } catch (error) {
    console.warn(error);
  }
}

function touch(progress: Progress): Progress {
  const today = todayKey();
  let streakDays = progress.streakDays;
  if (progress.lastStreakDate !== today) {
    streakDays = progress.lastStreakDate === yesterdayKey() ? progress.streakDays + 1 : 1;
  }
  return {
    ...progress,
    streakDays,
    lastStreakDate: today,
    lastActivityAt: new Date().toISOString(),
  };
}

interface AppStore {
  userId: string;
  isProgressLoading: boolean;
  isProgressSaving: boolean;
  hasLoadedProgress: boolean;
  syncError: string | null;
  progress: Progress;
  teacherMessages: Record<string, TeacherMessage[]>;
  setUserId: (userId: string) => Promise<void>;
  loadProgress: () => Promise<void>;
  persistProgress: (progress: Progress) => Promise<void>;
  markTopicDone: (moduleSlug: string, topicIndex: number) => void;
  isTopicDone: (moduleSlug: string, topicIndex: number) => boolean;
  saveQuizResult: (moduleSlug: string, result: QuizResult) => void;
  getQuizResult: (moduleSlug: string) => QuizResult | null;
  savePracticeResult: (moduleSlug: string, result: PracticeResult) => void;
  getModuleStatus: (moduleId: number) => ModuleStatus;
  getModuleProgress: (moduleSlug: string) => number;
  addTeacherMessage: (moduleSlug: string, message: TeacherMessage) => void;
  clearTeacherMessages: (moduleSlug: string) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  userId: window.localStorage.getItem(syncKeyStorage) || 'default',
  isProgressLoading: true,
  isProgressSaving: false,
  hasLoadedProgress: false,
  syncError: null,
  progress: defaultProgress(),
  teacherMessages: {},

  async setUserId(userId) {
    const cleanUserId = userId.trim() || 'default';
    window.localStorage.setItem(syncKeyStorage, cleanUserId);
    set({
      userId: cleanUserId,
      progress: loadLocalProgress(cleanUserId) ?? defaultProgress(),
      isProgressLoading: true,
      hasLoadedProgress: false,
      syncError: null,
    });
    await get().loadProgress();
  },

  async loadProgress() {
    const requestId = ++loadRequestId;
    const requestedUserId = get().userId;
    const loadStartedAt = Date.now();
    const localProgress = loadLocalProgress(requestedUserId);
    set({
      progress: localProgress ?? get().progress,
      isProgressLoading: true,
      syncError: null,
    });
    try {
      const { progress } = await loadRemoteProgress(requestedUserId);
      if (requestId !== loadRequestId || requestedUserId !== get().userId) return;
      if (lastLocalChangeAt > loadStartedAt) {
        set({ isProgressLoading: false, hasLoadedProgress: true });
        return;
      }
      const nextProgress = progress ? normalizeProgress(progress) : (localProgress ?? defaultProgress());
      saveLocalProgress(requestedUserId, nextProgress);
      set({ progress: nextProgress, isProgressLoading: false, hasLoadedProgress: true, syncError: null });
    } catch (error) {
      console.warn(error);
      if (requestId === loadRequestId) {
        const message = error instanceof Error ? error.message : 'Не вдалося підтягнути прогрес';
        set({ isProgressLoading: false, hasLoadedProgress: true, syncError: message });
      }
    }
  },

  async persistProgress(progress) {
    lastLocalChangeAt = Date.now();
    const userId = get().userId;
    saveLocalProgress(userId, progress);
    set({ progress, isProgressSaving: true, syncError: null });
    try {
      await saveRemoteProgress(userId, progress);
      if (userId === get().userId) set({ isProgressSaving: false, syncError: null });
    } catch (error) {
      console.warn(error);
      if (userId === get().userId) {
        const message = error instanceof Error ? error.message : 'Не вдалося зберегти прогрес';
        set({ isProgressSaving: false, syncError: message });
      }
    }
  },

  markTopicDone(moduleSlug, topicIndex) {
    const progress = get().progress;
    const existing = progress.completedTopics[moduleSlug] || [];
    const completedTopics = existing.includes(topicIndex)
      ? existing.filter((item) => item !== topicIndex)
      : [...existing, topicIndex].sort((a, b) => a - b);
    void get().persistProgress(touch({
      ...progress,
      completedTopics: { ...progress.completedTopics, [moduleSlug]: completedTopics },
    }));
  },

  isTopicDone(moduleSlug, topicIndex) {
    return (get().progress.completedTopics[moduleSlug] || []).includes(topicIndex);
  },

  saveQuizResult(moduleSlug, result) {
    void get().persistProgress(touch({
      ...get().progress,
      quizResults: { ...get().progress.quizResults, [moduleSlug]: result },
    }));
  },

  getQuizResult(moduleSlug) {
    return get().progress.quizResults[moduleSlug] || null;
  },

  savePracticeResult(moduleSlug, result) {
    const progress = get().progress;
    const previous = progress.practiceResults[moduleSlug] || [];
    const next = [...previous.filter((item) => item.taskId !== result.taskId), result];
    void get().persistProgress(touch({
      ...progress,
      practiceResults: { ...progress.practiceResults, [moduleSlug]: next },
    }));
  },

  getModuleStatus(moduleId) {
    const module = modules[moduleId];
    if (!module) return 'locked';
    const progress = get().progress;
    const moduleProgress = get().getModuleProgress(module.slug);
    const hasQuiz = Boolean(progress.quizResults[module.slug]);
    const hasPractice = Boolean(progress.practiceResults[module.slug]?.length);
    if (hasQuiz && hasPractice && moduleProgress >= 100) return 'completed';
    if (moduleProgress > 0 || hasQuiz || hasPractice) return 'in-progress';
    if (moduleId === 0) return 'available';
    const previous = modules[moduleId - 1];
    if (!previous) return 'available';
    const previousDone = Boolean(progress.quizResults[previous.slug]) && Boolean(progress.practiceResults[previous.slug]?.length);
    return previousDone ? 'available' : 'locked';
  },

  getModuleProgress(moduleSlug) {
    const module = modules.find((item) => item.slug === moduleSlug);
    if (!module) return 0;
    const topicWeight = 60;
    const quizWeight = 20;
    const practiceWeight = 20;
    const topicsDone = get().progress.completedTopics[moduleSlug]?.length || 0;
    const topicProgress = module.topics.length ? (topicsDone / module.topics.length) * topicWeight : topicWeight;
    const quizProgress = get().progress.quizResults[moduleSlug] ? quizWeight : 0;
    const practiceProgress = get().progress.practiceResults[moduleSlug]?.length ? practiceWeight : 0;
    return Math.min(100, topicProgress + quizProgress + practiceProgress);
  },

  addTeacherMessage(moduleSlug, message) {
    set((state) => ({
      teacherMessages: {
        ...state.teacherMessages,
        [moduleSlug]: [...(state.teacherMessages[moduleSlug] || []), message],
      },
    }));
  },

  clearTeacherMessages(moduleSlug) {
    set((state) => ({
      teacherMessages: { ...state.teacherMessages, [moduleSlug]: [] },
    }));
  },
}));
