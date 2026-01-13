import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, signal } from '@angular/core';

export interface JsonNode {
  key: string;
  value: any;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  expanded?: boolean;
  path: string;
}

@Component({
  selector: 'app-json-node',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="json-node" [style.padding-left.px]="level() * 20">
      @if (node().type === 'object' || node().type === 'array') {
      <button
        (click)="toggleExpand()"
        class="flex items-center gap-1 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-1 py-0.5 w-full"
      >
        <span class="text-gray-500 dark:text-gray-400 w-4">
          {{ expanded() ? '▼' : '▶' }}
        </span>
        <span class="text-blue-600 dark:text-blue-400 font-semibold">
          @if (highlightText(node().key, searchQuery())) {
          <span [innerHTML]="highlightText(node().key, searchQuery())"></span>
          } @else {
          {{ node().key }}
          }
        </span>
        <span class="text-gray-500 dark:text-gray-400">
          {{ node().type === 'array' ? '[]' : '{}' }}
        </span>
      </button>
      @if (expanded()) {
      <div class="ml-5">
        @for (child of childNodes(); track child.path) {
        <app-json-node
          [node]="child"
          [level]="level() + 1"
          [searchQuery]="searchQuery()"
          [shouldExpand]="shouldExpandChild(child)"
        />
        }
      </div>
      } } @else {
      <div
        class="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-1 py-0.5"
      >
        <span class="text-blue-600 dark:text-blue-400 font-semibold">
          @if (highlightText(node().key, searchQuery())) {
          <span [innerHTML]="highlightText(node().key, searchQuery())"></span>
          } @else {
          {{ node().key }}
          } :
        </span>
        <span [class]="getValueClass()">
          @if (node().type !== 'object' && node().type !== 'array') { @if
          (highlightText(formatValue(node().value), searchQuery())) {
          <span [innerHTML]="highlightText(formatValue(node().value), searchQuery())"></span>
          } @else {
          {{ formatValue(node().value) }}
          } } @else {
          {{ formatValue(node().value) }}
          }
        </span>
        <button
          (click)="copyPath()"
          class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          title="Copy path"
        >
          📋
        </button>
      </div>
      }
    </div>
  `,
  styles: [],
})
export class JsonNodeComponent {
  node = input.required<JsonNode>();
  level = input.required<number>();
  searchQuery = input<string>('');
  shouldExpand = input<boolean>(false);
  protected readonly expanded = signal(false);

  constructor() {
    // Initialize expanded state from node
    effect(() => {
      const initialExpanded = this.node().expanded ?? false;
      const shouldExpand = this.shouldExpand();
      this.expanded.set(initialExpanded || shouldExpand);
    });
  }

  protected readonly childNodes = computed(() => {
    const node = this.node();
    if (node.type !== 'object' && node.type !== 'array') return [];

    if (Array.isArray(node.value)) {
      return node.value.map((item: any, index: number) => {
        const itemPath = `${node.path}[${index}]`;
        if (typeof item === 'object' && item !== null) {
          return {
            key: `[${index}]`,
            value: item,
            type: Array.isArray(item) ? 'array' : 'object',
            expanded: false,
            path: itemPath,
          } as JsonNode;
        }
        return {
          key: `[${index}]`,
          value: item,
          type: this.getType(item),
          path: itemPath,
        } as JsonNode;
      });
    }

    return Object.keys(node.value).map((key) => {
      const value = node.value[key];
      const itemPath = node.path ? `${node.path}.${key}` : key;
      if (typeof value === 'object' && value !== null) {
        return {
          key,
          value,
          type: Array.isArray(value) ? 'array' : 'object',
          expanded: false,
          path: itemPath,
        } as JsonNode;
      }
      return {
        key,
        value,
        type: this.getType(value),
        path: itemPath,
      } as JsonNode;
    });
  });

  toggleExpand(): void {
    this.expanded.update((v) => !v);
  }

  formatValue(value: any): string {
    if (value === null) return 'null';
    if (typeof value === 'string') return `"${value}"`;
    return String(value);
  }

  getValueClass(): string {
    const node = this.node();
    switch (node.type) {
      case 'string':
        return 'text-green-600 dark:text-green-400';
      case 'number':
        return 'text-purple-600 dark:text-purple-400';
      case 'boolean':
        return 'text-orange-600 dark:text-orange-400';
      case 'null':
        return 'text-gray-500 dark:text-gray-400';
      default:
        return 'text-gray-900 dark:text-white';
    }
  }

  copyPath(): void {
    navigator.clipboard.writeText(this.node().path);
  }

  highlightText(text: string, query: string): string | null {
    if (!query || !text) return null;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    if (!lowerText.includes(lowerQuery)) return null;

    // Highlight all matches (case-insensitive)
    const escaped = this.escapeHtml(text);
    const parts: string[] = [];
    let lastIndex = 0;
    let searchIndex = 0;

    while (true) {
      const index = lowerText.indexOf(lowerQuery, searchIndex);
      if (index === -1) break;

      // Add text before match
      if (index > lastIndex) {
        parts.push(escaped.substring(lastIndex, index));
      }

      // Add highlighted match
      const match = escaped.substring(index, index + query.length);
      parts.push(`<mark class="bg-yellow-300 dark:bg-yellow-600 px-0.5 rounded">${match}</mark>`);

      lastIndex = index + query.length;
      searchIndex = index + query.length;
    }

    // Add remaining text
    if (lastIndex < escaped.length) {
      parts.push(escaped.substring(lastIndex));
    }

    return parts.join('');
  }

  shouldExpandChild(child: JsonNode): boolean {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return false;

    // Check if child matches search
    if (child.key.toLowerCase().includes(query)) return true;
    if (child.path.toLowerCase().includes(query)) return true;
    if (child.type !== 'object' && child.type !== 'array') {
      const valueStr = String(child.value).toLowerCase();
      if (valueStr.includes(query)) return true;
    }

    return false;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private getType(value: any): 'string' | 'number' | 'boolean' | 'null' {
    if (value === null) return 'null';
    return typeof value as 'string' | 'number' | 'boolean';
  }
}
