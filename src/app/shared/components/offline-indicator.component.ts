import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOffline()) {
    <div
      class="fixed top-0 left-0 right-0 bg-yellow-500 text-yellow-900 text-center py-2 px-4 z-50"
    >
      <p class="text-xs font-medium">
        ⚠️ You are currently offline. Some features may be limited.
      </p>
    </div>
    }
  `,
  styles: [],
})
export class OfflineIndicatorComponent {
  protected readonly isOffline = signal<boolean>(!navigator.onLine);

  constructor() {
    // Initial check
    this.isOffline.set(!navigator.onLine);

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOffline.set(false);
    });

    window.addEventListener('offline', () => {
      this.isOffline.set(true);
    });
  }
}
