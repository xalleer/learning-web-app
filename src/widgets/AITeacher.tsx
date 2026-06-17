import { useState } from 'react';
import { Bot, Send, Trash2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useAppStore } from '@/app/store';
import { askTeacher } from '@/shared/api';
import type { CourseModule, TeacherMessage } from '@/shared/types';
import { Button, Card } from '@/shared/ui';
import { Markdown } from '@/shared/Markdown';

const EMPTY_MESSAGES: TeacherMessage[] = [];

export function AITeacher({ module }: { module: CourseModule }) {
  const messages = useAppStore((state) => state.teacherMessages[module.slug] ?? EMPTY_MESSAGES);
  const addTeacherMessage = useAppStore((state) => state.addTeacherMessage);
  const clearTeacherMessages = useAppStore((state) => state.clearTeacherMessages);
  const [message, setMessage] = useState('');

  const mutation = useMutation({
    mutationFn: askTeacher,
    onSuccess(data) {
      addTeacherMessage(module.slug, { role: 'assistant', content: data.message });
    },
  });

  function submit() {
    const cleanMessage = message.trim();
    if (!cleanMessage || mutation.isPending) return;
    addTeacherMessage(module.slug, { role: 'user', content: cleanMessage });
    setMessage('');
    mutation.mutate({
      moduleSlug: module.slug,
      moduleTitle: module.title,
      moduleTopics: module.topics,
      conversationHistory: messages,
      userMessage: cleanMessage,
    });
  }

  return (
    <Card className="flex min-h-[30rem] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-accent" />
          <div>
            <p className="text-sm font-semibold text-text-primary">AI Teacher</p>
            <p className="text-xs text-text-secondary">{module.title}</p>
          </div>
        </div>
        <button
          className="rounded-md border border-border p-2 text-text-secondary hover:bg-bg-elevated"
          onClick={() => clearTeacherMessages(module.slug)}
          aria-label="Очистити чат"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-4 text-sm text-text-secondary">
            Запитай пояснення, приклад або аналогію по темах цього модуля.
          </div>
        ) : null}
        {messages.map((item, index) => (
          <div key={`${item.role}-${index}`} className={item.role === 'user' ? 'ml-8 rounded-lg bg-accent p-3 text-sm text-white' : 'mr-8 rounded-lg bg-bg-elevated p-3'}>
            {item.role === 'assistant' ? <Markdown content={item.content} /> : item.content}
          </div>
        ))}
        {mutation.isPending ? <div className="mr-8 rounded-lg bg-bg-elevated p-3 text-sm text-text-secondary">AI думає...</div> : null}
        {mutation.error ? <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{mutation.error.message}</div> : null}
      </div>
      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') submit();
            }}
            className="min-w-0 flex-1 rounded-md border border-border bg-bg-primary px-3 text-sm text-text-primary"
            placeholder="Поясни цю тему простіше..."
          />
          <Button onClick={submit} loading={mutation.isPending} disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
