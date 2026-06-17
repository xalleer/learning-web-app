import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Flame, Lock, PlayCircle } from 'lucide-react';
import { modules, course, ICON_MAP } from '@/shared/course';
import { useAppStore } from '@/app/store';
import { Badge, Card, ProgressBar } from '@/shared/ui';
import { percent } from '@/shared/utils';
import type { CourseModule, ModuleStatus } from '@/shared/types';

function statusLabel(status: ModuleStatus) {
  if (status === 'locked') return 'locked';
  if (status === 'completed') return 'done';
  if (status === 'in-progress') return 'in progress';
  return 'available';
}

function StatusIcon({ status }: { status: ModuleStatus }) {
  if (status === 'locked') return <Lock className="h-4 w-4" />;
  if (status === 'completed') return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
  return <PlayCircle className="h-4 w-4 text-accent" />;
}

function ModuleIcon({ module }: { module: CourseModule }) {
  const src = ICON_MAP[module.icon];
  return src ? (
    <img
      src={src}
      alt=""
      className="h-10 w-10 rounded-md object-contain"
      onError={(event) => {
        event.currentTarget.style.display = 'none';
      }}
    />
  ) : (
    <div className="flex h-10 w-10 items-center justify-center rounded-md text-sm font-bold text-white" style={{ background: module.color }}>
      {module.title[0]}
    </div>
  );
}

export function DashboardPage() {
  const progress = useAppStore((state) => state.progress);
  const isProgressLoading = useAppStore((state) => state.isProgressLoading);
  const getModuleStatus = useAppStore((state) => state.getModuleStatus);
  const getModuleProgress = useAppStore((state) => state.getModuleProgress);

  const completedCount = modules.filter((module) => getModuleStatus(module.id) === 'completed').length;
  const totalProgress = (completedCount / course.meta.totalModules) * 100;

  return (
    <main className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <div>
          <p className="text-sm font-medium text-accent">Full Stack Developer Roadmap 2026</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-text-primary md:text-5xl">FSdev Roadmap</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
            Навчальна платформа з темами, відкритими тестами, практикою і AI-вчителем на OpenAI.
          </p>
        </div>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Загальний прогрес</p>
              <p className="mt-1 text-2xl font-semibold text-text-primary">{completedCount} з {course.meta.totalModules}</p>
            </div>
            <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-200">
              <Flame className="mr-1 h-3.5 w-3.5" />
              {progress.streakDays} днів
            </Badge>
          </div>
          <ProgressBar value={totalProgress} className="mt-4" />
        </Card>
      </section>

      {isProgressLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="h-52 animate-pulse bg-bg-surface/70" />
          ))}
        </div>
      ) : (
        <motion.section
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        >
          {modules.map((module) => {
            const status = getModuleStatus(module.id);
            const moduleProgress = getModuleProgress(module.slug);
            const locked = status === 'locked';
            return (
              <motion.div key={module.slug} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
                <Link to={locked ? '#' : `/module/${module.slug}`} aria-disabled={locked}>
                  <Card
                    className={`group flex h-full min-h-52 flex-col p-4 transition ${
                      status === 'completed'
                        ? 'border-emerald-500/40'
                        : status === 'in-progress'
                          ? 'border-accent/70 shadow-glow'
                          : locked
                            ? 'opacity-55'
                            : 'hover:border-border-hover'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <ModuleIcon module={module} />
                        <div>
                          <p className="text-xs text-text-secondary">Module {module.id}</p>
                          <h2 className="line-clamp-2 text-lg font-semibold text-text-primary">{module.title}</h2>
                        </div>
                      </div>
                      <StatusIcon status={status} />
                    </div>
                    <div className="mt-auto pt-6">
                      <div className="flex items-center justify-between text-xs text-text-secondary">
                        <span>{module.topics.length} тем</span>
                        <span>{percent(moduleProgress)}</span>
                      </div>
                      <ProgressBar value={moduleProgress} className="mt-2" />
                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-text-secondary">
                        <Badge>{module.practice.length} практики</Badge>
                        <Badge>{module.quiz.length} тестів</Badge>
                        <Badge className={status === 'completed' ? 'border-emerald-500/30 text-emerald-200' : ''}>{statusLabel(status)}</Badge>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.section>
      )}
    </main>
  );
}
