import fs from "node:fs";
import path from "node:path";
import type { ExtractedPage } from "./extractor.service";

/**
 * Local JSON-backed "database" for crawled pages.
 *
 * Persists to data/crawler.json (created on first write) and exposes a tiny
 * set of operations the crawler pipeline needs:
 *
 *   - upsertPage(page): add or replace a page by URL
 *   - listPages():      list every indexed page (for /api/pages)
 *   - getPage(url):     look up a single page
 *   - search(q):        naive substring match across title/description/content
 *   - count():          how many pages are indexed
 *   - clear():          wipe the database (for /api/pages DELETE)
 *
 * Writes are serialised through a queue so concurrent upserts never produce a
 * half-written file (writes go to <file>.tmp then rename).
 */
export interface StoredPage extends ExtractedPage {
  indexedAt: string;
}

interface DbFile {
  version: 1;
  pages: StoredPage[];
}

const DEFAULT_DB_PATH = path.join(process.cwd(), "data", "crawler.json");

class CrawlerDb {
  private filePath: string;
  private pages: Map<string, StoredPage> = new Map();
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(filePath: string = DEFAULT_DB_PATH) {
    this.filePath = filePath;
    this.load();
  }

  // ---------- file I/O ----------

  private load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        const parsed = JSON.parse(raw) as DbFile;
        if (parsed?.pages?.length) {
          this.pages = new Map(parsed.pages.map((p) => [p.url, p]));
        }
      }
    } catch (err) {
      console.error(`[CrawlerDb] failed to load ${this.filePath}:`, err);
      this.pages = new Map();
    }
  }

  private scheduleWrite() {
    this.writeQueue = this.writeQueue.then(() => this.writeNow());
  }

  private async writeNow(): Promise<void> {
    const dir = path.dirname(this.filePath);
    await fs.promises.mkdir(dir, { recursive: true });
    const payload: DbFile = {
      version: 1,
      pages: Array.from(this.pages.values()).sort((a, b) =>
        a.url.localeCompare(b.url)
      ),
    };
    const tmp = `${this.filePath}.tmp`;
    await fs.promises.writeFile(tmp, JSON.stringify(payload, null, 2));
    await fs.promises.rename(tmp, this.filePath);
  }

  /** Flush any pending writes to disk. */
  async flush(): Promise<void> {
    await this.writeQueue;
  }

  // ---------- public API ----------

  upsertPage(page: ExtractedPage): StoredPage {
    const stored: StoredPage = { ...page, indexedAt: new Date().toISOString() };
    this.pages.set(stored.url, stored);
    this.scheduleWrite();
    return stored;
  }

  getPage(url: string): StoredPage | undefined {
    return this.pages.get(url);
  }

  listPages(): StoredPage[] {
    return Array.from(this.pages.values()).sort((a, b) =>
      a.url.localeCompare(b.url)
    );
  }

  count(): number {
    return this.pages.size;
  }

  clear(): void {
    this.pages.clear();
    this.scheduleWrite();
  }

  /**
   * Naive substring search across title + description + content.
   * Title hits weight more heavily than body hits.
   */
  search(query: string, limit = 20): StoredPage[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const hits: Array<{ page: StoredPage; score: number }> = [];
    const escaped = escapeRegExp(q);
    for (const page of this.pages.values()) {
      const title = page.title.toLowerCase();
      const desc = page.description.toLowerCase();
      const body = page.content.toLowerCase();
      let score = 0;
      if (title.includes(q)) score += 6;
      if (desc.includes(q)) score += 3;
      const occurrences = (body.match(new RegExp(escaped, "g")) ?? []).length;
      score += Math.min(occurrences, 5);
      if (score > 0) hits.push({ page, score });
    }
    return hits
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((h) => h.page);
  }
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default new CrawlerDb();