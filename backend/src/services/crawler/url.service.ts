class URLService {
  /**
   * Convert relative URLs into absolute URLs
   */
  normalize(baseUrl: string, href: string): string | null {
    try {
      return new URL(href, baseUrl).toString();
    } catch {
      return null;
    }
  }

  /**
   * Check whether URL belongs to same website
   */
  isInternal(baseUrl: string, targetUrl: string): boolean {
    return (
      new URL(baseUrl).hostname ===
      new URL(targetUrl).hostname
    );
  }

  /**
   * Remove hash (#section)
   */
  removeHash(url: string): string {
    return url.split("#")[0];
  }

  /**
   * Ignore unwanted protocols
   */
  isValid(url: string): boolean {
    return !(
      url.startsWith("javascript:") ||
      url.startsWith("mailto:") ||
      url.startsWith("tel:")
    );
  }

  /**
   * Remove duplicate URLs
   */
  unique(urls: string[]): string[] {
    return [...new Set(urls)];
  }

  /**
   * Complete URL cleanup pipeline
   */
  prepareLinks(baseUrl: string, links: string[]): string[] {
    const cleaned: string[] = [];

    for (const href of links) {
      if (!this.isValid(href)) continue;

      const absolute = this.normalize(baseUrl, href);

      if (!absolute) continue;

      const normalized = this.removeHash(absolute);

      if (!this.isInternal(baseUrl, normalized)) continue;

      cleaned.push(normalized);
    }

    return this.unique(cleaned);
  }
}

export default new URLService();