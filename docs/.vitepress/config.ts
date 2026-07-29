import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'vitepress';

function getApiSidebar() {
  const base = join(__dirname, '..', 'api', 'reference');
  const groups: { text: string; dir: string }[] = [
    { text: 'Classes', dir: 'classes' },
    { text: 'Interfaces', dir: 'interfaces' },
    { text: 'Type Aliases', dir: 'type-aliases' },
    { text: 'Functions', dir: 'functions' },
    { text: 'Variables', dir: 'variables' },
  ];

  return groups
    .filter(({ dir }) => {
      try {
        return readdirSync(join(base, dir)).length > 0;
      } catch {
        return false;
      }
    })
    .map(({ text, dir }) => ({
      text,
      collapsed: true,
      items: readdirSync(join(base, dir))
        .filter((f) => f.endsWith('.md'))
        .map((f) => ({
          text: f.replace('.md', ''),
          link: `/api/reference/${dir}/${f.replace('.md', '')}`,
        })),
    }));
}

export default defineConfig({
  title: 'open-sheets-orm',
  description:
    'A type-safe ORM for Google Sheets with a Prisma-inspired developer experience.',
  base: '/open-sheets-orm/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/guide/getting-started' },
      { text: 'Manual API', link: '/guide/manual-api' },
      { text: 'AutoGen Client', link: '/guide/autogen-client' },
      { text: 'API Reference', link: '/api/reference/' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Manual API Usage', link: '/guide/manual-api' },
          { text: 'AutoGen Client', link: '/guide/autogen-client' },
        ],
      },
      {
        text: 'Reference',
        items: [{ text: 'Overview', link: '/api/' }, ...getApiSidebar()],
      },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © luisdlpr',
    },
  },
});
