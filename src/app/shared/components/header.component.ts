import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          <a routerLink="/" class="hover:opacity-80 transition-opacity">JSON / Form Helper</a>
        </h1>
        <div class="flex items-center gap-2">
          <a
            routerLink="/"
            routerLinkActive="bg-blue-700"
            [routerLinkActiveOptions]="{ exact: true }"
            class="px-3 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
            title="Home"
          >
            🏠 Home
          </a>
          <a
            routerLink="/diff"
            routerLinkActive="bg-blue-700"
            class="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            title="JSON Diff tool"
          >
            🔍 Diff
          </a>
          <a
            routerLink="/schema"
            routerLinkActive="bg-blue-700"
            class="px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
            title="JSON Schema Validation"
          >
            📋 Schema
          </a>
          <button
            (click)="toggleTheme()"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            [attr.aria-label]="isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            @if (isDarkMode()) {
            <svg
              class="w-6 h-6 text-gray-900 dark:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            } @else {
            <svg
              class="w-6 h-6 text-gray-900 dark:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
            }
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class HeaderComponent {
  protected readonly isDarkMode = signal(false);

  constructor(private readonly router: Router) {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    if (
      savedTheme === 'dark' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      this.isDarkMode.set(true);
      document.documentElement.classList.add('dark');
    }
  }

  toggleTheme(): void {
    this.isDarkMode.update((mode) => !mode);
    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
}
