import ReactMarkdown from 'react-markdown';

export function Markdown({ content }: { content: string }) {
  return (
    <div className="markdown text-sm leading-6 text-text-secondary">
      <ReactMarkdown
        components={{
          code({ className, children }) {
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <pre className="overflow-x-auto rounded-lg border border-border bg-bg-primary p-4">
                <code className="font-mono text-xs text-text-primary" data-language={match[1]}>
                  {String(children).replace(/\n$/, '')}
                </code>
              </pre>
            ) : (
              <code className="rounded bg-bg-elevated px-1 py-0.5 font-mono text-xs text-text-primary">{children}</code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
