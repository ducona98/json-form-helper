import { CommonModule } from '@angular/common';
import { Component, computed, effect, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JsonHistoryService } from '../../core/services/json-history.service';
import { JsonExportService, ExportFormat } from '../../core/services/json-export.service';

@Component({
  selector: 'app-json-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col max-h-[50vh]">
      <div
        class="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between"
      >
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">JSON Input</h2>
        <div class="flex items-center gap-2">
          <button
            (click)="beautifyJson()"
            class="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors cursor-pointer"
            title="Beautify JSON (format with indentation)"
            [disabled]="!isValidJson()"
          >
            ✨ Beautify
          </button>
          <button
            (click)="minifyJson()"
            class="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors cursor-pointer"
            title="Minify JSON (remove all whitespace)"
            [disabled]="!isValidJson()"
          >
            📦 Minify
          </button>
          <button
            (click)="loadExample()"
            class="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors cursor-pointer"
            title="Load example JSON for form generator"
          >
            📝 Load Example
          </button>
          <button
            (click)="toggleHistory()"
            class="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors cursor-pointer"
            title="View JSON history"
          >
            📚 History @if (historyService.getHistoryCount() > 0) {
            <span class="ml-1 text-xs">({{ historyService.getHistoryCount() }})</span>
            }
          </button>
          <button
            (click)="importFromFile()"
            class="px-3 py-1 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors cursor-pointer"
            title="Import JSON from file"
          >
            📥 Import
          </button>
          <div class="relative">
            <button
              (click)="toggleExportMenu()"
              class="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors cursor-pointer flex items-center gap-1"
              title="Export to various formats"
              [disabled]="!isValidJson() || !jsonInput() || jsonInput().trim() === ''"
            >
              📤 Export
              <span class="text-[10px]">▼</span>
            </button>
            @if (showExportMenu()) {
            <div
              class="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 min-w-[150px]"
            >
              <button
                (click)="exportToFormat('json')"
                class="w-full px-3 py-2 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white flex items-center gap-2"
              >
                📄 JSON
              </button>
              <button
                (click)="exportToFormat('yaml')"
                class="w-full px-3 py-2 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white flex items-center gap-2"
              >
                📝 YAML
              </button>
              <button
                (click)="exportToFormat('csv')"
                class="w-full px-3 py-2 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white flex items-center gap-2"
              >
                📊 CSV
              </button>
              <button
                (click)="exportToFormat('xml')"
                class="w-full px-3 py-2 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white flex items-center gap-2"
              >
                🔷 XML
              </button>
              <button
                (click)="exportToFormat('toml')"
                class="w-full px-3 py-2 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white flex items-center gap-2"
              >
                ⚙️ TOML
              </button>
            </div>
            }
          </div>
        </div>
      </div>
      @if (showHistory()) {
      <div class="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div class="p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">History</h3>
            <button
              (click)="clearHistory()"
              class="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors cursor-pointer"
              [disabled]="historyService.getHistoryCount() === 0"
            >
              Clear All
            </button>
          </div>
          @if (historyService.getHistoryCount() === 0) {
          <p class="text-xs text-gray-500 dark:text-gray-400">
            No history yet. Valid JSON will be automatically saved.
          </p>
          } @else {
          <div class="space-y-2 max-h-[178px] overflow-auto">
            @for (item of historyItems(); track item.id) {
            <div
              class="p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-mono text-gray-600 dark:text-gray-400 truncate mb-1">
                    {{ item.preview }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-500">
                    {{ formatTimestamp(item.timestamp) }}
                  </p>
                </div>
                <div class="flex gap-1 shrink-0">
                  <button
                    (click)="loadFromHistory(item.id)"
                    class="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors cursor-pointer"
                    title="Load this JSON"
                  >
                    Load
                  </button>
                  <button
                    (click)="deleteHistoryItem(item.id)"
                    class="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors cursor-pointer"
                    title="Delete from history"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
            }
          </div>
          }
        </div>
      </div>
      }
      <div class="flex-1 relative flex flex-col">
        @if (errorMessage()) {
        <div
          class="mx-4 mt-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-xs"
        >
          ⚠️ {{ errorMessage() }}
        </div>
        }
        <textarea
          [ngModel]="jsonInput()"
          (ngModelChange)="jsonInput.set($event); errorMessage.set(null)"
          class="flex-1 w-full p-4 font-mono text-sm border-0 resize-none focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          placeholder='Enter your JSON here...&#10;Example:&#10;{&#10;  "name": "John",&#10;  "age": 30&#10;}'
        ></textarea>
      </div>
    </div>
  `,
  styles: [],
})
export class JsonEditorComponent {
  jsonInput = model<string>('');
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly showHistory = signal<boolean>(false);
  protected readonly showExportMenu = signal<boolean>(false);
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    protected readonly historyService: JsonHistoryService,
    private readonly exportService: JsonExportService
  ) {
    // Auto-save valid JSON to history (with debounce)
    effect(() => {
      const input = this.jsonInput();
      if (this.isValidJson() && input && input.trim() !== '') {
        // Debounce: save after 2 seconds of no changes
        if (this.saveTimeout) {
          clearTimeout(this.saveTimeout);
        }
        this.saveTimeout = setTimeout(() => {
          this.historyService.saveToHistory(input);
        }, 2000);
      }
    });
  }

  protected readonly historyItems = computed(() => {
    return this.historyService.getHistory();
  });

  protected readonly exampleJson = `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "isActive": true,
  "tags": ["developer", "angular"],
  "address": {
    "street": "123 Main St",
    "city": "New York"
  }
}`;

  protected readonly isValidJson = computed(() => {
    const input = this.jsonInput();
    if (!input || input.trim() === '') {
      return false;
    }
    try {
      JSON.parse(input);
      return true;
    } catch {
      return false;
    }
  });

  loadExample(): void {
    this.jsonInput.set(this.exampleJson);
    this.errorMessage.set(null);
  }

  beautifyJson(): void {
    const input = this.jsonInput();
    if (!input || input.trim() === '') {
      this.errorMessage.set('JSON input is empty');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const beautified = JSON.stringify(parsed, null, 2);
      this.jsonInput.set(beautified);
      this.errorMessage.set(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid JSON';
      this.errorMessage.set(`Beautify failed: ${message}`);
    }
  }

  minifyJson(): void {
    const input = this.jsonInput();
    if (!input || input.trim() === '') {
      this.errorMessage.set('JSON input is empty');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      this.jsonInput.set(minified);
      this.errorMessage.set(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid JSON';
      this.errorMessage.set(`Minify failed: ${message}`);
    }
  }

  toggleHistory(): void {
    this.showHistory.update((show) => !show);
  }

  loadFromHistory(id: string): void {
    const json = this.historyService.getJsonById(id);
    if (json) {
      this.jsonInput.set(json);
      this.errorMessage.set(null);
      // Update timestamp when loaded
      this.historyService.saveToHistory(json);
    }
  }

  deleteHistoryItem(id: string): void {
    this.historyService.deleteHistoryItem(id);
  }

  clearHistory(): void {
    if (confirm('Are you sure you want to clear all history?')) {
      this.historyService.clearHistory();
    }
  }

  formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return (
        date.toLocaleDateString() +
        ' ' +
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    }
  }

  importFromFile(): void {
    // Create hidden file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.style.display = 'none';

    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) {
        return;
      }

      // Validate file type
      if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
        this.errorMessage.set('Please select a valid JSON file (.json)');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const content = e.target?.result as string;
          if (!content || content.trim() === '') {
            this.errorMessage.set('File is empty');
            return;
          }

          // Validate JSON
          const parsed = JSON.parse(content);
          // Beautify JSON on import for better readability
          const beautified = JSON.stringify(parsed, null, 2);
          this.jsonInput.set(beautified);
          this.errorMessage.set(null);

          // Auto-save to history
          this.historyService.saveToHistory(beautified);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Invalid JSON';
          this.errorMessage.set(`Import failed: ${message}`);
        }
      };

      reader.onerror = () => {
        this.errorMessage.set('Failed to read file');
      };

      reader.readAsText(file);
    };

    // Trigger file picker
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  toggleExportMenu(): void {
    this.showExportMenu.update((show) => !show);
    // Close menu when clicking outside
    if (this.showExportMenu()) {
      setTimeout(() => {
        const handler = (event: MouseEvent) => {
          const target = event.target as HTMLElement;
          if (!target.closest('.relative')) {
            this.showExportMenu.set(false);
            document.removeEventListener('click', handler);
          }
        };
        // Use setTimeout to avoid immediate trigger
        setTimeout(() => {
          document.addEventListener('click', handler);
        }, 0);
      }, 0);
    }
  }

  exportToFile(): void {
    this.exportToFormat('json');
  }

  exportToFormat(format: ExportFormat | 'json'): void {
    const input = this.jsonInput();
    if (!input || input.trim() === '') {
      this.errorMessage.set('JSON input is empty');
      this.showExportMenu.set(false);
      return;
    }

    if (!this.isValidJson()) {
      this.errorMessage.set('Cannot export invalid JSON');
      this.showExportMenu.set(false);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      let content: string;
      let formatType: ExportFormat;

      if (format === 'json') {
        // Beautify JSON before export
        content = JSON.stringify(parsed, null, 2);
        formatType = 'yaml'; // Will be overridden below
      } else {
        formatType = format;
        content = this.exportService.exportToFormat(parsed, formatType);
      }

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = format === 'json' ? 'json' : this.exportService.getFileExtension(formatType);
      const filename = `json-export-${timestamp}.${extension}`;
      const mimeType =
        format === 'json'
          ? 'application/json'
          : this.exportService.getMimeType(formatType);

      // Download file
      this.exportService.downloadFile(content, filename, mimeType);
      this.errorMessage.set(null);
      this.showExportMenu.set(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed';
      this.errorMessage.set(`Export failed: ${message}`);
      this.showExportMenu.set(false);
    }
  }
}
