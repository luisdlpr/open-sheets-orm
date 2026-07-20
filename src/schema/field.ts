/**
 * @file Public factory for creating field builders.
 * @module open-sheets-orm/schema
 */

import { FieldBuilder } from './FieldBuilder';

export const field = {
  string: () => new FieldBuilder('string'),
  number: () => new FieldBuilder('number'),
  boolean: () => new FieldBuilder('boolean'),
  date: () => new FieldBuilder('date'),
  json: () => new FieldBuilder('json'),
};
