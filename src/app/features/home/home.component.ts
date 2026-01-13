import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonEditorComponent } from '../json-editor/json-editor.component';
import { JsonViewerComponent } from '../json-viewer/json-viewer.component';
import { FormGeneratorComponent } from '../form-generator/form-generator.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, JsonEditorComponent, JsonViewerComponent, FormGeneratorComponent],
  template: `
    <main class="min-h-[calc(100vh-80px)] flex flex-col">
      <!-- JSON Input and Viewer Side by Side -->
      <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div
          class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900"
        >
          <app-json-editor [(jsonInput)]="jsonInput" />
        </div>
        <div
          class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900"
        >
          <app-json-viewer [jsonInput]="jsonInput()" />
        </div>
      </div>

      <!-- Generated Form (Optional) -->
      <div class="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <app-form-generator [jsonInput]="jsonInput()" (jsonOutput)="jsonInput.set($event)" />
      </div>
    </main>
  `,
  styles: [],
})
export class HomeComponent {
  protected readonly jsonInput = signal<string>('');
}
