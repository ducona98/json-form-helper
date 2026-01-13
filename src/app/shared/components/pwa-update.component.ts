import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-pwa-update',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (updateAvailable()) {
    <div
      class="fixed top-4 right-4 bg-blue-600 text-white rounded-lg shadow-lg p-4 max-w-sm z-50"
    >
      <div class="flex items-start gap-3">
        <div class="flex-1">
          <h3 class="text-sm font-semibold mb-1">Update Available</h3>
          <p class="text-xs text-blue-100 mb-3">
            A new version of the app is available. Reload to update.
          </p>
          <div class="flex gap-2">
            <button
              (click)="reloadApp()"
              class="px-3 py-1.5 text-xs bg-white text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              Reload
            </button>
            <button
              (click)="dismissUpdate()"
              class="px-3 py-1.5 text-xs bg-blue-700 hover:bg-blue-800 rounded transition-colors"
            >
              Later
            </button>
          </div>
        </div>
        <button
          (click)="dismissUpdate()"
          class="text-blue-200 hover:text-white"
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
export class PwaUpdateComponent {
  protected readonly updateAvailable = signal<boolean>(false);

  constructor(private readonly swUpdate: SwUpdate) {
    if (swUpdate.isEnabled) {
      // Check for updates
      swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          this.updateAvailable.set(true);
        });

      // Check for updates on interval
      setInterval(() => {
        swUpdate.checkForUpdate();
      }, 60000); // Check every minute
    }
  }

  reloadApp(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.activateUpdate().then(() => {
        window.location.reload();
      });
    }
  }

  dismissUpdate(): void {
    this.updateAvailable.set(false);
  }
}
