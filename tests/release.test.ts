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
