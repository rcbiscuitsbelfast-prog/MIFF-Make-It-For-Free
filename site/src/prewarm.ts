export async function prewarmAssets(urls: string[], concurrency = 6): Promise<void> {
  const queue = [...urls];
  const workers = Array.from({ length: Math.min(concurrency, queue.length || 1) }, async () => {
    while (queue.length) {
      const url = queue.shift();
      if (!url) break;
      try {
        await fetch(url, { cache: 'force-cache' });
      } catch {
        // best-effort prewarm
      }
    }
  });
  await Promise.all(workers);
}

