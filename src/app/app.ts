import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header.component';
import { OfflineIndicatorComponent } from './shared/components/offline-indicator.component';
import { PwaInstallComponent } from './shared/components/pwa-install.component';
import { PwaUpdateComponent } from './shared/components/pwa-update.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    PwaInstallComponent,
    PwaUpdateComponent,
    OfflineIndicatorComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
