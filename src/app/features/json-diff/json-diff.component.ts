import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JsonDiffService, DiffResult } from '../../core/services/json-diff.service';

@Component({
  selector: 'app-json-diff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="min-h-[calc(100vh-80px)] flex flex-col">
      <div
        class="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">JSON Diff</h2>
          <div class="flex items-center gap-2">
            <button
              (click)="toggleHighlight()"
              class="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors cursor-pointer"
              [class.bg-indigo-700]="showHighlight()"
              title="Toggle highlight differences"
            >
              {{ showHighlight() ? '🔍 Highlighting' : '🔍 Highlight' }}
            </button>
            <button
              (click)="swapJson()"
              class="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors cursor-pointer"
              title="Swap JSON A and JSON B"
            >
              🔄 Swap
            </button>
            <button
              (click)="clearAll()"
              class="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors cursor-pointer"
              title="Clear all JSON"
            >
              🗑️ Clear
            </button>
          </div>
        </div>
      </div>
      <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-auto">
        <!-- JSON A Input -->
        <div class="flex flex-col">
          <div class="mb-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">JSON A (Old)</label>
            @if (errorA()) {
            <p class="text-xs text-red-600 dark:text-red-400 mt-1">{{ errorA() }}</p>
            }
          </div>
          <div class="flex-1 relative border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 overflow-hidden">
            <textarea
              [ngModel]="jsonA()"
              (ngModelChange)="updateJsonA($event)"
              class="absolute inset-0 w-full h-full p-3 font-mono text-sm bg-transparent text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
              placeholder='Enter first JSON here...&#10;Example:&#10;{&#10;  "name": "John",&#10;  "age": 30&#10;}'
            ></textarea>
            @if (showHighlight() && highlightedJsonA()) {
            <pre
              class="absolute inset-0 w-full h-full p-3 font-mono text-sm text-transparent pointer-events-none z-0 overflow-auto whitespace-pre-wrap break-words"
              [innerHTML]="highlightedJsonA()"
            ></pre>
            }
          </div>
        </div>

        <!-- JSON B Input -->
        <div class="flex flex-col">
          <div class="mb-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">JSON B (New)</label>
            @if (errorB()) {
            <p class="text-xs text-red-600 dark:text-red-400 mt-1">{{ errorB() }}</p>
            }
          </div>
          <div class="flex-1 relative border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 overflow-hidden">
            <textarea
              [ngModel]="jsonB()"
              (ngModelChange)="updateJsonB($event)"
              class="absolute inset-0 w-full h-full p-3 font-mono text-sm bg-transparent text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
              placeholder='Enter second JSON here...&#10;Example:&#10;{&#10;  "name": "Jane",&#10;  "age": 25&#10;}'
            ></textarea>
            @if (showHighlight() && highlightedJsonB()) {
            <pre
              class="absolute inset-0 w-full h-full p-3 font-mono text-sm text-transparent pointer-events-none z-0 overflow-auto whitespace-pre-wrap break-words"
              [innerHTML]="highlightedJsonB()"
            ></pre>
            }
          </div>
        </div>
      </div>

      <!-- Diff Results -->
      @if (diffResults().length > 0) {
      <div class="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div class="p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
              Differences ({{ diffResults().length }})
            </h3>
            <div class="flex items-center gap-4 text-xs">
              <div class="flex items-center gap-1">
                <span class="w-3 h-3 bg-green-500 rounded"></span>
                <span class="text-gray-600 dark:text-gray-400">Added</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="w-3 h-3 bg-red-500 rounded"></span>
                <span class="text-gray-600 dark:text-gray-400">Removed</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="w-3 h-3 bg-yellow-500 rounded"></span>
                <span class="text-gray-600 dark:text-gray-400">Changed</span>
              </div>
            </div>
          </div>
          <div class="space-y-2 max-h-64 overflow-auto">
            @for (diff of diffResults(); track diff.path) {
            <div
              class="p-3 rounded border-l-4 bg-white dark:bg-gray-900"
              [class.border-green-500]="diff.type === 'added'"
              [class.border-red-500]="diff.type === 'removed'"
              [class.border-yellow-500]="diff.type === 'changed'"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                    <span
                      class="px-2 py-0.5 rounded text-xs font-medium"
                      [class.bg-green-100]="diff.type === 'added'"
                      [class.text-green-800]="diff.type === 'added'"
                      [class.dark:bg-green-900]="diff.type === 'added'"
                      [class.dark:text-green-200]="diff.type === 'added'"
                      [class.bg-red-100]="diff.type === 'removed'"
                      [class.text-red-800]="diff.type === 'removed'"
                      [class.dark:bg-red-900]="diff.type === 'removed'"
                      [class.dark:text-red-200]="diff.type === 'removed'"
                      [class.bg-yellow-100]="diff.type === 'changed'"
                      [class.text-yellow-800]="diff.type === 'changed'"
                      [class.dark:bg-yellow-900]="diff.type === 'changed'"
                      [class.dark:text-yellow-200]="diff.type === 'changed'"
                    >
                      {{ diff.type.toUpperCase() }}
                    </span>
                    <span class="ml-2 font-mono text-gray-600 dark:text-gray-400">{{ diff.path }}</span>
                  </p>
                  @if (diff.type === 'added') {
                  <pre
                    class="text-xs font-mono bg-green-50 dark:bg-green-900/20 p-2 rounded mt-1 text-gray-700 dark:text-gray-300 overflow-x-auto"
                  >+ {{ diffService.formatValue(diff.newValue) }}</pre
                  >
                  } @else if (diff.type === 'removed') {
                  <pre
                    class="text-xs font-mono bg-red-50 dark:bg-red-900/20 p-2 rounded mt-1 text-gray-700 dark:text-gray-300 overflow-x-auto"
                  >- {{ diffService.formatValue(diff.oldValue) }}</pre
                  >
                  } @else if (diff.type === 'changed') {
                  <div class="space-y-1 mt-1">
                    <pre
                      class="text-xs font-mono bg-red-50 dark:bg-red-900/20 p-2 rounded text-gray-700 dark:text-gray-300 overflow-x-auto"
                    >- {{ diffService.formatValue(diff.oldValue) }}</pre
                    >
                    <pre
                      class="text-xs font-mono bg-green-50 dark:bg-green-900/20 p-2 rounded text-gray-700 dark:text-gray-300 overflow-x-auto"
                    >+ {{ diffService.formatValue(diff.newValue) }}</pre
                    >
                  </div>
                  }
                </div>
              </div>
            </div>
            }
          </div>
        </div>
      </div>
      } @else if (parsedJsonA() !== null && parsedJsonB() !== null) {
      <div class="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
        <div class="text-center text-sm text-gray-600 dark:text-gray-400">
          ✅ No differences found. Both JSON objects are identical.
        </div>
        </div>
      }
    </main>
  `,
  styles: [],
})
export class JsonDiffComponent {
  jsonA = signal<string>('');
  jsonB = signal<string>('');
  protected readonly showHighlight = signal<boolean>(true);

  constructor(protected readonly diffService: JsonDiffService) {}

  protected readonly parsedJsonA = computed(() => {
    const input = this.jsonA();
    if (!input || input.trim() === '') {
      return null;
    }
    try {
      return JSON.parse(input);
    } catch {
      return null;
    }
  });

  protected readonly parsedJsonB = computed(() => {
    const input = this.jsonB();
    if (!input || input.trim() === '') {
      return null;
    }
    try {
      return JSON.parse(input);
    } catch {
      return null;
    }
  });

  protected readonly errorA = computed(() => {
    const input = this.jsonA();
    if (!input || input.trim() === '') {
      return null;
    }
    try {
      JSON.parse(input);
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Invalid JSON';
    }
  });

  protected readonly errorB = computed(() => {
    const input = this.jsonB();
    if (!input || input.trim() === '') {
      return null;
    }
    try {
      JSON.parse(input);
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Invalid JSON';
    }
  });

  protected readonly diffResults = computed((): DiffResult[] => {
    const jsonA = this.parsedJsonA();
    const jsonB = this.parsedJsonB();

    if (jsonA === null || jsonB === null) {
      return [];
    }

    return this.diffService.compare(jsonA, jsonB);
  });

  protected readonly highlightedJsonA = computed((): string | null => {
    if (!this.showHighlight() || !this.jsonA() || this.diffResults().length === 0) {
      return null;
    }
    try {
      const beautified = JSON.stringify(this.parsedJsonA(), null, 2);
      return this.diffService.getHighlightedJsonA(beautified, this.diffResults());
    } catch {
      return null;
    }
  });

  protected readonly highlightedJsonB = computed((): string | null => {
    if (!this.showHighlight() || !this.jsonB() || this.diffResults().length === 0) {
      return null;
    }
    try {
      const beautified = JSON.stringify(this.parsedJsonB(), null, 2);
      return this.diffService.getHighlightedJsonB(beautified, this.diffResults());
    } catch {
      return null;
    }
  });

  updateJsonA(value: string): void {
    this.jsonA.set(value);
  }

  updateJsonB(value: string): void {
    this.jsonB.set(value);
  }

  swapJson(): void {
    const temp = this.jsonA();
    this.jsonA.set(this.jsonB());
    this.jsonB.set(temp);
  }

  clearAll(): void {
    this.jsonA.set('');
    this.jsonB.set('');
  }

  toggleHighlight(): void {
    this.showHighlight.update((show) => !show);
  }
}
