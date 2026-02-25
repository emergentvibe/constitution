/**
 * Amendment diff utilities.
 * Generates, validates, and applies unified diffs for constitutional amendments.
 */

import { createTwoFilesPatch, applyPatch } from 'diff';

/**
 * Generate a unified diff between the original and modified constitution text.
 */
export function generateDiff(original: string, modified: string): string {
  return createTwoFilesPatch(
    'CONSTITUTION.md',
    'CONSTITUTION.md',
    original,
    modified,
    'current',
    'proposed',
    { context: 3 }
  );
}

/**
 * Apply a unified diff to the original text to produce the amended version.
 * Returns null if the patch cannot be applied cleanly.
 */
export function applyDiff(original: string, diff: string): string | null {
  const result = applyPatch(original, diff);
  if (result === false) return null;
  return result;
}

/**
 * Validate that a diff can be cleanly applied to the given constitution content.
 */
export function validateDiff(
  constitutionContent: string,
  diff: string
): { valid: boolean; preview: string | null; error?: string } {
  try {
    const result = applyDiff(constitutionContent, diff);
    if (result === null) {
      return {
        valid: false,
        preview: null,
        error: 'Diff cannot be applied cleanly — the constitution may have changed since this amendment was created',
      };
    }
    return { valid: true, preview: result };
  } catch (err) {
    return {
      valid: false,
      preview: null,
      error: err instanceof Error ? err.message : 'Unknown error applying diff',
    };
  }
}

/**
 * Parse a unified diff into hunks for display.
 * Each line is tagged as 'add', 'remove', or 'context'.
 */
export function parseDiffForDisplay(diff: string): DiffLine[] {
  const lines = diff.split('\n');
  const result: DiffLine[] = [];
  let inHunk = false;

  for (const line of lines) {
    // Skip file headers
    if (line.startsWith('===') || line.startsWith('---') || line.startsWith('+++') || line.startsWith('Index:')) {
      continue;
    }
    // Hunk header
    if (line.startsWith('@@')) {
      inHunk = true;
      result.push({ type: 'hunk', content: line });
      continue;
    }
    if (!inHunk) continue;

    if (line.startsWith('+')) {
      result.push({ type: 'add', content: line.slice(1) });
    } else if (line.startsWith('-')) {
      result.push({ type: 'remove', content: line.slice(1) });
    } else if (line.startsWith(' ')) {
      result.push({ type: 'context', content: line.slice(1) });
    } else if (line === '') {
      result.push({ type: 'context', content: '' });
    }
  }

  return result;
}

export interface DiffLine {
  type: 'add' | 'remove' | 'context' | 'hunk';
  content: string;
}
