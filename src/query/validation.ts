/**
 * @file Input validation against schema field metadata.
 * @module query/validation
 */

import type { FieldMetadata, SupportedFieldType } from '../schema';
import { ValidationError } from './errors';

/**
 * Validates input data against the model's field metadata.
 *
 * For `create` actions all required fields must be present and every
 * provided value must match its declared type. For `update` actions
 * only the provided fields are checked — missing fields are allowed.
 *
 * @param action - Whether this is a `create` or `update` operation.
 * @param fields - The field metadata map from the model.
 * @param data - The input data to validate.
 * @throws {ValidationError} When validation fails.
 */
export function validateInput(
  action: 'create' | 'update',
  fields: Record<string, FieldMetadata>,
  data: Record<string, unknown>,
): void {
  for (const [fieldName, metadata] of Object.entries(fields)) {
    const value = data[fieldName];
    const isPresent = value !== undefined;

    if (
      action === 'create' &&
      !isPresent &&
      !metadata.optional &&
      metadata.defaultValue === undefined
    ) {
      throw new ValidationError(`Field "${fieldName}" is required`);
    }

    if (isPresent) {
      assertValidType(fieldName, metadata.type, value);
    }
  }
}

function assertValidType(
  fieldName: string,
  type: SupportedFieldType,
  value: unknown,
): void {
  switch (type) {
    case 'string':
      if (typeof value !== 'string') {
        throw new ValidationError(
          `Field "${fieldName}" expected string, received ${typeof value}`,
        );
      }
      break;
    case 'number':
      if (typeof value !== 'number' || Number.isNaN(value)) {
        throw new ValidationError(
          `Field "${fieldName}" expected number, received ${typeof value}`,
        );
      }
      break;
    case 'boolean':
      if (typeof value !== 'boolean') {
        throw new ValidationError(
          `Field "${fieldName}" expected boolean, received ${typeof value}`,
        );
      }
      break;
    case 'date':
      if (
        !(value instanceof Date) &&
        !(typeof value === 'string' && Number.isFinite(Date.parse(value)))
      ) {
        throw new ValidationError(
          `Field "${fieldName}" expected date, received ${typeof value}`,
        );
      }
      break;
    case 'json':
      break;
  }
}
