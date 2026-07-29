---
layout: home
title: open-sheets-orm
titleTemplate: A type-safe ORM for Google Sheets
hero:
  name: open-sheets-orm
  text: Type-safe ORM for Google Sheets
  tagline: Turn any Google Spreadsheet into a queryable database with schema validation, type coercion, and a Prisma-inspired developer experience.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: API Reference
      link: /api/
features:
  - title: Schema Compiler
    details: Define models and fields with a fluent builder API. Supports string, number, boolean, date, and JSON field types.
  - title: Type Coercion
    details: Raw cell values are automatically parsed into the correct TypeScript types — numbers, booleans, dates, and JSON.
  - title: CRUD Operations
    details: findMany, findUnique, create, update, and delete with filtering, pagination, and uniqueness enforcement.
  - title: Auto-Generated Client
    details: CLI tool produces a Prisma-like typed client from your schema with model-specific delegates and interfaces.
  - title: Input Validation
    details: Required fields, type checks, and uniqueness constraints are enforced at runtime on every write operation.
  - title: Google Sheets Integration
    details: Built-in adapter for Google Sheets with service account authentication. Extensible adapter pattern for other providers.
---
