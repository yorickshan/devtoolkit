import { describe, it, expect } from 'vitest';

describe('radix conversion', () => {
  it('should convert hex to decimal', () => {
    expect(parseInt('FF', 16)).toBe(255);
    expect(parseInt('0xFF')).toBe(255);
  });

  it('should convert decimal to hex', () => {
    expect((255).toString(16)).toBe('ff');
  });

  it('should convert binary prefixed strings', () => {
    const val = '0b11111111';
    expect(parseInt(val.slice(2), 2)).toBe(255);
  });

  it('should convert octal prefixed strings', () => {
    const val = '0o377';
    expect(parseInt(val.slice(2), 8)).toBe(255);
  });

  it('should reject invalid input', () => {
    expect(isNaN(parseInt('xyz', 10))).toBe(true);
  });
});

describe('timestamp conversion', () => {
  it('should convert unix seconds to date', () => {
    const ts = 1609459200;
    const d = new Date(ts * 1000);
    expect(d.getUTCFullYear()).toBe(2021);
    expect(d.getUTCMonth()).toBe(0);
    expect(d.getUTCDate()).toBe(1);
    expect(d.getUTCHours()).toBe(0);
  });

  it('should convert milliseconds to date', () => {
    const ts = 1609459200000;
    const d = new Date(ts);
    expect(d.getUTCFullYear()).toBe(2021);
  });

  it('should handle NOW correctly', () => {
    const now = Date.now();
    const d = new Date(now);
    expect(d.getTime()).toBe(now);
  });

  it('should convert date back to unix', () => {
    const d = new Date('2021-01-01T00:00:00Z');
    const unix = Math.floor(d.getTime() / 1000);
    expect(unix).toBe(1609459200);
  });
});

describe('HTML to Markdown conversion', () => {
  function htmlToMd(html: string): string {
    let md = html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
      .replace(/<a[^>]*href="(.*?)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      .replace(/<ul[^>]*>(.*?)<\/ul>/gis, (_: string, items: string) => items.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n'))
      .replace(/<ol[^>]*>(.*?)<\/ol>/gis, (_: string, items: string) => {
        let i = 1;
        return items.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${i++}. $1\n`);
      })
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
    return md;
  }

  it('should convert heading tags', () => {
    expect(htmlToMd('<h1>Title</h1>')).toContain('# Title');
    expect(htmlToMd('<h2>Section</h2>')).toContain('## Section');
  });

  it('should convert bold and italic', () => {
    expect(htmlToMd('<strong>bold</strong>')).toContain('**bold**');
    expect(htmlToMd('<em>italic</em>')).toContain('*italic*');
  });

  it('should convert links', () => {
    expect(htmlToMd('<a href="https://example.com">Link</a>')).toContain('[Link](https://example.com)');
  });

  it('should convert unordered lists', () => {
    const result = htmlToMd('<ul><li>A</li><li>B</li></ul>');
    expect(result).toContain('- A');
    expect(result).toContain('- B');
  });

  it('should strip remaining HTML tags', () => {
    expect(htmlToMd('<div>hello</div>')).toBe('hello');
  });

  it('should decode HTML entities', () => {
    expect(htmlToMd('&amp;')).toBe('&');
    expect(htmlToMd('&lt;&gt;')).toBe('<>');
  });

  it('should handle empty input', () => {
    expect(htmlToMd('')).toBe('');
  });
});

describe('regex matching', () => {
  it('should match basic pattern', () => {
    const re = /hello/;
    expect(re.test('hello world')).toBe(true);
    expect(re.test('world')).toBe(false);
  });

  it('should capture groups', () => {
    const m = 'abc123'.match(/([a-z]+)(\d+)/);
    expect(m).not.toBeNull();
    expect(m![1]).toBe('abc');
    expect(m![2]).toBe('123');
  });

  it('should respect global flag', () => {
    const matches = 'a b c'.match(/[a-c]/g);
    expect(matches).toEqual(['a', 'b', 'c']);
  });

  it('should be case-insensitive with i flag', () => {
    expect(/hello/i.test('HELLO')).toBe(true);
    expect(/hello/.test('HELLO')).toBe(false);
  });

  it('should throw on invalid regex', () => {
    expect(() => new RegExp('[')).toThrow();
  });
});

describe('byte conversion', () => {
  function convert(bytes: number) {
    const units = [
      { name: 'B', mult: 1 },
      { name: 'KB', mult: 1024 },
      { name: 'MB', mult: 1024 ** 2 },
      { name: 'GB', mult: 1024 ** 3 },
      { name: 'TB', mult: 1024 ** 4 },
    ];
    return units.map(u => ({ name: u.name, value: bytes / u.mult }));
  }

  it('1024 bytes = 1 KB', () => {
    const r = convert(1024);
    expect(r.find(x => x.name === 'KB')!.value).toBe(1);
  });

  it('1 MB = 1024 KB', () => {
    const r = convert(1024 ** 2);
    expect(r.find(x => x.name === 'MB')!.value).toBe(1);
    expect(r.find(x => x.name === 'KB')!.value).toBe(1024);
  });

  it('0 bytes = 0 in all units', () => {
    const r = convert(0);
    r.forEach(x => expect(x.value).toBe(0));
  });
});

describe('mock data generation', () => {
  it('should generate users with required fields', () => {
    const user = () => ({
      id: crypto.randomUUID(),
      name: 'TestUser',
      email: 'test@example.com',
      age: 30,
      created: new Date().toISOString(),
    });
    const u = user();
    expect(u.id).toBeTruthy();
    expect(u.email).toContain('@');
    expect(u.age).toBeGreaterThan(0);
  });
});

describe('password strength', () => {
  function generatePwd(len: number, chars: string): string {
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    return Array.from(arr, n => chars[n % chars.length]).join('');
  }

  it('should match requested length', () => {
    expect(generatePwd(16, 'ABC')).toHaveLength(16);
  });

  it('should only use specified characters', () => {
    const pwd = generatePwd(50, 'ABC123');
    for (const c of pwd) {
      expect('ABC123').toContain(c);
    }
  });
});
