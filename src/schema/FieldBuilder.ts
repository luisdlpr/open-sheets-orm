/**
 * @file Fluent builder for defining field properties.
 * @module open-sheets-orm/schema
 */

import type { FieldMetadata, SupportedFieldType } from './types';

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

  default(value: unknown): this {
    this._defaultValue = value;
    return this;
  }

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
