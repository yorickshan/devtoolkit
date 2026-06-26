import { describe, it, expect } from 'vitest';

// Encode/Decode utility functions (inlined for testability)
function base64Encode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}
function base64Decode(str: string): string {
  try { return decodeURIComponent(escape(atob(str))); }
  catch { return atob(str); }
}
function uniEncode(str: string): string {
  return str.split('').map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join('');
}
function uniDecode(str: string): string {
  return str.replace(/\\u([0-9a-fA-F]{4})/g, (_m, h) => String.fromCharCode(parseInt(h, 16)));
}
function htmlEncode(s: string): string {
  return s.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m] ?? m));
}
function htmlDecode(s: string): string {
  return s.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, m => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#039;': "'" }[m] ?? m));
}
function jwtDecode(token: string): { header: unknown; payload: unknown } | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    return { header: JSON.parse(atob(parts[0])), payload: JSON.parse(atob(parts[1])) };
  } catch { return null; }
}

describe('encode utilities', () => {
  describe('base64', () => {
    it('should encode and decode roundtrip', () => {
      const original = 'Hello World 你好';
      const encoded = base64Encode(original);
      const decoded = base64Decode(encoded);
      expect(decoded).toBe(original);
    });

    it('should handle empty string', () => {
      expect(base64Encode('')).toBe('');
    });

    it('should handle special characters', () => {
      const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      expect(base64Decode(base64Encode(special))).toBe(special);
    });
  });

  describe('URL encode/decode', () => {
    it('should encode and decode roundtrip', () => {
      const url = 'https://example.com?q=hello world&lang=zh';
      const encoded = encodeURIComponent(url);
      const decoded = decodeURIComponent(encoded);
      expect(decoded).toBe(url);
    });
  });

  describe('unicode', () => {
    it('should encode and decode roundtrip', () => {
      const original = '你好世界';
      const encoded = uniEncode(original);
      const decoded = uniDecode(encoded);
      expect(decoded).toBe(original);
    });

    it('should encode ASCII as unicode escapes', () => {
      const result = uniEncode('AB');
      expect(result).toBe('\\u0041\\u0042');
    });

    it('should decode unicode escapes', () => {
      expect(uniDecode('\\u0041\\u0042')).toBe('AB');
    });
  });

  describe('HTML entities', () => {
    it('should encode HTML special chars', () => {
      expect(htmlEncode('<div>')).toBe('&lt;div&gt;');
      expect(htmlEncode('"hello"')).toBe('&quot;hello&quot;');
      expect(htmlEncode("it's")).toBe('it&#039;s');
    });

    it('should decode HTML entities', () => {
      expect(htmlDecode('&lt;div&gt;')).toBe('<div>');
      expect(htmlDecode('&quot;hello&quot;')).toBe('"hello"');
      expect(htmlDecode('it&#039;s')).toBe("it's");
    });

    it('should roundtrip encode/decode', () => {
      const original = '<script>alert("xss")</script>';
      expect(htmlDecode(htmlEncode(original))).toBe(original);
    });
  });

  describe('SHA-1', () => {
    it('should produce hex output', async () => {
      const hash = await crypto.subtle.digest('SHA-1', new TextEncoder().encode('hello'));
      const hex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
      expect(hex).toHaveLength(40);
    });

    it('should produce consistent output', async () => {
      const h1 = await crypto.subtle.digest('SHA-1', new TextEncoder().encode('test'));
      const h2 = await crypto.subtle.digest('SHA-1', new TextEncoder().encode('test'));
      expect(h1).toEqual(h2);
    });
  });

  describe('JWT decode', () => {
    it('should decode valid JWT', () => {
      const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      const decoded = jwtDecode(token);
      expect(decoded).not.toBeNull();
      expect(decoded!.header).toEqual({ alg: 'HS256' });
      expect(decoded!.payload).toEqual({ sub: '1234567890' });
    });

    it('should return null for invalid JWT', () => {
      expect(jwtDecode('invalid')).toBeNull();
      expect(jwtDecode('a.b')).toBeNull();
    });
  });
});

describe('JSON utilities', () => {
  function unpackTopLevelEscapedJSON(text: string): string {
    const trimmed = text.trim();
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      try {
        const inner = JSON.parse(trimmed);
        if (typeof inner === 'string') return unpackTopLevelEscapedJSON(inner);
        return JSON.stringify(inner, null, 2);
      } catch { return text; }
    }
    return text;
  }

  it('should unpack double-encoded JSON string', () => {
    const result = unpackTopLevelEscapedJSON('"{\\"key\\":\\"value\\"}"');
    const parsed = JSON.parse(result);
    expect(parsed).toEqual({ key: 'value' });
  });

  it('should pass through normal JSON', () => {
    const result = unpackTopLevelEscapedJSON('{"key":"value"}');
    const parsed = JSON.parse(result);
    expect(parsed).toEqual({ key: 'value' });
  });

  it('should pass through plain text', () => {
    expect(unpackTopLevelEscapedJSON('hello')).toBe('hello');
  });
});

describe('timestamp utilities', () => {
  it('should convert unix timestamp to date', () => {
    const ts = 1609459200; // 2021-01-01
    const d = new Date(ts * 1000);
    expect(d.getFullYear()).toBe(2021);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(1);
  });

  it('should handle millisecond timestamps', () => {
    const ts = 1609459200000;
    const d = new Date(ts);
    expect(d.getFullYear()).toBe(2021);
  });

  it('should convert date to unix timestamp', () => {
    const d = new Date('2021-01-01T00:00:00Z');
    expect(Math.floor(d.getTime() / 1000)).toBe(1609459200);
  });
});

describe('password generator character sets', () => {
  function generatePassword(length: number, sets: string): string {
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    let pwd = '';
    for (let i = 0; i < length; i++) {
      pwd += sets[arr[i] % sets.length];
    }
    return pwd;
  }

  it('should generate password of correct length', () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const pwd = generatePassword(16, chars);
    expect(pwd).toHaveLength(16);
  });

  it('should only use characters from the set', () => {
    const chars = 'ABC123';
    const pwd = generatePassword(100, chars);
    for (const c of pwd) {
      expect(chars).toContain(c);
    }
  });
});

describe('byte conversion', () => {
  const UNITS = [
    { name: 'Byte', multiplier: 1 },
    { name: 'KB', multiplier: 1024 },
    { name: 'MB', multiplier: 1024 ** 2 },
    { name: 'GB', multiplier: 1024 ** 3 },
    { name: 'TB', multiplier: 1024 ** 4 },
  ];

  function convert(bytes: number) {
    return UNITS.map(u => ({ name: u.name, value: bytes / u.multiplier }));
  }

  it('should convert 1024 bytes to 1 KB', () => {
    const results = convert(1024);
    const kb = results.find(r => r.name === 'KB')!;
    expect(kb.value).toBe(1);
  });

  it('should convert 1 GB to 1024 MB', () => {
    const results = convert(1024 ** 3);
    const mb = results.find(r => r.name === 'MB')!;
    expect(mb.value).toBe(1024);
  });

  it('should handle zero', () => {
    const results = convert(0);
    results.forEach(r => expect(r.value).toBe(0));
  });
});
