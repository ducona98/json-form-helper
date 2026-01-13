import { Injectable } from '@angular/core';

export interface ValidationError {
  path: string;
  message: string;
  schemaPath?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

@Injectable({
  providedIn: 'root',
})
export class JsonSchemaService {
  /**
   * Validate JSON data against JSON Schema
   */
  validate(data: unknown, schema: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate schema itself first
    const schemaValidation = this.validateSchema(schema);
    if (!schemaValidation.valid) {
      return {
        valid: false,
        errors: [
          {
            path: '/',
            message: `Invalid JSON Schema: ${
              schemaValidation.errors[0]?.message || 'Unknown error'
            }`,
          },
        ],
      };
    }

    // Validate data against schema
    this.validateValue(data, schema as Record<string, unknown>, '', errors);

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate that the schema itself is valid
   */
  private validateSchema(schema: unknown): ValidationResult {
    if (typeof schema !== 'object' || schema === null) {
      return {
        valid: false,
        errors: [{ path: '/', message: 'Schema must be an object' }],
      };
    }

    const schemaObj = schema as Record<string, unknown>;
    if (schemaObj['type'] && !this.isValidType(schemaObj['type'])) {
      return {
        valid: false,
        errors: [{ path: '/type', message: `Invalid type: ${schemaObj['type']}` }],
      };
    }

    return { valid: true, errors: [] };
  }

  /**
   * Validate a value against a schema
   */
  private validateValue(
    value: unknown,
    schema: Record<string, unknown>,
    path: string,
    errors: ValidationError[]
  ): void {
    // Handle $ref (basic support)
    if (schema['$ref']) {
      // For now, skip $ref validation (would need schema resolution)
      return;
    }

    // Handle type validation
    if (schema['type']) {
      const type = Array.isArray(schema['type']) ? schema['type'] : [schema['type']];
      const valueType = this.getJsonType(value);
      if (!type.includes(valueType)) {
        errors.push({
          path: path || '/',
          message: `Expected type ${type.join(' or ')}, got ${valueType}`,
          schemaPath: '/type',
        });
        return; // Don't continue validation if type is wrong
      }
    }

    // Handle object validation
    if (this.getJsonType(value) === 'object' && typeof value === 'object' && value !== null) {
      this.validateObject(value as Record<string, unknown>, schema, path, errors);
    }

    // Handle array validation
    if (Array.isArray(value)) {
      this.validateArray(value, schema, path, errors);
    }

    // Handle string constraints
    if (this.getJsonType(value) === 'string' && typeof value === 'string') {
      this.validateString(value, schema, path, errors);
    }

    // Handle number constraints
    if (this.getJsonType(value) === 'number' && typeof value === 'number') {
      this.validateNumber(value, schema, path, errors);
    }

    // Handle enum
    if (schema['enum']) {
      const enumValues = schema['enum'] as unknown[];
      if (!enumValues.includes(value)) {
        errors.push({
          path: path || '/',
          message: `Value must be one of: ${enumValues.map((v) => JSON.stringify(v)).join(', ')}`,
          schemaPath: '/enum',
        });
      }
    }

    // Handle const
    if (schema['const'] !== undefined && value !== schema['const']) {
      errors.push({
        path: path || '/',
        message: `Value must be ${JSON.stringify(schema['const'])}`,
        schemaPath: '/const',
      });
    }
  }

  /**
   * Validate an object
   */
  private validateObject(
    obj: Record<string, unknown>,
    schema: Record<string, unknown>,
    path: string,
    errors: ValidationError[]
  ): void {
    const properties = (schema['properties'] as Record<string, unknown>) || {};
    const required = (schema['required'] as string[]) || [];
    const additionalProperties = schema['additionalProperties'] !== false;

    // Check required properties
    for (const key of required) {
      if (!(key in obj)) {
        errors.push({
          path: this.joinPath(path, key),
          message: `Required property "${key}" is missing`,
          schemaPath: '/required',
        });
      }
    }

    // Validate each property
    for (const [key, value] of Object.entries(obj)) {
      const propPath = this.joinPath(path, key);
      if (key in properties) {
        // Validate against property schema
        this.validateValue(value, properties[key] as Record<string, unknown>, propPath, errors);
      } else if (!additionalProperties) {
        // Additional properties not allowed
        errors.push({
          path: propPath,
          message: `Additional property "${key}" is not allowed`,
          schemaPath: '/additionalProperties',
        });
      }
    }
  }

  /**
   * Validate an array
   */
  private validateArray(
    arr: unknown[],
    schema: Record<string, unknown>,
    path: string,
    errors: ValidationError[]
  ): void {
    const items = schema['items'] as
      | Record<string, unknown>
      | Record<string, unknown>[]
      | undefined;
    const minItems = (schema['minItems'] as number) ?? undefined;
    const maxItems = (schema['maxItems'] as number) ?? undefined;

    // Check minItems
    if (minItems !== undefined && arr.length < minItems) {
      errors.push({
        path: path || '/',
        message: `Array must have at least ${minItems} items, got ${arr.length}`,
        schemaPath: '/minItems',
      });
    }

    // Check maxItems
    if (maxItems !== undefined && arr.length > maxItems) {
      errors.push({
        path: path || '/',
        message: `Array must have at most ${maxItems} items, got ${arr.length}`,
        schemaPath: '/maxItems',
      });
    }

    // Validate items
    if (items) {
      if (Array.isArray(items)) {
        // Tuple validation
        arr.forEach((item, index) => {
          if (index < items.length) {
            this.validateValue(
              item,
              items[index] as Record<string, unknown>,
              `${path}[${index}]`,
              errors
            );
          }
        });
      } else {
        // All items must match schema
        arr.forEach((item, index) => {
          this.validateValue(item, items as Record<string, unknown>, `${path}[${index}]`, errors);
        });
      }
    }
  }

  /**
   * Validate string constraints
   */
  private validateString(
    str: string,
    schema: Record<string, unknown>,
    path: string,
    errors: ValidationError[]
  ): void {
    const minLength = (schema['minLength'] as number) ?? undefined;
    const maxLength = (schema['maxLength'] as number) ?? undefined;
    const pattern = schema['pattern'] as string | undefined;
    const format = schema['format'] as string | undefined;

    if (minLength !== undefined && str.length < minLength) {
      errors.push({
        path: path || '/',
        message: `String must be at least ${minLength} characters long, got ${str.length}`,
        schemaPath: '/minLength',
      });
    }

    if (maxLength !== undefined && str.length > maxLength) {
      errors.push({
        path: path || '/',
        message: `String must be at most ${maxLength} characters long, got ${str.length}`,
        schemaPath: '/maxLength',
      });
    }

    if (pattern) {
      try {
        const regex = new RegExp(pattern);
        if (!regex.test(str)) {
          errors.push({
            path: path || '/',
            message: `String must match pattern: ${pattern}`,
            schemaPath: '/pattern',
          });
        }
      } catch (e) {
        errors.push({
          path: path || '/',
          message: `Invalid regex pattern: ${pattern}`,
          schemaPath: '/pattern',
        });
      }
    }

    if (format) {
      const formatValid = this.validateFormat(str, format);
      if (!formatValid) {
        errors.push({
          path: path || '/',
          message: `String must be a valid ${format}`,
          schemaPath: '/format',
        });
      }
    }
  }

  /**
   * Validate number constraints
   */
  private validateNumber(
    num: number,
    schema: Record<string, unknown>,
    path: string,
    errors: ValidationError[]
  ): void {
    const minimum = schema['minimum'] as number | undefined;
    const maximum = schema['maximum'] as number | undefined;
    const exclusiveMinimum = schema['exclusiveMinimum'] as number | undefined;
    const exclusiveMaximum = schema['exclusiveMaximum'] as number | undefined;
    const multipleOf = schema['multipleOf'] as number | undefined;

    if (minimum !== undefined && num < minimum) {
      errors.push({
        path: path || '/',
        message: `Number must be >= ${minimum}, got ${num}`,
        schemaPath: '/minimum',
      });
    }

    if (maximum !== undefined && num > maximum) {
      errors.push({
        path: path || '/',
        message: `Number must be <= ${maximum}, got ${num}`,
        schemaPath: '/maximum',
      });
    }

    if (exclusiveMinimum !== undefined && num <= exclusiveMinimum) {
      errors.push({
        path: path || '/',
        message: `Number must be > ${exclusiveMinimum}, got ${num}`,
        schemaPath: '/exclusiveMinimum',
      });
    }

    if (exclusiveMaximum !== undefined && num >= exclusiveMaximum) {
      errors.push({
        path: path || '/',
        message: `Number must be < ${exclusiveMaximum}, got ${num}`,
        schemaPath: '/exclusiveMaximum',
      });
    }

    if (multipleOf !== undefined && num % multipleOf !== 0) {
      errors.push({
        path: path || '/',
        message: `Number must be a multiple of ${multipleOf}, got ${num}`,
        schemaPath: '/multipleOf',
      });
    }
  }

  /**
   * Validate format (basic support)
   */
  private validateFormat(value: string, format: string): boolean {
    switch (format) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'uri':
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      case 'date':
        return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value));
      case 'date-time':
        return !isNaN(Date.parse(value));
      case 'ipv4':
        return /^(\d{1,3}\.){3}\d{1,3}$/.test(value);
      case 'ipv6':
        return /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(value);
      default:
        return true; // Unknown formats pass
    }
  }

  /**
   * Get JSON type of a value
   */
  private getJsonType(value: unknown): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }

  /**
   * Check if type is valid
   */
  private isValidType(type: unknown): boolean {
    const validTypes = ['string', 'number', 'integer', 'boolean', 'null', 'object', 'array'];
    if (typeof type === 'string') {
      return validTypes.includes(type);
    }
    if (Array.isArray(type)) {
      return type.every((t) => typeof t === 'string' && validTypes.includes(t));
    }
    return false;
  }

  /**
   * Join path segments
   */
  private joinPath(base: string, segment: string): string {
    if (!base || base === '/') {
      return `/${segment}`;
    }
    return `${base}/${segment}`;
  }
}
