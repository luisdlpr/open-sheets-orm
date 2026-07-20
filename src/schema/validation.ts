/**
 * @file Schema definition validation logic.
 * @module open-sheets-orm/schema
 */

import { FieldBuilder } from './FieldBuilder';
import { SchemaValidationError } from './errors';
import type { SupportedFieldType } from './types';

function isValidDefaultForType(
  value: unknown,
  type: SupportedFieldType,
): boolean {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number';
    case 'boolean':
      return typeof value === 'boolean';
    case 'date':
      return value instanceof Date || typeof value === 'string';
    case 'json':
      return (
        value === null ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        Array.isArray(value) ||
        (typeof value === 'object' && value.constructor === Object)
      );
  }
}

function expectedTypeLabel(type: SupportedFieldType): string {
  return type === 'date' ? 'a Date object or ISO string' : `a ${type}`;
}

/**
 * Validates a schema definition and throws on any violation.
 *
 * @param definitions - Raw model definitions from user code.
 * @throws {SchemaValidationError} When a validation rule is violated.
 */
export function validateSchema(
  definitions: Record<string, Record<string, FieldBuilder>>,
): void {
  for (const [modelName, fieldBuilders] of Object.entries(definitions)) {
    if (!modelName || typeof modelName !== 'string') {
      throw new SchemaValidationError('Model name must be a non-empty string');
    }

    const fieldNames = Object.keys(fieldBuilders);

    if (fieldNames.length === 0) {
      throw new SchemaValidationError(
        `Model "${modelName}" must have at least one field`,
      );
    }

    let primaryKeyCount = 0;

    for (const fieldName of fieldNames) {
      if (!fieldName || typeof fieldName !== 'string') {
        throw new SchemaValidationError(
          `Field name must be a non-empty string in model "${modelName}"`,
        );
      }

      const fieldMeta = fieldBuilders[fieldName].build();

      if (fieldMeta.primaryKey) {
        primaryKeyCount++;
      }

      if (fieldMeta.defaultValue !== undefined) {
        if (!isValidDefaultForType(fieldMeta.defaultValue, fieldMeta.type)) {
          throw new SchemaValidationError(
            `Field "${fieldName}" in model "${modelName}": default value must be ${expectedTypeLabel(fieldMeta.type)}`,
          );
        }
      }
    }

    if (primaryKeyCount > 1) {
      throw new SchemaValidationError(
        `Model "${modelName}" has multiple primary keys`,
      );
    }
  }
}
