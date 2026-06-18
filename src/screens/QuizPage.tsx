'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Lightbulb, RotateCcw } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useAppStore } from '@/app/store';
import { checkQuizAnswer } from '@/shared/api';
import { getModuleBySlug } from '@/shared/course';
import type { QuizFeedback, QuizQuestion, QuizResult } from '@/shared/types';
import { average } from '@/shared/utils';
import { Button, Card, Textarea } from '@/shared/ui';

export function QuizPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || '';
  const module = getModuleBySlug(slug);
  const saveQuizResult = useAppStore((state) => state.saveQuizResult);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedbacks, setFeedbacks] = useState<QuizFeedback[]>([]);
  const [showHint, setShowHint] = useState(false);

  const currentQuestion: QuizQuestion | undefined = module?.quiz[currentIndex];
  const finished = Boolean(module && feedbacks.length === module.quiz.length);
  const result = useMemo<QuizResult | null>(() => {
    if (!module || !finished) return null;
    return {
      moduleSlug: module.slug,
      averageScore: average(feedbacks.map((item) => item.score)),
      completedAt: new Date().toISOString(),
      answers: feedbacks,
    };
  }, [feedbacks, finished, module]);

  useEffect(() => {
    if (module && result) saveQuizResult(module.slug, result);
  }, [module, result, saveQuizResult]);

  const mutation = useMutation({
    mutationFn: checkQuizAnswer,
    onSuccess(data) {
      if (!module || !currentQuestion) return;
      setFeedbacks((items) => [
        ...items,
        {
          questionId: currentQuestion.id,
          question: currentQuestion.question,
          answer,
          score: data.score,
          isCorrect: data.isCorrect,
          feedback: data.feedback,
          fullAnswer: data.fullAnswer,
        },
      ]);
    },
  });

  if (!module || !currentQuestion) {
    router.replace('/');
    return null;
  }

  function submitAnswer() {
    if (!module || !currentQuestion || !answer.trim()) return;
    mutation.mutate({
      moduleTitle: module.title,
      question: currentQuestion.question,
      expectedKeywords: currentQuestion.expectedKeywords,
      hint: currentQuestion.hint,
      userAnswer: answer.trim(),
    });
  }

  function nextQuestion() {
    if (!module) return;
    if (currentIndex + 1 >= module.quiz.length) {
      if (result) saveQuizResult(module.slug, result);
      return;
    }
    setCurrentIndex((index) => index + 1);
    setAnswer('');
    setShowHint(false);
    mutation.reset();
  }

  function retryWeak() {
    if (!module) return;
    const weak = feedbacks.filter((item) => item.score < 3);
    if (!weak.length) return;
    const firstWeakIndex = module.quiz.findIndex((question) => question.id === weak[0].questionId);
    setFeedbacks([]);
    setCurrentIndex(Math.max(0, firstWeakIndex));
    setAnswer('');
    mutation.reset();
  }

  if (finished && result) {
    const weakCount = result.answers.filter((item) => item.score < 3).length;
    return (
      <main className="mx-auto max-w-4xl space-y-5">
        <Link href={`/module/${module.slug}`} className="text-sm text-text-secondary hover:text-text-primary">← Назад до модуля</Link>
        <Card className="p-5">
          <p className="text-sm text-text-secondary">Результат тесту</p>
          <h1 className="mt-2 text-3xl font-semibold text-text-primary">{module.title}: {result.averageScore.toFixed(1)}/5</h1>
          <p className="mt-2 text-sm text-text-secondary">
            {result.averageScore < 3 ? 'Краще повторити модуль і пройти слабкі питання ще раз.' : 'Тест пройдено. Практика відкрита.'}
          </p>
          <div className="mt-5 space-y-3">
            {result.answers.map((item, index) => (
              <div key={item.questionId} className="rounded-lg border border-border bg-bg-primary p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-text-primary">{index + 1}. {item.question}</p>
                  <span className="rounded-full border border-border px-2 py-1 text-xs text-text-secondary">{item.score}/5</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-text-secondary">{item.feedback}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {weakCount ? (
              <Button className="bg-bg-elevated hover:bg-border-hover" onClick={retryWeak}>
                <RotateCcw className="h-4 w-4" />
                Повторити слабкі питання
              </Button>
            ) : null}
            <Link href={`/module/${module.slug}/practice`}>
              <Button>
                Перейти до практики
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    );
  }

  const latestFeedback = feedbacks[feedbacks.length - 1];
  const answeredCurrent = latestFeedback?.questionId === currentQuestion.id;

  return (
    <main className="mx-auto max-w-3xl space-y-5">
      <Link href={`/module/${module.slug}`} className="text-sm text-text-secondary hover:text-text-primary">← Назад до модуля</Link>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
        >
          <Card className="p-5">
            <p className="text-sm text-text-secondary">Питання {currentIndex + 1} з {module.quiz.length}</p>
            <h1 className="mt-4 text-2xl font-semibold leading-tight text-text-primary">{currentQuestion.question}</h1>
            <button className="mt-4 flex items-center gap-2 text-sm text-amber-200" onClick={() => setShowHint((value) => !value)}>
              <Lightbulb className="h-4 w-4" />
              Підказка
            </button>
            {showHint ? <p className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-100">{currentQuestion.hint}</p> : null}
            <Textarea className="mt-5" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Твоя відповідь..." disabled={answeredCurrent} />
            <div className="mt-4 flex justify-end">
              <Button onClick={submitAnswer} loading={mutation.isPending} disabled={!answer.trim() || answeredCurrent}>
                Перевірити відповідь
              </Button>
            </div>
            {mutation.error ? <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{mutation.error.message}</p> : null}
          </Card>
          {answeredCurrent ? (
            <motion.div className="mt-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-text-primary">{latestFeedback.isCorrect ? 'Добре!' : 'Потрібно підтягнути'} Оцінка: {latestFeedback.score}/5</h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-text-secondary">{latestFeedback.feedback}</p>
                <div className="mt-4 rounded-lg border border-border bg-bg-primary p-4">
                  <p className="text-sm font-semibold text-text-primary">Повна відповідь</p>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{latestFeedback.fullAnswer}</p>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={nextQuestion}>
                    {currentIndex + 1 >= module.quiz.length ? 'Завершити тест' : 'Наступне питання'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
