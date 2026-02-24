"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

export default function ManifestoReader({ content }: { content: string }) {
  return (
    <div className="min-h-screen">
      <div className="px-6 py-3 border-b border-border bg-muted/30">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back
          </Link>
          <span className="text-sm text-muted-foreground font-mono">MANIFESTO</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <article className="prose prose-stone max-w-none prose-headings:text-foreground prose-p:text-foreground prose-a:text-accent prose-strong:text-foreground prose-li:text-foreground prose-blockquote:text-muted-foreground prose-blockquote:border-accent/50">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </article>

        <div className="mt-16 pt-8 border-t border-border text-center">
          <Link
            href="/create"
            className="inline-block px-6 py-3 bg-accent text-accent-foreground font-medium rounded-lg hover:bg-gold-400 transition-colors"
          >
            Create a Constitution
          </Link>
        </div>
      </div>
    </div>
  );
}
