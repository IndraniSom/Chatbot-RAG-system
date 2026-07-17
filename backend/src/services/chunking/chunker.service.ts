import { v5 as uuidv5 } from "uuid";
import { CleanedPage } from "../content/cleaner.service";

/**
 * Metadata that stays attached to every chunk.
 *
 * Later, this metadata will be stored in Qdrant
 * alongside the embedding vector.
 */
export interface ChunkMetadata {
  url: string;
  title: string;
  language: string;
  chunkIndex: number;
}

/**
 * Final structure of one chunk.
 */
export interface DocumentChunk {
  id: string;
  content: string;
  metadata: ChunkMetadata;
}

/**
 * Configuration for the chunker.
 *
 * We're using characters for our first implementation.
 *
 * Note:
 * chunkSize here is NOT the same as embedding dimensions.
 */
export interface ChunkerOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

class ChunkerService {
  /**
   * Default configuration.
   *
   * Roughly:
   * 2000 characters ≈ 400-500 tokens
   *
   * This is only an approximation because
   * token counts depend on the tokenizer.
   */
  private readonly defaultChunkSize = 2000;
  private readonly uuidNamespace =
  "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
  private readonly defaultChunkOverlap = 300;

  /**
   * Normalize text before chunking.
   */
  private normalizeText(text: string): string {
    return text
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  /**
   * Split a large piece of text using increasingly
   * smaller separators.
   *
   * Priority:
   *
   * Paragraphs
   * ↓
   * Sentences
   * ↓
   * Words
   * ↓
   * Characters
   */
  private splitText(
    text: string,
    chunkSize: number
  ): string[] {
    if (text.length <= chunkSize) {
      return [text];
    }

    const separators = [
      "\n\n",
      "\n",
      ". ",
      " ",
    ];

    for (const separator of separators) {
      const parts = text.split(separator);

      if (parts.length <= 1) {
        continue;
      }

      const chunks: string[] = [];

      let currentChunk = "";

      for (const part of parts) {
        const candidate = currentChunk
          ? `${currentChunk}${separator}${part}`
          : part;

        if (candidate.length <= chunkSize) {
          currentChunk = candidate;

          continue;
        }

        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }

        /**
         * The individual part itself might still
         * be larger than chunkSize.
         *
         * In that case recursively split it using
         * smaller separators.
         */
        if (part.length > chunkSize) {
          const smallerChunks = this.splitText(
            part,
            chunkSize
          );

          chunks.push(...smallerChunks);

          currentChunk = "";
        } else {
          currentChunk = part;
        }
      }

      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }

      /**
       * Only return if we successfully created
       * multiple chunks.
       */
      if (chunks.length > 1) {
        return chunks;
      }
    }

    /**
     * Final fallback.
     *
     * If there are no useful separators,
     * split by character length.
     */
    const chunks: string[] = [];

    for (
      let index = 0;
      index < text.length;
      index += chunkSize
    ) {
      chunks.push(
        text.slice(index, index + chunkSize)
      );
    }

    return chunks;
  }

  /**
   * Add overlap between chunks.
   *
   * Example:
   *
   * Chunk 1:
   * ABCDEFG
   *
   * Chunk 2 originally:
   * HIJKLMN
   *
   * With overlap:
   *
   * Chunk 2:
   * EFGHIJKLMN
   */
  private addOverlap(
    chunks: string[],
    overlap: number
  ): string[] {
    if (overlap <= 0) {
      return chunks;
    }

    return chunks.map((chunk, index) => {
      if (index === 0) {
        return chunk;
      }

      const previousChunk = chunks[index - 1];

      const overlapText = previousChunk.slice(
        Math.max(
          0,
          previousChunk.length - overlap
        )
      );

      return `${overlapText} ${chunk}`.trim();
    });
  }

  /**
   * Generate a deterministic ID for each chunk.
   *
   * Same:
   * URL + chunk index + content
   *
   * will always generate the same ID.
   */
 private generateChunkId(
  url: string,
  chunkIndex: number,
  content: string
): string {
  const uniqueValue =
    `${url}:${chunkIndex}:${content}`;

  return uuidv5(
    uniqueValue,
    this.uuidNamespace
  );
}

  /**
   * Split one CleanedPage into DocumentChunks.
   */
  chunkPage(
    page: CleanedPage,
    options: ChunkerOptions = {}
  ): DocumentChunk[] {
    const chunkSize =
      options.chunkSize ??
      this.defaultChunkSize;

    const chunkOverlap =
      options.chunkOverlap ??
      this.defaultChunkOverlap;

    /**
     * Prevent invalid configuration.
     */
    if (chunkSize <= 0) {
      throw new Error(
        "chunkSize must be greater than 0"
      );
    }

    if (
      chunkOverlap < 0 ||
      chunkOverlap >= chunkSize
    ) {
      throw new Error(
        "chunkOverlap must be greater than or equal to 0 and smaller than chunkSize"
      );
    }

    const normalizedContent =
      this.normalizeText(page.content);

    if (!normalizedContent) {
      return [];
    }

    /**
     * Step 1:
     * Split text into chunks.
     */
    const rawChunks = this.splitText(
      normalizedContent,
      chunkSize
    );

    /**
     * Step 2:
     * Add overlap.
     */
    const chunksWithOverlap =
      this.addOverlap(
        rawChunks,
        chunkOverlap
      );

    /**
     * Step 3:
     * Convert strings into DocumentChunk objects.
     */
    return chunksWithOverlap.map(
      (content, index) => ({
        id: this.generateChunkId(
          page.url,
          index,
          content
        ),

        content,

        metadata: {
          url: page.url,

          title: page.title,

          language: page.language,

          chunkIndex: index,
        },
      })
    );
  }

  /**
   * Chunk multiple pages.
   */
  chunkPages(
    pages: CleanedPage[],
    options: ChunkerOptions = {}
  ): DocumentChunk[] {
    const allChunks: DocumentChunk[] = [];

    for (const page of pages) {
      const pageChunks = this.chunkPage(
        page,
        options
      );

      allChunks.push(...pageChunks);
    }

    return allChunks;
  }
}

export default new ChunkerService();