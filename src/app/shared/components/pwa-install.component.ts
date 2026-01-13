import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Component({
  selector: 'app-pwa-install',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (showInstallPrompt()) {
    <div
      class="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm z-50"
    >
      <div class="flex items-start gap-3">
        <div class="flex-1">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            Install JSON Helper
          </h3>
          <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Install this app on your device for quick access and offline use.
          </p>
          <div class="flex gap-2">
            <button
              (click)="installPwa()"
              class="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Install
            </button>
            <button
              (click)="dismissInstallPrompt()"
              class="px-3 py-1.5 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
        <button
          (click)="dismissInstallPrompt()"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
    }
  `,
  styles: [],
})
export class PwaInstallComponent {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  protected readonly showInstallPrompt = signal<boolean>(false);
  protected readonly isInstalled = signal<boolean>(false);

  constructor() {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled.set(true);
    }

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      // Only show prompt if not already installed and not dismissed
      if (!this.isInstalled() && !this.isPromptDismissed()) {
        this.showInstallPrompt.set(true);
      }
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      this.isInstalled.set(true);
      this.showInstallPrompt.set(false);
      this.deferredPrompt = null;
    });

    // Check on load if prompt should be shown
    if (this.deferredPrompt && !this.isInstalled() && !this.isPromptDismissed()) {
      // Delay showing prompt slightly for better UX
      setTimeout(() => {
        if (this.deferredPrompt && !this.isInstalled()) {
          this.showInstallPrompt.set(true);
        }
      }, 3000);
    }
  }

  protected readonly canInstall = computed(() => {
    return this.deferredPrompt !== null && !this.isInstalled();
  });

  async installPwa(): Promise<void> {
    if (!this.deferredPrompt) {
      return;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        this.showInstallPrompt.set(false);
        this.deferredPrompt = null;
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  }

  dismissInstallPrompt(): void {
    this.showInstallPrompt.set(false);
    this.setPromptDismissed(true);
  }

  private isPromptDismissed(): boolean {
    return localStorage.getItem('pwa-install-dismissed') === 'true';
  }

  private setPromptDismissed(dismissed: boolean): void {
    if (dismissed) {
      localStorage.setItem('pwa-install-dismissed', 'true');
    } else {
      localStorage.removeItem('pwa-install-dismissed');
    }
  }
}
