import { CommonModule, JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, FormFieldComponent } from './form-field.component';

@Component({
  selector: 'app-form-generator',
  standalone: true,
  imports: [CommonModule, JsonPipe, ReactiveFormsModule, FormFieldComponent],
  template: `
    <div class="h-full flex flex-col">
      <div
        class="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Generated Form</h2>
          @if (formGroup()) {
          <div class="flex gap-2">
            <button
              (click)="resetForm()"
              class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors cursor-pointer"
            >
              Reset
            </button>
            <button
              (click)="submitForm()"
              class="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors cursor-pointer"
            >
              Submit
            </button>
          </div>
          }
        </div>
      </div>
      <div class="flex-1 overflow-auto p-4">
        @if (jsonData()) {
        <div class="space-y-4">
          @if (formGroup()) {
          <form
            [formGroup]="formGroup()!"
            (ngSubmit)="submitForm()"
            class="grid grid-cols-3 gap-y-4 gap-x-8"
          >
            @for (field of formFields(); track field.path) {
            <app-form-field
              [field]="field"
              [formGroup]="formGroup()!"
              (formDirty)="markFormDirty()"
            />
            }
          </form>
          } @else {
          <div class="text-sm text-yellow-600 dark:text-yellow-400">
            JSON structure is too complex or empty. Please provide a simple object structure.
          </div>
          }
        </div>
        } @else {
        <div class="space-y-3">
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Enter valid JSON object to generate a form
          </div>
          <div
            class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Example JSON:</p>
            <pre class="text-xs text-gray-600 dark:text-gray-400 font-mono overflow-x-auto">
            {{ '{' }}
                "name": "John Doe",
                "age": 30,
                "email": "john@example.com",
                "isActive": true,
                "tags": ["developer", "angular"]
            {{ '}' }}
            </pre
            >
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
              💡 Tip: The form will automatically generate fields based on your JSON structure
            </p>
          </div>
        </div>
        }
      </div>
      <div class="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Form Result:</h3>
          <div class="flex gap-2">
            @if (formResult()) {
            <button
              (click)="updateJsonInput()"
              class="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors cursor-pointer"
              title="Update JSON Input with form result"
            >
              ↻ Update JSON
            </button>
            <button
              (click)="copyResult()"
              class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors cursor-pointer"
              title="Copy result"
            >
              📋 Copy
            </button>
            }
          </div>
        </div>
        @if (formResult()) {
        <pre
          class="text-xs p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 overflow-auto max-h-96"
          >{{ formResult() | json }}</pre
        >
        } @else {
        <p class="text-xs text-gray-500 dark:text-gray-400">Click Submit to see the form result</p>
        }
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormGeneratorComponent {
  jsonInput = input<string>('');
  jsonOutput = output<string>();
  private readonly fb = new FormBuilder();
  protected readonly formGroup = signal<FormGroup | null>(null);
  protected readonly formFields = signal<FormField[]>([]);
  protected readonly formResult = signal<unknown>(null);

  protected readonly jsonData = computed(() => {
    if (!this.jsonInput() || this.jsonInput().trim() === '') {
      return null;
    }
    try {
      const parsed = JSON.parse(this.jsonInput());
      // Only generate form for objects (not arrays or primitives)
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed;
      }
      return null;
    } catch (e) {
      return null;
    }
  });

  private lastJsonString = '';
  private isFormDirty = false;

  constructor(private readonly cdr: ChangeDetectorRef) {
    // Rebuild form when JSON data structure changes (not values)
    effect(() => {
      const data = this.jsonData();
      const currentForm = this.formGroup();
      const currentJsonString = this.jsonInput();

      // Only rebuild if JSON string actually changed (not just parsed data)
      // AND form is not dirty (user hasn't edited it)
      if (currentJsonString !== this.lastJsonString) {
        // If form is dirty, don't rebuild - preserve user input
        if (this.isFormDirty && currentForm) {
          console.log('Form is dirty, skipping rebuild to preserve user input');
          return;
        }

        this.lastJsonString = currentJsonString;

        if (data) {
          // Check if we need to rebuild by comparing structure
          const needsRebuild = !currentForm || this.shouldRebuildForm(data, currentForm);
          if (needsRebuild) {
            console.log('Rebuilding form with new data structure');
            this.buildForm(data);
            this.isFormDirty = false; // Reset dirty flag after rebuild
          } else {
            console.log('Form structure unchanged, keeping existing form');
          }
        } else {
          this.formGroup.set(null);
          this.formFields.set([]);
          this.formResult.set(null);
          this.isFormDirty = false;
        }
      }
    });
  }

  private shouldRebuildForm(newData: Record<string, unknown>, currentForm: FormGroup): boolean {
    const currentKeys = Object.keys(currentForm.controls).sort();
    const newKeys = Object.keys(newData).sort();

    // Rebuild if keys changed
    if (currentKeys.length !== newKeys.length) {
      return true;
    }

    // Rebuild if any key is different
    for (let i = 0; i < newKeys.length; i++) {
      if (currentKeys[i] !== newKeys[i]) {
        return true;
      }
    }

    return false;
  }

  private buildForm(data: Record<string, unknown>): void {
    console.log('🔨 BUILDING FORM - this will reset form values!');
    // Save current form values before rebuilding
    const currentForm = this.formGroup();
    const savedValues: Record<string, unknown> = {};

    if (currentForm) {
      const currentValues = currentForm.getRawValue();
      console.log('💾 Saving current form values:', currentValues);
      for (const key of Object.keys(currentValues)) {
        if (data.hasOwnProperty(key)) {
          savedValues[key] = currentValues[key];
        }
      }
      console.log('💾 Saved values to restore:', savedValues);
    }

    const group: Record<string, unknown> = {};
    const fields: FormField[] = [];

    for (const [key, value] of Object.entries(data)) {
      const field = this.createField(key, value, key);
      fields.push(field);

      // Use saved value if available, otherwise use initial value
      if (savedValues[key] !== undefined) {
        group[key] = this.createFormControl(savedValues[key]);
      } else {
        group[key] = this.createFormControl(value);
      }
    }

    this.formGroup.set(this.fb.group(group));
    this.formFields.set(fields);
    this.formResult.set(null);
  }

  private createField(key: string, value: unknown, path: string): FormField {
    let type: FormField['type'] = 'string';

    if (typeof value === 'number') {
      type = 'number';
    } else if (typeof value === 'boolean') {
      type = 'boolean';
    } else if (Array.isArray(value)) {
      type = 'array';
    } else if (typeof value === 'object' && value !== null) {
      type = 'object';
    }

    return { key, type, value, path };
  }

  private createFormControl(value: unknown): unknown {
    if (typeof value === 'number') {
      return [value, [Validators.required]];
    } else if (typeof value === 'boolean') {
      return [value];
    } else if (Array.isArray(value)) {
      // For arrays, create a simple string input for now
      return [JSON.stringify(value)];
    } else if (typeof value === 'object' && value !== null) {
      // For nested objects, create a JSON string input
      return [JSON.stringify(value, null, 2)];
    } else {
      return [value ?? '', [Validators.required]];
    }
  }

  submitForm(): void {
    const form = this.formGroup();
    if (!form) {
      console.warn('Form is null');
      return;
    }

    console.log('=== SUBMIT FORM DEBUG ===');
    console.log('Form exists:', !!form);
    console.log('Form controls:', Object.keys(form.controls));
    console.log('Form fields count:', this.formFields().length);

    // Mark all fields as touched to show validation errors
    form.markAllAsTouched();

    // Get form values using different methods for comparison
    const formValue = form.value;
    const formRawValue = form.getRawValue();
    console.log('form.value:', formValue);
    console.log('form.getRawValue():', formRawValue);

    const result: Record<string, unknown> = {};

    // Iterate through form fields and get their values directly from controls
    for (const field of this.formFields()) {
      console.log(`\n--- Processing field: ${field.key} ---`);
      console.log('Field path:', field.path);
      console.log('Field type:', field.type);

      const control = form.get(field.path);
      console.log('Control exists:', !!control);
      console.log('Control type:', control?.constructor?.name);

      if (!control) {
        console.warn(`❌ Control not found for ${field.key} (${field.path})`);
        result[field.key] = this.getDefaultValue(field.type);
        continue;
      }

      // Get value using different methods
      const controlValue = control.value;
      const formValueField = formValue[field.path];
      const formRawValueField = formRawValue[field.path];

      console.log('control.value:', controlValue);
      console.log('formValue[path]:', formValueField);
      console.log('formRawValue[path]:', formRawValueField);

      // Use the most reliable value
      const value = controlValue ?? formRawValueField ?? formValueField;

      console.log(`✅ Using value for ${field.key}:`, value, 'Type:', typeof value);

      // Parse and set the value
      const parsedValue = this.parseFormValue(value, field.type);
      result[field.key] = parsedValue;
      console.log(`✅ Parsed value for ${field.key}:`, parsedValue);
    }

    console.log('\n=== FINAL RESULT ===');
    console.log('Final result:', result);
    // Set the result - create a new object to trigger signal update
    this.formResult.set({ ...result });
    // Trigger change detection manually for OnPush strategy
    this.cdr.markForCheck();
    console.log('Form result signal after set:', this.formResult());
    console.log('=== END DEBUG ===\n');
  }

  private getDefaultValue(type: FormField['type']): unknown {
    switch (type) {
      case 'number':
        return 0;
      case 'boolean':
        return false;
      case 'array':
        return [];
      case 'object':
        return {};
      default:
        return '';
    }
  }

  private parseFormValue(value: unknown, type: FormField['type']): unknown {
    // Handle null/undefined
    if (value === null || value === undefined) {
      if (type === 'boolean') return false;
      if (type === 'number') return 0;
      if (type === 'array') return [];
      if (type === 'object') return {};
      return '';
    }

    if (type === 'number') {
      if (typeof value === 'string' && value.trim() === '') {
        return 0;
      }
      const num = Number(value);
      return isNaN(num) ? value : num;
    } else if (type === 'boolean') {
      // Checkbox returns boolean directly
      return Boolean(value);
    } else if (type === 'array' || type === 'object') {
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return parsed;
        } catch {
          // If parsing fails, return empty array/object
          return type === 'array' ? [] : {};
        }
      }
      // If already an object/array, return as is
      return value;
    }
    // For string type, return as string
    return String(value ?? '');
  }

  protected markFormDirty(): void {
    this.isFormDirty = true;
  }

  resetForm(): void {
    const data = this.jsonData();
    if (data) {
      this.buildForm(data);
      this.isFormDirty = false;
    }
    this.formResult.set(null);
  }

  copyResult(): void {
    const result = this.formResult();
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    }
  }

  updateJsonInput(): void {
    const result = this.formResult();
    console.log('Updating JSON input with result:', result);
    if (result) {
      const jsonString = JSON.stringify(result, null, 2);
      this.jsonOutput.emit(jsonString);
    }
  }
}
