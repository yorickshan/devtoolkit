// JSON format worker — offloads formatting from main thread for large files

self.onmessage = (e: MessageEvent<{ text: string; mode: 'format' | 'compress'; indent: number }>) => {
  const { text, mode, indent } = e.data;
  try {
    const parsed = JSON.parse(text);
    if (mode === 'compress') {
      self.postMessage({ ok: true, result: JSON.stringify(parsed) });
    } else {
      self.postMessage({ ok: true, result: JSON.stringify(parsed, null, indent) });
    }
  } catch (err) {
    self.postMessage({ ok: false, error: (err as Error).message });
  }
};
