import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JsonSchemaService } from '../../core/services/json-schema.service';

@Component({
  selector: 'app-json-schema',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="min-h-[calc(100vh-80px)] flex flex-col p-4">
      <div class="max-w-7xl mx-auto w-full flex flex-col gap-4 flex-1">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">JSON Schema Validation</h1>
          <div class="flex items-center gap-2">
            <button
              (click)="loadExampleSchema()"
              class="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              📝 Load Example Schema
            </button>
            <button
              (click)="loadExampleData()"
              class="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            >
              📄 Load Example Data
            </button>
            <button
              (click)="clearAll()"
              class="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
            >
              🗑️ Clear All
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
          <!-- Schema Editor -->
          <div
            class="flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900"
          >
            <div
              class="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
            >
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">JSON Schema</h2>
            </div>
            <div class="flex-1 relative flex flex-col min-h-0">
              @if (schemaError()) {
              <div
                class="mx-4 mt-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-xs"
              >
                ⚠️ {{ schemaError() }}
              </div>
              }
              <textarea
                [ngModel]="schemaInput()"
                (ngModelChange)="onSchemaChange($event)"
                class="flex-1 w-full p-4 font-mono text-sm border-0 resize-none focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder='Enter JSON Schema here...&#10;Example:&#10;{&#10;  "type": "object",&#10;  "properties": {&#10;    "name": { "type": "string" },&#10;    "age": { "type": "number" }&#10;  },&#10;  "required": ["name"]&#10;}'
              ></textarea>
            </div>
          </div>

          <!-- Data Editor -->
          <div
            class="flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900"
          >
            <div
              class="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
            >
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">JSON Data</h2>
            </div>
            <div class="flex-1 relative flex flex-col min-h-0">
              @if (dataError()) {
              <div
                class="mx-4 mt-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-xs"
              >
                ⚠️ {{ dataError() }}
              </div>
              }
              <textarea
                [ngModel]="dataInput()"
                (ngModelChange)="onDataChange($event)"
                class="flex-1 w-full p-4 font-mono text-sm border-0 resize-none focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder='Enter JSON data to validate...&#10;Example:&#10;{&#10;  "name": "John",&#10;  "age": 30&#10;}'
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Validation Results -->
        <div
          class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900"
        >
          <div
            class="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
          >
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Validation Results
              </h2>
              @if (validationResult()) {
              <div
                class="px-3 py-1 rounded text-sm font-medium"
                [class]="
                  validationResult()!.valid
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                "
              >
                @if (validationResult()!.valid) {
                <span>✅ Valid</span>
                } @else {
                <span
                  >❌ Invalid ({{ validationResult()!.errors.length }} error{{
                    validationResult()!.errors.length > 1 ? 's' : ''
                  }})</span
                >
                }
              </div>
              }
            </div>
          </div>
          <div class="p-4">
            @if (!validationResult()) {
            <p class="text-gray-500 dark:text-gray-400 text-sm">
              Enter both JSON Schema and JSON Data to see validation results
            </p>
            } @else if (validationResult()!.valid) {
            <div class="flex items-center gap-2 text-green-600 dark:text-green-400">
              <span class="text-xl">✅</span>
              <p class="text-sm font-medium">JSON data is valid according to the schema!</p>
            </div>
            } @else {
            <div class="space-y-2">
              <p class="text-sm font-medium text-red-600 dark:text-red-400 mb-3">
                Found {{ validationResult()!.errors.length }} validation error(s):
              </p>
              @for (error of validationResult()!.errors; track error.path + error.message) {
              <div
                class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded"
              >
                <div class="flex items-start gap-2">
                  <span class="text-red-600 dark:text-red-400 mt-0.5">❌</span>
                  <div class="flex-1">
                    <p class="text-sm font-mono text-red-800 dark:text-red-300 mb-1">
                      Path: <span class="font-semibold">{{ error.path || '/' }}</span>
                    </p>
                    <p class="text-sm text-red-700 dark:text-red-400">{{ error.message }}</p>
                    @if (error.schemaPath) {
                    <p class="text-xs text-red-600 dark:text-red-500 mt-1">
                      Schema: {{ error.schemaPath }}
                    </p>
                    }
                  </div>
                </div>
              </div>
              }
            </div>
            }
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [],
})
export class JsonSchemaComponent {
  protected readonly schemaInput = signal<string>('');
  protected readonly dataInput = signal<string>('');

  constructor(private readonly schemaService: JsonSchemaService) {}

  // Parse schema and handle errors
  protected readonly parsedSchema = computed(() => {
    const schemaStr = this.schemaInput().trim();
    if (!schemaStr) {
      return { schema: null, error: null };
    }
    try {
      return { schema: JSON.parse(schemaStr), error: null };
    } catch (e) {
      return {
        schema: null,
        error: e instanceof Error ? e.message : 'Invalid JSON',
      };
    }
  });

  // Parse data and handle errors
  protected readonly parsedData = computed(() => {
    const dataStr = this.dataInput().trim();
    if (!dataStr) {
      return { data: null, error: null };
    }
    try {
      return { data: JSON.parse(dataStr), error: null };
    } catch (e) {
      return {
        data: null,
        error: e instanceof Error ? e.message : 'Invalid JSON',
      };
    }
  });

  // Error signals derived from parsed results
  protected readonly schemaError = computed(() => this.parsedSchema().error);
  protected readonly dataError = computed(() => this.parsedData().error);

  // Validation result
  protected readonly validationResult = computed(() => {
    const schemaResult = this.parsedSchema();
    const dataResult = this.parsedData();

    // Return null if either is empty or has parse error
    if (!schemaResult.schema || !dataResult.data || schemaResult.error || dataResult.error) {
      return null;
    }

    // Validate
    return this.schemaService.validate(dataResult.data, schemaResult.schema);
  });

  onSchemaChange(value: string): void {
    this.schemaInput.set(value);
  }

  onDataChange(value: string): void {
    this.dataInput.set(value);
  }

  loadExampleSchema(): void {
    const example = `{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "age": {
      "type": "number",
      "minimum": 0,
      "maximum": 150
    },
    "isActive": {
      "type": "boolean"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "minItems": 1
    },
    "address": {
      "type": "object",
      "properties": {
        "street": { "type": "string" },
        "city": { "type": "string" },
        "zipCode": { "type": "string", "pattern": "^\\\\d{5}$" }
      },
      "required": ["street", "city"]
    }
  },
  "required": ["name", "email", "age"],
  "additionalProperties": false
}`;
    this.schemaInput.set(example);
  }

  loadExampleData(): void {
    const example = `{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "isActive": true,
  "tags": ["developer", "angular"],
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  }
}`;
    this.dataInput.set(example);
  }

  clearAll(): void {
    this.schemaInput.set('');
    this.dataInput.set('');
  }
}
