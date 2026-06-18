'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, Code2, XCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useAppStore } from '@/app/store';
import { reviewCode } from '@/shared/api';
import { getModuleBySlug } from '@/shared/course';
import type { PracticeResult, PracticeTask } from '@/shared/types';
import { Button, Card, Textarea } from '@/shared/ui';
import { Markdown } from '@/shared/Markdown';

const EMPTY_RESULTS: PracticeResult[] = [];
const EMPTY_CRITERIA: string[] = [];

function criteriaFor(task: PracticeTask) {
  return task.reviewCriteria || task.checkpoints || EMPTY_CRITERIA;
}

export function PracticePage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || '';
  const module = getModuleBySlug(slug);
  const savePracticeResult = useAppStore((state) => state.savePracticeResult);
  const existingResults = useAppStore((state) => module ? state.progress.practiceResults[module.slug] ?? EMPTY_RESULTS : EMPTY_RESULTS);
  const [taskId, setTaskId] = useState(module?.practice[0]?.id || '');
  const [code, setCode] = useState('');

  const task = useMemo(() => module?.practice.find((item) => item.id === taskId) || module?.practice[0], [module, taskId]);
  const existing = existingResults.find((item) => item.taskId === task?.id);

  const mutation = useMutation({
    mutationFn: reviewCode,
    onSuccess(review) {
      if (!module || !task) return;
      const result: PracticeResult = {
        taskId: task.id,
        title: task.title,
        code,
        language: task.codeLanguage,
        completedAt: new Date().toISOString(),
        review,
      };
      savePracticeResult(module.slug, result);
    },
  });

  if (!module || !task) {
    router.replace('/');
    return null;
  }

  const criteria = criteriaFor(task);
  const review = mutation.data || existing?.review;

  return (
    <main className="grid gap-5 lg:grid-cols-[1fr_24rem]">
      <section className="space-y-5">
        <Link href={`/module/${module.slug}`} className="text-sm text-text-secondary hover:text-text-primary">← Назад до модуля</Link>
        <div>
          <p className="text-sm text-accent">Practice</p>
          <h1 className="mt-2 text-3xl font-semibold text-text-primary">{module.title}</h1>
        </div>

        <Card className="p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-text-secondary">Завдання</p>
              <h2 className="mt-1 text-xl font-semibold text-text-primary">{task.title}</h2>
            </div>
            <select
              value={task.id}
              onChange={(event) => {
                setTaskId(event.target.value);
                setCode('');
                mutation.reset();
              }}
              className="h-10 rounded-md border border-border bg-bg-primary px-3 text-sm text-text-primary"
            >
              {module.practice.map((item) => (
                <option key={item.id} value={item.id}>{item.title}</option>
              ))}
            </select>
          </div>
          <p className="mt-4 text-sm leading-6 text-text-secondary">{task.description}</p>
          <div className="mt-5 rounded-lg border border-border bg-bg-primary p-4">
            <p className="text-sm font-semibold text-text-primary">Критерії оцінювання</p>
            <ul className="mt-3 space-y-2 text-sm text-text-secondary">
              {criteria.map((criterion) => (
                <li key={criterion} className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>{criterion}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-accent" />
              <p className="text-sm font-semibold text-text-primary">Code editor</p>
            </div>
            <span className="rounded-full border border-border px-2 py-1 font-mono text-xs text-text-secondary">{task.codeLanguage}</span>
          </div>
          <Textarea
            className="min-h-[24rem]"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder={`// ${task.codeLanguage}\n// Встав своє рішення тут...`}
          />
          <div className="mt-4 flex justify-end">
            <Button
              loading={mutation.isPending}
              disabled={!code.trim()}
              onClick={() => mutation.mutate({
                moduleTitle: module.title,
                practiceTitle: task.title,
                description: task.description,
                criteria,
                code,
                language: task.codeLanguage,
              })}
            >
              Відправити на Code Review
            </Button>
          </div>
          {mutation.error ? <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{mutation.error.message}</p> : null}
        </Card>
      </section>

      <aside className="lg:sticky lg:top-4 lg:h-fit">
        <Card className="p-5">
          <p className="text-sm text-text-secondary">AI Code Review</p>
          {review ? (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-3xl font-semibold text-text-primary">{review.score}/10</p>
                <p className="text-sm text-text-secondary">Оцінка рішення</p>
              </div>
              <div className="space-y-2">
                {Object.entries(review.criteriaResults).map(([criterion, passed]) => (
                  <div key={criterion} className="flex gap-2 rounded-lg border border-border bg-bg-primary p-3 text-sm text-text-secondary">
                    {passed ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" /> : <XCircle className="h-4 w-4 shrink-0 text-red-400" />}
                    <span>{criterion}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-text-primary">Що добре</p>
                <Markdown content={review.goodParts} />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-text-primary">Покращення</p>
                <Markdown content={review.improvements} />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-text-primary">Деталі</p>
                <Markdown content={review.feedback} />
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-border p-4 text-sm leading-6 text-text-secondary">
              Встав код, натисни review, і OpenAI поверне оцінку, критерії та конкретні поради.
            </div>
          )}
        </Card>
      </aside>
    </main>
  );
}
