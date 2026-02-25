"use client";

import { useState, useEffect, useCallback } from "react";
import { generateDiff } from "@/lib/amendment";
import { DiffViewer } from "./DiffViewer";

interface AmendmentEditorProps {
  slug: string;
  value: string;
  onChange: (diff: string, modified: string) => void;
}

export function AmendmentEditor({ slug, value, onChange }: AmendmentEditorProps) {
  const [original, setOriginal] = useState<string | null>(null);
  const [modified, setModified] = useState(value);
  const [diff, setDiff] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConstitution() {
      try {
        const res = await fetch(`/api/constitution/${slug}?format=raw`);
        if (!res.ok) throw new Error("Failed to load constitution content");
        const text = await res.text();
        setOriginal(text);
        setModified(text);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchConstitution();
  }, [slug]);

  const handleEdit = useCallback(
    (newText: string) => {
      setModified(newText);
      if (original) {
        const newDiff = generateDiff(original, newText);
        setDiff(newDiff);
        onChange(newDiff, newText);
      }
    },
    [original, onChange]
  );

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    );
  }

  if (error || !original) {
    return (
      <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 text-red-400 text-sm">
        {error || "Could not load constitution content"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium mb-2">Edit Constitution</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current (read-only) */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">Current</div>
          <pre className="w-full h-80 p-3 bg-muted/30 border border-border rounded-lg text-sm overflow-auto whitespace-pre-wrap">
            {original}
          </pre>
        </div>
        {/* Editable */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">Proposed</div>
          <textarea
            value={modified}
            onChange={(e) => handleEdit(e.target.value)}
            className="w-full h-80 p-3 bg-background border border-border rounded-lg text-sm font-mono resize-y focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Live diff preview */}
      {diff && (
        <div>
          <div className="text-xs text-muted-foreground mb-1">Diff Preview</div>
          <DiffViewer diff={diff} />
        </div>
      )}
    </div>
  );
}
