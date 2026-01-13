import { Injectable, signal } from '@angular/core';

export interface JsonHistoryItem {
  id: string;
  json: string;
  timestamp: number;
  preview: string; // First 100 chars for preview
}

const STORAGE_KEY = 'json-form-helper-history';
const MAX_HISTORY_ITEMS = 50; // Limit to prevent localStorage overflow

@Injectable({
  providedIn: 'root',
})
export class JsonHistoryService {
  private readonly history = signal<JsonHistoryItem[]>([]);

  constructor() {
    this.loadHistory();
  }

  /**
   * Get all history items (sorted by timestamp, newest first)
   */
  getHistory(): JsonHistoryItem[] {
    return [...this.history()].sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Save JSON to history
   */
  saveToHistory(json: string): void {
    if (!json || json.trim() === '') {
      return;
    }

    // Validate JSON before saving
    try {
      JSON.parse(json);
    } catch {
      return; // Don't save invalid JSON
    }

    const items = this.history();
    const id = this.generateId();
    const preview = this.getPreview(json);

    // Check if this JSON already exists (avoid duplicates)
    const existingIndex = items.findIndex((item) => item.json === json);
    if (existingIndex !== -1) {
      // Update timestamp of existing item
      const existing = items[existingIndex];
      items.splice(existingIndex, 1);
      items.push({
        ...existing,
        timestamp: Date.now(),
      });
    } else {
      // Add new item
      items.push({
        id,
        json,
        timestamp: Date.now(),
        preview,
      });
    }

    // Limit history size
    if (items.length > MAX_HISTORY_ITEMS) {
      // Remove oldest items
      items.sort((a, b) => b.timestamp - a.timestamp);
      items.splice(MAX_HISTORY_ITEMS);
    }

    this.history.set(items);
    this.saveToStorage();
  }

  /**
   * Get JSON by ID
   */
  getJsonById(id: string): string | null {
    const item = this.history().find((item) => item.id === id);
    return item ? item.json : null;
  }

  /**
   * Delete history item by ID
   */
  deleteHistoryItem(id: string): void {
    const items = this.history().filter((item) => item.id !== id);
    this.history.set(items);
    this.saveToStorage();
  }

  /**
   * Clear all history
   */
  clearHistory(): void {
    this.history.set([]);
    this.saveToStorage();
  }

  /**
   * Get history count
   */
  getHistoryCount(): number {
    return this.history().length;
  }

  private loadHistory(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items: JsonHistoryItem[] = JSON.parse(stored);
        // Validate and filter out invalid items
        const validItems = items.filter(
          (item) =>
            item.id &&
            item.json &&
            item.timestamp &&
            typeof item.timestamp === 'number'
        );
        this.history.set(validItems);
      }
    } catch (error) {
      console.error('Failed to load history from localStorage:', error);
      this.history.set([]);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history()));
    } catch (error) {
      console.error('Failed to save history to localStorage:', error);
      // If storage is full, try to remove oldest items
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        const items = this.history();
        if (items.length > 10) {
          items.sort((a, b) => b.timestamp - a.timestamp);
          items.splice(10);
          this.history.set(items);
          this.saveToStorage();
        }
      }
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private getPreview(json: string): string {
    const trimmed = json.trim();
    if (trimmed.length <= 100) {
      return trimmed;
    }
    return trimmed.substring(0, 100) + '...';
  }
}
