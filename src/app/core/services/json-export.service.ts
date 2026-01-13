import { Injectable } from '@angular/core';

export type ExportFormat = 'yaml' | 'csv' | 'xml' | 'toml';

@Injectable({
  providedIn: 'root',
})
export class JsonExportService {
  /**
   * Export JSON to specified format
   */
  exportToFormat(json: unknown, format: ExportFormat): string {
    try {
      switch (format) {
        case 'yaml':
          return this.toYaml(json);
        case 'csv':
          return this.toCsv(json);
        case 'xml':
          return this.toXml(json);
        case 'toml':
          return this.toToml(json);
        default:
          return JSON.stringify(json, null, 2);
      }
    } catch (error) {
      throw new Error(
        `Failed to export to ${format}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Download exported content as file
   */
  downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Convert JSON to YAML
   */
  private toYaml(json: unknown, indent = 0): string {
    const indentStr = '  '.repeat(indent);

    if (json === null || json === undefined) {
      return 'null';
    }

    if (typeof json === 'string') {
      // Escape special characters and wrap in quotes if needed
      if (json.includes('\n') || json.includes(':') || json.includes('"') || json.includes("'")) {
        return `"${json.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
      }
      return json;
    }

    if (typeof json === 'number' || typeof json === 'boolean') {
      return String(json);
    }

    if (Array.isArray(json)) {
      if (json.length === 0) {
        return '[]';
      }
      return json.map((item) => `${indentStr}- ${this.toYaml(item, indent + 1)}`).join('\n');
    }

    if (typeof json === 'object') {
      const entries = Object.entries(json);
      if (entries.length === 0) {
        return '{}';
      }
      return entries
        .map(([key, value]) => {
          const escapedKey = this.escapeYamlKey(key);
          if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
            return `${indentStr}${escapedKey}:\n${this.toYaml(value, indent + 1)}`;
          }
          return `${indentStr}${escapedKey}: ${this.toYaml(value, indent + 1)}`;
        })
        .join('\n');
    }

    return String(json);
  }

  private escapeYamlKey(key: string): string {
    // Quote key if it contains special characters
    if (/[:{}\[\]#&*!|>'"%@`]/.test(key) || key.includes(' ')) {
      return `"${key.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    }
    return key;
  }

  /**
   * Convert JSON to CSV
   */
  private toCsv(json: unknown): string {
    if (!Array.isArray(json)) {
      // If not an array, wrap it
      return this.toCsv([json]);
    }

    if (json.length === 0) {
      return '';
    }

    // Get all unique keys from all objects
    const allKeys = new Set<string>();
    json.forEach((item) => {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        Object.keys(item).forEach((key) => allKeys.add(key));
      }
    });

    const keys = Array.from(allKeys);
    if (keys.length === 0) {
      return '';
    }

    // Header row
    const header = keys.map((key) => this.escapeCsvValue(key)).join(',');
    const rows: string[] = [header];

    // Data rows
    json.forEach((item) => {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        const values = keys.map((key) => {
          const value = (item as Record<string, unknown>)[key];
          return this.escapeCsvValue(this.formatCsvValue(value));
        });
        rows.push(values.join(','));
      } else {
        // For non-object items, put the whole value in first column
        const values = [this.escapeCsvValue(this.formatCsvValue(item))];
        while (values.length < keys.length) {
          values.push('');
        }
        rows.push(values.join(','));
      }
    });

    return rows.join('\n');
  }

  private escapeCsvValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private formatCsvValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  /**
   * Convert JSON to XML
   */
  private toXml(json: unknown, rootName = 'root'): string {
    const xml = this.toXmlRecursive(json, rootName, 0);
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + xml;
  }

  private toXmlRecursive(json: unknown, tagName: string, indent: number): string {
    const indentStr = '  '.repeat(indent);
    const escapedTagName = this.escapeXmlTag(tagName);

    if (json === null || json === undefined) {
      return `${indentStr}<${escapedTagName} />`;
    }

    if (typeof json === 'string') {
      return `${indentStr}<${escapedTagName}>${this.escapeXmlText(json)}</${escapedTagName}>`;
    }

    if (typeof json === 'number' || typeof json === 'boolean') {
      return `${indentStr}<${escapedTagName}>${String(json)}</${escapedTagName}>`;
    }

    if (Array.isArray(json)) {
      if (json.length === 0) {
        return `${indentStr}<${escapedTagName} />`;
      }
      const items = json
        .map((item, index) => this.toXmlRecursive(item, 'item', indent + 1))
        .join('\n');
      return `${indentStr}<${escapedTagName}>\n${items}\n${indentStr}</${escapedTagName}>`;
    }

    if (typeof json === 'object') {
      const entries = Object.entries(json);
      if (entries.length === 0) {
        return `${indentStr}<${escapedTagName} />`;
      }
      const children = entries
        .map(([key, value]) => this.toXmlRecursive(value, key, indent + 1))
        .join('\n');
      return `${indentStr}<${escapedTagName}>\n${children}\n${indentStr}</${escapedTagName}>`;
    }

    return `${indentStr}<${escapedTagName}>${this.escapeXmlText(String(json))}</${escapedTagName}>`;
  }

  private escapeXmlTag(tag: string): string {
    // XML tag names must start with letter or underscore
    if (!/^[a-zA-Z_]/.test(tag)) {
      tag = '_' + tag;
    }
    // Replace invalid characters
    return tag.replace(/[^a-zA-Z0-9_\-:.]/g, '_');
  }

  private escapeXmlText(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Convert JSON to TOML
   */
  private toToml(json: unknown, prefix = ''): string {
    if (json === null || json === undefined) {
      return 'null';
    }

    if (typeof json === 'string') {
      // Use single quotes for simple strings, triple quotes for multiline
      if (json.includes('\n')) {
        return `"""${json.replace(/\\/g, '\\\\').replace(/"""/g, '\\"""')}"""`;
      }
      if (json.includes("'") || json.includes('"') || json.includes('\\')) {
        return `"${json.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
      }
      return `"${json}"`;
    }

    if (typeof json === 'number' || typeof json === 'boolean') {
      return String(json);
    }

    if (Array.isArray(json)) {
      if (json.length === 0) {
        return '[]';
      }
      // Check if array contains only primitives
      const isPrimitiveArray = json.every((item) => item === null || typeof item !== 'object');
      if (isPrimitiveArray) {
        return `[${json.map((item) => this.toToml(item, prefix)).join(', ')}]`;
      }
      // Array of objects/arrays - use array of tables syntax
      return json
        .map((item, index) => {
          const itemPrefix = prefix ? `${prefix}[${index}]` : `[${index}]`;
          return `[[${itemPrefix}]]\n${this.toToml(item, itemPrefix)}`;
        })
        .join('\n\n');
    }

    if (typeof json === 'object') {
      const entries = Object.entries(json);
      if (entries.length === 0) {
        return '{}';
      }

      const lines: string[] = [];
      entries.forEach(([key, value]) => {
        const escapedKey = this.escapeTomlKey(key);
        const fullKey = prefix ? `${prefix}.${escapedKey}` : escapedKey;

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Nested object - create table
          lines.push(`[${fullKey}]`);
          const nested = this.toToml(value, fullKey);
          if (nested) {
            lines.push(nested);
          }
        } else if (
          Array.isArray(value) &&
          value.length > 0 &&
          typeof value[0] === 'object' &&
          value[0] !== null
        ) {
          // Array of tables
          value.forEach((item, index) => {
            lines.push(`[[${fullKey}]]`);
            const nested = this.toToml(item, `${fullKey}[${index}]`);
            if (nested) {
              lines.push(nested);
            }
          });
        } else {
          // Simple key-value
          lines.push(`${escapedKey} = ${this.toToml(value, fullKey)}`);
        }
      });

      return lines.join('\n');
    }

    return String(json);
  }

  private escapeTomlKey(key: string): string {
    // Quote key if it contains special characters or starts with number
    if (/^[0-9]/.test(key) || /[^a-zA-Z0-9_\-]/.test(key)) {
      return `"${key.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    }
    return key;
  }

  /**
   * Get file extension for format
   */
  getFileExtension(format: ExportFormat): string {
    switch (format) {
      case 'yaml':
        return 'yml';
      case 'csv':
        return 'csv';
      case 'xml':
        return 'xml';
      case 'toml':
        return 'toml';
      default:
        return 'txt';
    }
  }

  /**
   * Get MIME type for format
   */
  getMimeType(format: ExportFormat): string {
    switch (format) {
      case 'yaml':
        return 'text/yaml';
      case 'csv':
        return 'text/csv';
      case 'xml':
        return 'application/xml';
      case 'toml':
        return 'text/toml';
      default:
        return 'text/plain';
    }
  }
}
