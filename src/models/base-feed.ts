import { FeedAuthor, FeedCategory, FeedGenerator, FeedImage, FeedMeta } from '../types';
import { FeedItem } from './feed-item';

/**
 * Base class representing a feed.
 */
export abstract class BaseFeed {
  /**
   * @type {FeedMeta}
   */
  protected meta: FeedMeta;

  /**
   * Class constructor.
   */
  constructor() {
    this.meta = {
      type: 'rss',
      version: null,
    };
  }

  /**
   * @returns {string | null}
   *     Returns the feed language.
   */
  get language(): string | null {
    return null;
  }

  /**
   * @returns {string | null}
   *     Returns the feed title.
   */
  get title(): string | null {
    return null;
  }

  /**
   * @returns {string | null}
   *     Returns the feed description.
   */
  get description(): string | null {
    return null;
  }

  /**
   * @returns {string | null}
   *     Returns the feed copyright.
   */
  get copyright(): string | null {
    return null;
  }

  /**
   * @returns {string | null}
   *     Returns the feed URL.
   */
  get url(): string | null {
    return null;
  }

  /**
   * @returns {string | null}
   *     Returns the feed self URL.
   */
  get self(): string | null {
    return null;
  }

  /**
   * @returns {Date | null}
   *     Returns the date that the feed was published on.
   */
  get published(): Date | null {
    return null;
  }

  /**
   * @returns {Date | null}
   *     Returns the date that the feed was last updated on.
   */
  get updated(): Date | null {
    return null;
  }

  /**
   * @returns {FeedGenerator | null}
   *     Returns information about the software that generated the feed.
   */
  get generator(): FeedGenerator | null {
    return null;
  }

  /**
   * @returns {FeedImage | null}
   *     Returns an image representing the feed.
   */
  get image(): FeedImage | null {
    return null;
  }

  /**
   * @returns {Array<FeedAuthor>}
   *     Returns the authors of the feed.
   */
  get authors(): FeedAuthor[] {
    return [];
  }

  /**
   * @returns {Array<FeedCategory>}
   *     Returns the categories the feed belongs to.
   */
  get categories(): FeedCategory[] {
    return [];
  }

  /**
   * @returns {Array<FeedItem>}
   *     Returns all content items in the feed.
   */
  get items(): FeedItem[] {
    return [];
  }

  /**
   * Get a JSON representation of the feed.
   *
   * @returns {object}
   *     Returns a JSON representation of the feed.
   */
  toJSON(): object {
    return {
      meta: this.meta,
      language: this.language,
      title: this.title,
      description: this.description,
      copyright: this.copyright,
      url: this.url,
      self: this.self,
      published: this.published ? this.published.toISOString() : null,
      updated: this.updated ? this.updated.toISOString() : null,
      generator: this.generator,
      image: this.image,
      authors: this.authors,
      categories: this.categories,
      items: this.items.map((item) => item.toJSON()),
    };
  }
}

export { FeedItem } from './feed-item';
