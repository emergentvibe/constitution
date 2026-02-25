"use client";

import { parseDiffForDisplay } from "@/lib/amendment";

interface DiffViewerProps {
  diff: string;
}

export function DiffViewer({ diff }: DiffViewerProps) {
  const lines = parseDiffForDisplay(diff);

  if (lines.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic">No changes</div>
    );
  }

  return (
    <div className="font-mono text-sm overflow-x-auto border border-border rounded-lg">
      {lines.map((line, i) => {
        let className = "px-4 py-0.5 whitespace-pre";
        if (line.type === "add") {
          className += " bg-green-900/30 text-green-300";
        } else if (line.type === "remove") {
          className += " bg-red-900/30 text-red-300";
        } else if (line.type === "hunk") {
          className += " bg-muted/50 text-muted-foreground text-xs py-1";
        }

        return (
          <div key={i} className={className}>
            {line.type === "add" && <span className="select-none mr-2">+</span>}
            {line.type === "remove" && <span className="select-none mr-2">-</span>}
            {line.type === "context" && <span className="select-none mr-2">&nbsp;</span>}
            {line.content}
          </div>
        );
      })}
    </div>
  );
}
