import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('static deployment policy', () => {
  const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8'));

  it('serves known SPA routes explicitly and preserves unknown routes as 404 responses', () => {
    expect(config.navigationFallback).toBeUndefined();
    expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html' });
    expect(config.routes.filter((route: { rewrite?: string }) => route.rewrite === '/index.html').map((route: { route: string }) => route.route)).toEqual(['/demo', '/app', '/privacy', '/terms']);
  });

  it('marks hashed assets immutable and the service worker revalidatable', () => {
    expect(config.routes.find((route: { route: string }) => route.route === '/assets/*').headers['Cache-Control']).toContain('immutable');
    expect(config.routes.find((route: { route: string }) => route.route === '/sw.js').headers['Cache-Control']).toBe('no-cache');
  });
});

describe('404 copy policy', () => {
  const notFoundPage = readFileSync('public/404.html', 'utf8');

  it('uses a literal plain-words heading and retains the recovery link', () => {
    expect(notFoundPage).toContain('<h1>Page not found</h1>');
    expect(notFoundPage).not.toContain('This page is not on the board.');
    expect(notFoundPage).toContain('<a class="button" href="/">Go to the renewal calendar</a>');
  });
});

describe('public claim registry', () => {
  const claims = JSON.parse(readFileSync('.factory/claims.json', 'utf8')) as Array<{ id: string; test: string }>;
  const endToEndTests = readFileSync('tests/product.e2e.ts', 'utf8');

  it('keeps exactly one tagged browser regression for every declared claim', () => {
    const declared = claims.map(({ id }) => id).sort();
    const tagged = [...endToEndTests.matchAll(/@claim:([a-z0-9-]+)/g)].map((match) => match[1]).sort();
    expect(tagged).toEqual(declared);
    expect(new Set(declared).size).toBe(declared.length);
    for (const { id, test } of claims) {
      expect(test).toBe(`npm run test:e2e -- --grep @claim:${id}`);
      expect(tagged.filter((tag) => tag === id)).toHaveLength(1);
    }
  });
});
