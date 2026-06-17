import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Check, ChevronDown, ClipboardCheck, Code2, Loader2, Menu, Sparkles } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { getModuleBySlug, ICON_MAP } from '@/shared/course';
import { explainTopic } from '@/shared/api';
import { useAppStore } from '@/app/store';
import { AITeacher } from '@/widgets/AITeacher';
import { Button, Card, ProgressBar } from '@/shared/ui';
import { Markdown } from '@/shared/Markdown';
import { cn, percent } from '@/shared/utils';

const EMPTY_RESULTS: [] = [];

function TopicExplanation({ moduleTitle, topic }: { moduleTitle: string; topic: string }) {
  const [explanation, setExplanation] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: explainTopic,
    onSuccess(data) {
      setExplanation(data.explanation);
    },
  });

  if (explanation) {
    return (
      <div className="mt-4 rounded-lg border border-accent/20 bg-accent/5 p-4">
        <Markdown content={explanation} />
      </div>
    );
  }

  return (
    <div className="mt-4">
      {mutation.isPending ? (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
          AI генерує пояснення...
        </div>
      ) : (
        <Button
          className="bg-accent/10 text-accent hover:bg-accent/20 border-accent/30"
          onClick={() => mutation.mutate({ moduleTitle, topic })}
        >
          <Sparkles className="h-4 w-4" />
          Пояснити тему
        </Button>
      )}
      {mutation.error ? (
        <p className="mt-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
          {mutation.error.message}
        </p>
      ) : null}
    </div>
  );
}

export function ModulePage() {
  const { slug = '' } = useParams();
  const module = getModuleBySlug(slug);
  const [openTopic, setOpenTopic] = useState(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isTopicDone = useAppStore((state) => state.isTopicDone);
  const markTopicDone = useAppStore((state) => state.markTopicDone);
  const getModuleProgress = useAppStore((state) => state.getModuleProgress);
  const quizResult = useAppStore((state) => module ? state.getQuizResult(module.slug) : null);
  const practiceResults = useAppStore((state) => module ? state.progress.practiceResults[module.slug] ?? EMPTY_RESULTS : EMPTY_RESULTS);

  if (!module) return <Navigate to="/" replace />;

  const topicsDone = module.topics.filter((_, index) => isTopicDone(module.slug, index)).length;
  const topicsReady = topicsDone === module.topics.length;
  const moduleProgress = getModuleProgress(module.slug);
  const icon = ICON_MAP[module.icon];

  const sidebar = (
    <Card className="sticky top-4 h-fit p-4">
      <div className="flex items-center gap-3">
        {icon ? <img src={icon} alt="" className="h-10 w-10 rounded-md object-contain" /> : null}
        <div>
          <p className="text-xs text-text-secondary">Module {module.id}</p>
          <h1 className="text-lg font-semibold text-text-primary">{module.title}</h1>
        </div>
      </div>
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>Progress</span>
          <span>{percent(moduleProgress)}</span>
        </div>
        <ProgressBar value={moduleProgress} className="mt-2" />
      </div>
      <div className="mt-5 space-y-2">
        {module.topics.map((topic, index) => (
          <button
            key={topic}
            className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm text-text-secondary transition hover:bg-bg-elevated hover:text-text-primary"
            onClick={() => setOpenTopic(index)}
          >
            <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border text-xs', isTopicDone(module.slug, index) && 'border-emerald-500 bg-emerald-500 text-white')}>
              {isTopicDone(module.slug, index) ? <Check className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <span className="line-clamp-2">{topic}</span>
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-2">
        <Link to={`/module/${module.slug}/quiz`}>
          <Button className="w-full" disabled={!topicsReady}>
            <ClipboardCheck className="h-4 w-4" />
            Пройти тест
          </Button>
        </Link>
        <Link to={`/module/${module.slug}/practice`}>
          <Button className="w-full bg-bg-elevated hover:bg-border-hover" disabled={!quizResult}>
            <Code2 className="h-4 w-4" />
            Практика
          </Button>
        </Link>
      </div>
      <p className="mt-3 text-xs leading-5 text-text-muted">
        Тест відкриється після всіх тем. Практика відкриється після проходження тесту.
        {practiceResults.length ? ` Здано практик: ${practiceResults.length}.` : ''}
      </p>
    </Card>
  );

  return (
    <main className="grid gap-5 lg:grid-cols-[20rem_1fr_24rem]">
      <div className="lg:hidden">
        <Button className="w-full bg-bg-elevated hover:bg-border-hover" onClick={() => setMobileSidebarOpen((value) => !value)}>
          <Menu className="h-4 w-4" />
          Навігація модуля
        </Button>
        {mobileSidebarOpen ? <div className="mt-3">{sidebar}</div> : null}
      </div>
      <aside className="hidden lg:block">{sidebar}</aside>

      <section className="space-y-4">
        <div>
          <Link to="/" className="text-sm text-text-secondary hover:text-text-primary">← Dashboard</Link>
          <h2 className="mt-3 text-3xl font-semibold text-text-primary">{module.title}</h2>
          <p className="mt-2 text-sm text-text-secondary">{topicsDone} з {module.topics.length} тем відмічено як вивчені</p>
        </div>
        {module.topics.map((topic, index) => {
          const isOpen = openTopic === index;
          const done = isTopicDone(module.slug, index);
          return (
            <Card key={topic} className="overflow-hidden">
              <button className="flex w-full items-center justify-between gap-3 p-4 text-left" onClick={() => setOpenTopic(isOpen ? -1 : index)}>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-xs text-text-secondary">Тема {index + 1}</p>
                    <h3 className="text-base font-semibold text-text-primary">{topic}</h3>
                  </div>
                </div>
                <ChevronDown className={cn('h-5 w-5 text-text-secondary transition', isOpen && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {isOpen ? (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    <div className="border-t border-border p-4">
                      <TopicExplanation moduleTitle={module.title} topic={topic} />
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          className={done ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/20' : 'bg-bg-elevated hover:bg-border-hover'}
                          onClick={() => markTopicDone(module.slug, index)}
                        >
                          <Check className="h-4 w-4" />
                          {done ? 'Вивчено ✓' : 'Відмітити як вивчене'}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </Card>
          );
        })}
      </section>

      <aside className="lg:sticky lg:top-4 lg:h-fit">
        <AITeacher module={module} />
      </aside>
    </main>
  );
}
