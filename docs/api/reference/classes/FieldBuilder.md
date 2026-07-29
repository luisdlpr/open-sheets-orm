Defined in: [schema/FieldBuilder.ts:20](https://github.com/luisdlpr/open-sheets-orm/blob/0b3f629e9322205d3fe38495bbe9dfb477a957c5/src/schema/FieldBuilder.ts#L20)

Fluent builder for defining a single field's properties.

Consumers should use the `field` factory object rather than
instantiating this class directly.

## Example

```ts
field.string().primaryKey().unique().default('hello').build()
// → { type: 'string', primaryKey: true, unique: true, optional: false, defaultValue: 'hello' }
```

## Constructors

### Constructor

> **new FieldBuilder**(`type`): `FieldBuilder`

Defined in: [schema/FieldBuilder.ts:27](https://github.com/luisdlpr/open-sheets-orm/blob/0b3f629e9322205d3fe38495bbe9dfb477a957c5/src/schema/FieldBuilder.ts#L27)

#### Parameters

##### type

[`SupportedFieldType`](../type-aliases/SupportedFieldType.md)

#### Returns

`FieldBuilder`

## Methods

### build()

> **build**(): [`FieldMetadata`](../interfaces/FieldMetadata.md)

Defined in: [schema/FieldBuilder.ts:62](https://github.com/luisdlpr/open-sheets-orm/blob/0b3f629e9322205d3fe38495bbe9dfb477a957c5/src/schema/FieldBuilder.ts#L62)

Compiles the builder into a plain metadata object.

#### Returns

[`FieldMetadata`](../interfaces/FieldMetadata.md)

The field metadata.

***

### default()

> **default**(`value`): `this`

Defined in: [schema/FieldBuilder.ts:52](https://github.com/luisdlpr/open-sheets-orm/blob/0b3f629e9322205d3fe38495bbe9dfb477a957c5/src/schema/FieldBuilder.ts#L52)

Sets a default value for the field.

#### Parameters

##### value

`unknown`

The default value. Its type must match the field type
  (validated by `validateSchema` at compile time).

#### Returns

`this`

***

### optional()

> **optional**(): `this`

Defined in: [schema/FieldBuilder.ts:41](https://github.com/luisdlpr/open-sheets-orm/blob/0b3f629e9322205d3fe38495bbe9dfb477a957c5/src/schema/FieldBuilder.ts#L41)

#### Returns

`this`

***

### primaryKey()

> **primaryKey**(): `this`

Defined in: [schema/FieldBuilder.ts:31](https://github.com/luisdlpr/open-sheets-orm/blob/0b3f629e9322205d3fe38495bbe9dfb477a957c5/src/schema/FieldBuilder.ts#L31)

#### Returns

`this`

***

### unique()

> **unique**(): `this`

Defined in: [schema/FieldBuilder.ts:36](https://github.com/luisdlpr/open-sheets-orm/blob/0b3f629e9322205d3fe38495bbe9dfb477a957c5/src/schema/FieldBuilder.ts#L36)

#### Returns

`this`
