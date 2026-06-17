export interface CourseMeta {
  title: string;
  totalModules: number;
  estimatedMonths: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'open';
  expectedKeywords: string[];
  hint: string;
}

export interface PracticeTask {
  id: string;
  title: string;
  description: string;
  type: string;
  submitType: string;
  codeLanguage: string;
  checkpoints?: string[];
  reviewCriteria?: string[];
}

export interface CourseModule {
  id: number;
  slug: string;
  title: string;
  icon: string;
  color: string;
  topics: string[];
  quiz: QuizQuestion[];
  practice: PracticeTask[];
}

export interface CourseContent {
  meta: CourseMeta;
  modules: CourseModule[];
}

export interface QuizFeedback {
  questionId: string;
  question: string;
  answer: string;
  score: number;
  isCorrect: boolean;
  feedback: string;
  fullAnswer: string;
}

export interface QuizResult {
  moduleSlug: string;
  averageScore: number;
  completedAt: string;
  answers: QuizFeedback[];
}

export interface PracticeReview {
  score: number;
  criteriaResults: Record<string, boolean>;
  feedback: string;
  goodParts: string;
  improvements: string;
}

export interface PracticeResult {
  taskId: string;
  title: string;
  code: string;
  language: string;
  completedAt: string;
  review: PracticeReview;
}

export interface Progress {
  completedTopics: Record<string, number[]>;
  quizResults: Record<string, QuizResult>;
  practiceResults: Record<string, PracticeResult[]>;
  startedAt: string;
  lastActivityAt: string;
  streakDays: number;
  lastStreakDate: string;
}

export interface TeacherMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type ModuleStatus = 'locked' | 'available' | 'in-progress' | 'completed';
