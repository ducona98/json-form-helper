import { CommonModule } from '@angular/common';
import { Component, computed, input, signal, viewChild } from '@angular/core';
import { JsonNode, JsonNodeComponent } from './json-node.component';
import { JsonSearchComponent } from './json-search.component';

@Component({
  selector: 'app-json-viewer',
  standalone: true,
  imports: [CommonModule, JsonNodeComponent, JsonSearchComponent],
  template: `
    <div class="h-full flex flex-col max-h-[50vh]">
      <div
        class="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
      >
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">JSON Viewer</h2>
          @if (treeNodes().length > 0) {
          <button
            (click)="searchComponent()?.clear()"
            class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
            title="Clear search"
          >
            ✕ Clear
          </button>
          }
        </div>
        @if (treeNodes().length > 0) {
        <app-json-search
          [resultCount]="filteredNodes().length"
          [totalCount]="treeNodes().length"
          (searchQueryChange)="onSearchChange($event)"
          (filterTypesChange)="onFilterTypesChange($event)"
        />
        }
      </div>
      <div class="flex-1 overflow-auto p-4">
        @if (error()) {
        <div class="text-red-600 dark:text-red-400 text-sm">
          {{ error() }}
        </div>
        } @else if (jsonData()) {
        <div class="font-mono text-sm">
          @if (filteredNodes().length === 0 && (searchQuery() || filterTypes().length > 0)) {
          <div class="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">
            No results found
          </div>
          } @else { @for (node of filteredNodes(); track node.path) {
          <app-json-node
            [node]="node"
            [level]="0"
            [searchQuery]="searchQuery()"
            [shouldExpand]="shouldExpandNode(node)"
          />
          } }
        </div>
        } @else {
        <div class="text-gray-500 dark:text-gray-400 text-sm">
          Enter JSON in the editor to view it here
        </div>
        }
      </div>
    </div>
  `,
  styles: [],
})
export class JsonViewerComponent {
  jsonInput = input<string>('');
  protected readonly searchQuery = signal<string>('');
  protected readonly filterTypes = signal<string[]>([]);
  protected readonly searchComponent = viewChild(JsonSearchComponent);

  protected readonly jsonData = computed(() => {
    if (!this.jsonInput() || this.jsonInput().trim() === '') {
      return null;
    }
    try {
      return JSON.parse(this.jsonInput());
    } catch (e) {
      return null;
    }
  });

  protected readonly error = computed(() => {
    if (!this.jsonInput() || this.jsonInput().trim() === '') {
      return null;
    }
    try {
      JSON.parse(this.jsonInput());
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : 'Invalid JSON';
    }
  });

  protected readonly treeNodes = computed((): JsonNode[] => {
    const data = this.jsonData();
    if (!data) return [];
    return this.buildTree(data, '');
  });

  protected readonly filteredNodes = computed((): JsonNode[] => {
    const nodes = this.treeNodes();
    const query = this.searchQuery().toLowerCase().trim();
    const types = this.filterTypes();

    if (!query && types.length === 0) {
      return nodes;
    }

    return this.filterNodes(nodes, query, types);
  });

  private filterNodes(nodes: JsonNode[], query: string, types: string[]): JsonNode[] {
    const filtered: JsonNode[] = [];

    for (const node of nodes) {
      const matchesSearch = !query || this.nodeMatchesQuery(node, query);
      const matchesType = types.length === 0 || types.includes(node.type);

      if (node.type === 'object' || node.type === 'array') {
        // For objects/arrays, check children
        const childNodes = this.getChildNodes(node);
        const filteredChildren = this.filterNodes(childNodes, query, types);

        // Include parent if it matches or has matching children
        if (matchesSearch && matchesType) {
          filtered.push({
            ...node,
            expanded: filteredChildren.length > 0 || query.length > 0,
          });
        } else if (filteredChildren.length > 0) {
          // Include parent if children match
          filtered.push({
            ...node,
            expanded: true,
          });
        }
      } else {
        // For primitives, include if matches
        if (matchesSearch && matchesType) {
          filtered.push(node);
        }
      }
    }

    return filtered;
  }

  private nodeMatchesQuery(node: JsonNode, query: string): boolean {
    // Search in key
    if (node.key.toLowerCase().includes(query)) {
      return true;
    }

    // Search in path
    if (node.path.toLowerCase().includes(query)) {
      return true;
    }

    // Search in value (for primitives)
    if (node.type !== 'object' && node.type !== 'array') {
      const valueStr = String(node.value).toLowerCase();
      if (valueStr.includes(query)) {
        return true;
      }
    }

    // Recursively search in children
    if (node.type === 'object' || node.type === 'array') {
      const childNodes = this.getChildNodes(node);
      return childNodes.some((child) => this.nodeMatchesQuery(child, query));
    }

    return false;
  }

  private getChildNodes(node: JsonNode): JsonNode[] {
    if (node.type === 'array' && Array.isArray(node.value)) {
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

    if (node.type === 'object' && typeof node.value === 'object' && node.value !== null) {
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
    }

    return [];
  }

  shouldExpandNode(node: JsonNode): boolean {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return false;

    // Auto-expand if node or its children match search
    return this.nodeMatchesQuery(node, query);
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  onFilterTypesChange(types: string[]): void {
    this.filterTypes.set(types);
  }

  private buildTree(data: any, path: string): JsonNode[] {
    if (data === null) {
      return [{ key: '', value: null, type: 'null', path }];
    }

    if (Array.isArray(data)) {
      return data.map((item, index) => {
        const itemPath = path ? `${path}[${index}]` : `[${index}]`;
        if (typeof item === 'object' && item !== null) {
          return {
            key: `[${index}]`,
            value: item,
            type: Array.isArray(item) ? 'array' : 'object',
            expanded: false,
            path: itemPath,
          };
        }
        return {
          key: `[${index}]`,
          value: item,
          type: this.getType(item),
          path: itemPath,
        };
      });
    }

    if (typeof data === 'object') {
      return Object.keys(data).map((key) => {
        const value = data[key];
        const itemPath = path ? `${path}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
          return {
            key,
            value,
            type: Array.isArray(value) ? 'array' : 'object',
            expanded: false,
            path: itemPath,
          };
        }
        return {
          key,
          value,
          type: this.getType(value),
          path: itemPath,
        };
      });
    }

    return [{ key: '', value: data, type: this.getType(data), path }];
  }

  private getType(value: any): 'string' | 'number' | 'boolean' | 'null' {
    if (value === null) return 'null';
    return typeof value as 'string' | 'number' | 'boolean';
  }
}
