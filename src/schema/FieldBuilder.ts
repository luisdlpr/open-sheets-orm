/**
 * @file Fluent builder for defining field properties.
 * @module open-sheets-orm/schema
 */

import type { FieldMetadata, SupportedFieldType } from './types';

/**
 * Fluent builder for defining a single field's properties.
 *
 * Consumers should use the `field` factory object rather than
 * instantiating this class directly.
 *
 * @example
 * ```ts
 * field.string().primaryKey().unique().default('hello').build()
 * // → { type: 'string', primaryKey: true, unique: true, optional: false, defaultValue: 'hello' }
 * ```
 */
export class FieldBuilder {
  private _type: SupportedFieldType;
  private _primaryKey = false;
  private _unique = false;
  private _optional = false;
  private _defaultValue?: unknown;

  constructor(type: SupportedFieldType) {
    this._type = type;
  }

  primaryKey(): this {
    this._primaryKey = true;
    return this;
  }

  unique(): this {
    this._unique = true;
    return this;
  }

  optional(): this {
    this._optional = true;
    return this;
  }

  /**
   * Sets a default value for the field.
   *
   * @param value - The default value. Its type must match the field type
   *   (validated by `validateSchema` at compile time).
   */
  default(value: unknown): this {
    this._defaultValue = value;
    return this;
  }

  /**
   * Compiles the builder into a plain metadata object.
   *
   * @returns The field metadata.
   */
  build(): FieldMetadata {
    const meta: FieldMetadata = {
      type: this._type,
      primaryKey: this._primaryKey,
      unique: this._unique,
      optional: this._optional,
    };

    if (this._defaultValue !== undefined) {
      meta.defaultValue = this._defaultValue;
    }

    return meta;
  }
}
