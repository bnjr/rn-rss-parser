import { FeedAuthor, FeedCategory, FeedGenerator, FeedMeta } from '../types';
import { FeedItem } from './feed-item';

/**
 * Abstract class representing a generic feed (RSS or Atom).
 */
export abstract class BaseFeed {
  /**
   * Meta information about the feed, such as type and version.
   */
  protected meta: FeedMeta;

  constructor() {
    this.meta = {
      type: 'rss',
      version: null,
    };
  }

  get type(): 'rss' | 'atom' {
    return this.meta.type;
  }

  get version(): string | null {
    return this.meta.version;
  }

  abstract get id(): string | null;
  abstract get title(): string | null;
  abstract get description(): string | null; // RSS: description, Atom: subtitle
  abstract get url(): string | null; // RSS: link, Atom: link rel="alternate"
  abstract get self(): string | null; // Atom: link rel="self"
  abstract get language(): string | null; // RSS: language, Atom: xml:lang
  abstract get copyright(): string | null;
  abstract get published(): Date | null;
  abstract get updated(): Date | null;
  abstract get generator(): FeedGenerator | null;
  abstract get authors(): FeedAuthor[];
  abstract get categories(): FeedCategory[];
  abstract get items(): FeedItem[];

  /**
   * Serializes the feed to a JSON-compatible format.
   */
  toJSON(): object {
    return {
      meta: this.meta,
      id: this.id,
      title: this.title,
      description: this.description,
      url: this.url,
      self: this.self,
      language: this.language,
      copyright: this.copyright,
      published: this.published ? this.published.toISOString() : null,
      updated: this.updated ? this.updated.toISOString() : null,
      generator: this.generator,
      authors: this.authors,
      categories: this.categories,
      items: this.items.map((item) => item.toJSON()),
    };
  }
}

export { FeedItem } from './feed-item';
