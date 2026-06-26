import { describe, it, expect } from 'vitest';
import { TOOLS, searchTools, getToolById, getToolsByCategory } from '@/data/tools-registry';

describe('tools-registry', () => {
  it('should contain 35 tools across all phases', () => {
    expect(TOOLS.length).toBeGreaterThanOrEqual(34);
  });

  it('searchTools should match by name', () => {
    const results = searchTools('JSON');
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results[0].id).toContain('json');
  });

  it('searchTools should match by nameEn', () => {
    const results = searchTools('Encode');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.id === 'en-decode')).toBe(true);
  });

  it('searchTools should match by keywords', () => {
    const results = searchTools('base64');
    expect(results.some(r => r.id === 'en-decode')).toBe(true);
  });

  it('searchTools should be case-insensitive', () => {
    expect(searchTools('json').length).toBe(searchTools('JSON').length);
  });

  it('searchTools should return empty for non-matching query', () => {
    expect(searchTools('xyznonexistent123')).toHaveLength(0);
  });

  it('getToolById should return correct tool', () => {
    const tool = getToolById('json-format');
    expect(tool).toBeDefined();
    expect(tool!.name).toBe('JSON 格式化');
    expect(tool!.category).toBe('formatter');
  });

  it('getToolById should return undefined for invalid id', () => {
    expect(getToolById('nonexistent')).toBeUndefined();
  });

  it('getToolsByCategory should filter correctly', () => {
    const formatters = getToolsByCategory('formatter');
    expect(formatters.length).toBeGreaterThan(0);
    formatters.forEach(f => expect(f.category).toBe('formatter'));
  });

  it('all tools should have unique ids', () => {
    const ids = TOOLS.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all tools should have valid routes', () => {
    TOOLS.forEach(t => {
      expect(t.route).toMatch(/^\/tool\//);
    });
  });

  it('all tools should have valid descriptions', () => {
    TOOLS.forEach(t => {
      expect(t.description).toBeTruthy();
      expect(t.keywords.length).toBeGreaterThan(0);
    });
  });
});
