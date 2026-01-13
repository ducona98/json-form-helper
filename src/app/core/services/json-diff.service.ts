import { Injectable } from '@angular/core';

export interface DiffResult {
  type: 'added' | 'removed' | 'changed' | 'unchanged';
  key: string;
  path: string;
  oldValue?: unknown;
  newValue?: unknown;
  children?: DiffResult[];
}

@Injectable({
  providedIn: 'root',
})
export class JsonDiffService {
  /**
   * Compare two JSON objects and return diff results
   */
  compare(oldJson: unknown, newJson: unknown, path = ''): DiffResult[] {
    const diffs: DiffResult[] = [];

    // Both are null/undefined
    if (oldJson === null && newJson === null) {
      return [];
    }

    // Old is null/undefined, new exists (added)
    if ((oldJson === null || oldJson === undefined) && newJson !== null && newJson !== undefined) {
      return [
        {
          type: 'added',
          key: path.split('.').pop() || '',
          path,
          newValue: newJson,
        },
      ];
    }

    // New is null/undefined, old exists (removed)
    if ((newJson === null || newJson === undefined) && oldJson !== null && oldJson !== undefined) {
      return [
        {
          type: 'removed',
          key: path.split('.').pop() || '',
          path,
          oldValue: oldJson,
        },
      ];
    }

    // Type mismatch
    if (typeof oldJson !== typeof newJson) {
      return [
        {
          type: 'changed',
          key: path.split('.').pop() || '',
          path,
          oldValue: oldJson,
          newValue: newJson,
        },
      ];
    }

    // Both are primitives
    if (this.isPrimitive(oldJson) && this.isPrimitive(newJson)) {
      if (oldJson !== newJson) {
        return [
          {
            type: 'changed',
            key: path.split('.').pop() || '',
            path,
            oldValue: oldJson,
            newValue: newJson,
          },
        ];
      }
      return [];
    }

    // Both are arrays
    if (Array.isArray(oldJson) && Array.isArray(newJson)) {
      const maxLength = Math.max(oldJson.length, newJson.length);
      for (let i = 0; i < maxLength; i++) {
        const itemPath = path ? `${path}[${i}]` : `[${i}]`;
        const oldItem = oldJson[i];
        const newItem = newJson[i];

        if (i >= oldJson.length) {
          // Added item
          diffs.push({
            type: 'added',
            key: `[${i}]`,
            path: itemPath,
            newValue: newItem,
          });
        } else if (i >= newJson.length) {
          // Removed item
          diffs.push({
            type: 'removed',
            key: `[${i}]`,
            path: itemPath,
            oldValue: oldItem,
          });
        } else {
          // Compare items
          const itemDiffs = this.compare(oldItem, newItem, itemPath);
          diffs.push(...itemDiffs);
        }
      }
      return diffs;
    }

    // Both are objects
    if (typeof oldJson === 'object' && typeof newJson === 'object' && oldJson !== null && newJson !== null) {
      const oldKeys = Object.keys(oldJson);
      const newKeys = Object.keys(newJson);
      const allKeys = new Set([...oldKeys, ...newKeys]);

      for (const key of allKeys) {
        const itemPath = path ? `${path}.${key}` : key;
        const oldValue = (oldJson as Record<string, unknown>)[key];
        const newValue = (newJson as Record<string, unknown>)[key];

        if (!(key in (oldJson as Record<string, unknown>))) {
          // Added key
          diffs.push({
            type: 'added',
            key,
            path: itemPath,
            newValue,
          });
        } else if (!(key in (newJson as Record<string, unknown>))) {
          // Removed key
          diffs.push({
            type: 'removed',
            key,
            path: itemPath,
            oldValue,
          });
        } else {
          // Compare values
          const valueDiffs = this.compare(oldValue, newValue, itemPath);
          if (valueDiffs.length > 0) {
            // If there are nested diffs, create a parent diff
            if (valueDiffs.some((d) => d.type !== 'unchanged')) {
              diffs.push({
                type: 'changed',
                key,
                path: itemPath,
                oldValue,
                newValue,
                children: valueDiffs,
              });
            }
          }
        }
      }
      return diffs;
    }

    return [];
  }

  /**
   * Check if value is primitive
   */
  private isPrimitive(value: unknown): boolean {
    return (
      value === null ||
      value === undefined ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    );
  }

  /**
   * Format value for display
   */
  formatValue(value: unknown): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }
    return String(value);
  }

  /**
   * Get all paths that have differences
   */
  getDiffPaths(diffs: DiffResult[]): Set<string> {
    const paths = new Set<string>();
    for (const diff of diffs) {
      paths.add(diff.path);
      if (diff.children) {
        const childPaths = this.getDiffPaths(diff.children);
        childPaths.forEach((p) => paths.add(p));
      }
    }
    return paths;
  }

  /**
   * Highlight JSON string with diff paths
   */
  highlightJsonString(
    jsonString: string,
    diffPaths: Set<string>,
    type: 'old' | 'new'
  ): string {
    if (!jsonString || diffPaths.size === 0) {
      return this.escapeHtml(jsonString);
    }

    const escaped = this.escapeHtml(jsonString);
    const lines = escaped.split('\n');
    const highlightedLines: string[] = [];
    const colorClass =
      type === 'old'
        ? 'bg-red-100 dark:bg-red-900/30'
        : 'bg-green-100 dark:bg-green-900/30';

    // Extract keys from paths
    const keysToHighlight = new Set<string>();
    for (const path of diffPaths) {
      const segments = path.split('.');
      const lastSegment = segments[segments.length - 1];
      // Remove array indices like [0]
      const cleanKey = lastSegment.replace(/\[\d+\]/g, '');
      if (cleanKey) {
        keysToHighlight.add(cleanKey);
      }
    }

    // Track if we're inside a highlighted block (for nested objects)
    let inHighlightedBlock = false;
    let blockDepth = 0;

    // Highlight lines containing keys
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let shouldHighlight = false;

      // Check if line contains a key to highlight
      for (const key of keysToHighlight) {
        const keyPattern = `"${key.replace(/"/g, '&quot;')}"\\s*:`;
        if (line.includes(keyPattern)) {
          shouldHighlight = true;
          inHighlightedBlock = true;
          blockDepth = 0;
          break;
        }
      }

      // Count braces/brackets to track nested structures
      if (shouldHighlight || inHighlightedBlock) {
        const openBraces = (line.match(/\{/g) || []).length;
        const closeBraces = (line.match(/\}/g) || []).length;
        const openBrackets = (line.match(/\[/g) || []).length;
        const closeBrackets = (line.match(/\]/g) || []).length;
        blockDepth += openBraces + openBrackets - closeBraces - closeBrackets;

        if (shouldHighlight || blockDepth > 0) {
          highlightedLines.push(`<span class="${colorClass} block px-1">${line}</span>`);
        } else {
          highlightedLines.push(line);
          inHighlightedBlock = false;
        }
      } else {
        highlightedLines.push(line);
      }
    }

    return highlightedLines.join('\n');
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get highlighted lines for JSON A (old)
   */
  getHighlightedJsonA(jsonString: string, diffs: DiffResult[]): string {
    const removedPaths = new Set<string>();
    const changedPaths = new Set<string>();

    for (const diff of diffs) {
      if (diff.type === 'removed') {
        removedPaths.add(diff.path);
      } else if (diff.type === 'changed') {
        changedPaths.add(diff.path);
      }
    }

    const allPaths = new Set([...removedPaths, ...changedPaths]);
    return this.highlightJsonString(jsonString, allPaths, 'old');
  }

  /**
   * Get highlighted lines for JSON B (new)
   */
  getHighlightedJsonB(jsonString: string, diffs: DiffResult[]): string {
    const addedPaths = new Set<string>();
    const changedPaths = new Set<string>();

    for (const diff of diffs) {
      if (diff.type === 'added') {
        addedPaths.add(diff.path);
      } else if (diff.type === 'changed') {
        changedPaths.add(diff.path);
      }
    }

    const allPaths = new Set([...addedPaths, ...changedPaths]);
    return this.highlightJsonString(jsonString, allPaths, 'new');
  }
}
