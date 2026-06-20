// Lightweight site-health signals for the admin Home tab. Both are best-effort
// and return null (shown as "unknown" in the UI) rather than throwing.

export async function checkSiteUp(): Promise<boolean | null> {
  try {
    const res = await fetch('https://www.miozuki.co.nz', {
      method: 'HEAD',
      next: { revalidate: 30 },
    });
    return res.ok;
  } catch {
    return null;
  }
}

// Reads the most recent audit JSON (scripts/audit.ts output) if it is present
// in the deployment. The audit folder may not ship to the serverless runtime,
// so a null result is expected and means "no recent audit on hand", not zero.
export async function getBrokenImageCount(): Promise<number | null> {
  try {
    const { readFile, readdir } = await import('node:fs/promises');
    const path = await import('node:path');
    const dir = path.join(process.cwd(), 'docs', 'audit');
    const files = (await readdir(dir))
      .filter((f) => f.startsWith('audit-') && f.endsWith('.json'))
      .sort();
    if (files.length === 0) return null;
    const raw = await readFile(path.join(dir, files[files.length - 1]), 'utf8');
    const data: unknown = JSON.parse(raw);
    if (data && typeof data === 'object') {
      const bi = (data as Record<string, unknown>).brokenImages;
      if (typeof bi === 'number') return bi;
      if (Array.isArray(bi)) return bi.length;
    }
    return null;
  } catch {
    return null;
  }
}
