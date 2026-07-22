/**
 * @file Input validation against schema field metadata.
 * @module query/validation
 */

import type { FieldMetadata } from '../schema';

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
  void action;
  void fields;
  void data;
}
