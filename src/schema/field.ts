/**
 * @file Public factory for creating field builders.
 * @module open-sheets-orm/schema
 *
 * @example
 * ```ts
 * field.string().primaryKey()
 * field.number().optional().default(0)
 * field.boolean().default(false)
 * field.date()
 * field.json().optional().default([])
 * ```
 */

import { FieldBuilder } from './FieldBuilder';

export const field = {
  string: () => new FieldBuilder('string'),
  number: () => new FieldBuilder('number'),
  boolean: () => new FieldBuilder('boolean'),
  date: () => new FieldBuilder('date'),
  json: () => new FieldBuilder('json'),
};
