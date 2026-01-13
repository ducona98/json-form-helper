import { CommonModule } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-json-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-2">
      <div class="relative">
        <input
          type="text"
          [ngModel]="searchQuery()"
          (ngModelChange)="onSearchChange($event)"
          placeholder="Search keys or values..."
          class="w-full px-3 py-1.5 pl-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        @if (searchQuery()) {
        <span
          class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400"
        >
          {{ resultCount() }}/{{ totalCount() }}
        </span>
        }
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-xs text-gray-600 dark:text-gray-400">Filter by type:</span>
        <label class="flex items-center gap-1 text-xs cursor-pointer">
          <input
            type="checkbox"
            [checked]="filterTypes().includes('string')"
            (change)="toggleFilterType('string', $event)"
            class="rounded"
          />
          <span class="text-green-600 dark:text-green-400">String</span>
        </label>
        <label class="flex items-center gap-1 text-xs cursor-pointer">
          <input
            type="checkbox"
            [checked]="filterTypes().includes('number')"
            (change)="toggleFilterType('number', $event)"
            class="rounded"
          />
          <span class="text-purple-600 dark:text-purple-400">Number</span>
        </label>
        <label class="flex items-center gap-1 text-xs cursor-pointer">
          <input
            type="checkbox"
            [checked]="filterTypes().includes('boolean')"
            (change)="toggleFilterType('boolean', $event)"
            class="rounded"
          />
          <span class="text-orange-600 dark:text-orange-400">Boolean</span>
        </label>
        <label class="flex items-center gap-1 text-xs cursor-pointer">
          <input
            type="checkbox"
            [checked]="filterTypes().includes('object')"
            (change)="toggleFilterType('object', $event)"
            class="rounded"
          />
          <span class="text-blue-600 dark:text-blue-400">Object</span>
        </label>
        <label class="flex items-center gap-1 text-xs cursor-pointer">
          <input
            type="checkbox"
            [checked]="filterTypes().includes('array')"
            (change)="toggleFilterType('array', $event)"
            class="rounded"
          />
          <span class="text-blue-600 dark:text-blue-400">Array</span>
        </label>
      </div>
    </div>
  `,
  styles: [],
})
export class JsonSearchComponent {
  resultCount = input<number>(0);
  totalCount = input<number>(0);
  searchQueryChange = output<string>();
  filterTypesChange = output<string[]>();

  protected readonly searchQuery = signal<string>('');
  protected readonly filterTypes = signal<string[]>([]);

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.searchQueryChange.emit(value);
  }

  toggleFilterType(type: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.filterTypes();
    let newTypes: string[];

    if (checked) {
      if (!current.includes(type)) {
        newTypes = [...current, type];
      } else {
        newTypes = current;
      }
    } else {
      newTypes = current.filter((t) => t !== type);
    }

    this.filterTypes.set(newTypes);
    this.filterTypesChange.emit(newTypes);
  }

  clear(): void {
    this.searchQuery.set('');
    this.filterTypes.set([]);
    this.searchQueryChange.emit('');
    this.filterTypesChange.emit([]);
  }
}
