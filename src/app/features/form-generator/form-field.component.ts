import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

export interface FormField {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  value: unknown;
  path: string;
}

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-1">
      <label
        [for]="field().path"
        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {{ field().key }}
        @if (isRequired()) {
        <span class="text-red-500">*</span>
        }
      </label>
      @if (control()) { @switch (field().type) { @case ('string') {
      <input
        [id]="field().path"
        type="text"
        [formControl]="control()!"
        (input)="onInput()"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        [placeholder]="getPlaceholder()"
      />
      } @case ('number') {
      <input
        [id]="field().path"
        type="number"
        [formControl]="control()!"
        (input)="onInput()"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        [placeholder]="getPlaceholder()"
      />
      } @case ('boolean') {
      <div class="flex items-center">
        <input
          [id]="field().path"
          type="checkbox"
          [formControl]="control()!"
          (change)="onInput()"
          class="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:bg-gray-800"
        />
        <label [for]="field().path" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
          {{ field().key }}
        </label>
      </div>
      } @case ('array') {
      <textarea
        [id]="field().path"
        [formControl]="control()!"
        (input)="onInput()"
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder='Enter JSON array, e.g. ["item1", "item2"]'
      ></textarea>
      <p class="text-xs text-gray-500 dark:text-gray-400">Enter as JSON array format</p>
      } @case ('object') {
      <textarea
        [id]="field().path"
        [formControl]="control()!"
        (input)="onInput()"
        rows="5"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder='Enter JSON object, e.g. {"key": "value"}'
      ></textarea>
      <p class="text-xs text-gray-500 dark:text-gray-400">Enter as JSON object format</p>
      } } } @else {
      <p class="text-xs text-red-600 dark:text-red-400">
        Missing form control for "{{ field().path }}"
      </p>
      } @if (hasError()) {
      <p class="text-xs text-red-600 dark:text-red-400">
        {{ getErrorMessage() }}
      </p>
      }
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent {
  field = input.required<FormField>();
  formGroup = input.required<FormGroup>();
  formDirty = output<void>();

  protected onInput(): void {
    this.formDirty.emit();
  }

  protected readonly control = computed<FormControl | null>(() => {
    const c: AbstractControl | null = this.formGroup().get(this.field().path);
    if (!c) return null;
    return c as FormControl;
  });

  protected readonly isRequired = computed(() => {
    const control = this.formGroup().get(this.field().path);
    return control?.hasError('required') && control?.touched;
  });

  protected readonly hasError = computed(() => {
    const control = this.formGroup().get(this.field().path);
    return control?.invalid && control?.touched;
  });

  protected readonly getErrorMessage = computed(() => {
    const control = this.formGroup().get(this.field().path);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    return 'Invalid value';
  });

  protected getPlaceholder(): string {
    const fieldValue = this.field();
    if (fieldValue.type === 'string') {
      return `Enter ${fieldValue.key}`;
    } else if (fieldValue.type === 'number') {
      return `Enter a number`;
    }
    return '';
  }
}
