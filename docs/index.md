---
layout: home
title: Open Sheets ORM
titleTemplate: A type-safe ORM for Google Sheets
hero:
  name: Open Sheets ORM
  text: A Prisma-inspired, type-safe ORM for Google Sheets.
  tagline: A TypeScript/JavaScript library that turns any Google Spreadsheet into a queryable database with schema validation, type coercion, and a developer-friendly API.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: API Reference
      link: /api/
    - theme: alt
      text: NPM
      link: https://npmjs.com/package/open-sheets-orm
    - theme: alt
      text: github
      link: https://github.com/luisdlpr/open-sheets-orm
features:
  - title: TypeScript/JavaScript
    details: 'Built with TypeScript, works in any JS/TS project. Install via npm'
  - title: Schema Compiler
    details: Define models and fields with a fluent builder API. Supports string, number, boolean, date, and JSON field types.
  - title: Type Coercion
    details: Raw cell values are automatically parsed into the correct TypeScript types — numbers, booleans, dates, and JSON.
  - title: CRUD Operations
    details: findMany, findUnique, create, update, and delete with filtering, pagination, and uniqueness enforcement.
  - title: Auto-Generated Client
    details: CLI tool produces a typed client from your schema with model-specific delegates and interfaces.
  - title: Google Sheets Integration
    details: Built-in adapter for Google Sheets with service account authentication. Extensible adapter pattern for other providers.
---

::: info A quick gotcha for the purists
Yes, this is technically clickbait. There's no relational database here, so "ORM" is a stretch. An "Object Sheet Mapper" (OSM) would be more accurate — but let's be honest, nobody would know what that means. We went with ORM because it instantly communicates the dev experience: define a schema, run queries, get typed results. Same vibes, different grid.
:::
