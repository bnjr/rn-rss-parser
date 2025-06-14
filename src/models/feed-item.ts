import { FeedAuthor, FeedCategory, FeedItemMedia } from '../types';
import { BaseFeed } from './base-feed';

/**
 * Abstract class representing a single content item in a feed.
 */
export abstract class FeedItem {
  /**
   * Reference to the feed this item belongs to.
   */
  protected feedRef: BaseFeed;

  constructor(feed: BaseFeed) {
    this.feedRef = feed;
  }

  get feed(): BaseFeed {
    return this.feedRef;
  }

  abstract get id(): string | null;
  abstract get title(): string | null;
  abstract get description(): string | null; // RSS: description, Atom: summary
  abstract get content(): string | null; // RSS: content:encoded, Atom: content
  abstract get url(): string | null; // RSS: link, Atom: link rel="alternate"
  abstract get published(): Date | null; // pubDate or published
  abstract get updated(): Date | null; // updated or dc:date

  /**
   * Array of media entries associated with the item.
   */
  get media(): FeedItemMedia[] {
    return [];
  }

  get mediaAudio(): FeedItemMedia[] {
    return this.media.filter((mediaItem) => mediaItem.type === 'audio');
  }

  get mediaImages(): FeedItemMedia[] {
    return this.media.filter((mediaItem) => mediaItem.type === 'image');
  }

  get mediaVideos(): FeedItemMedia[] {
    return this.media.filter((mediaItem) => mediaItem.type === 'video');
  }

  /**
   * Authors of the item. Atom can have multiple; RSS usually one.
   */
  get authors(): FeedAuthor[] {
    return [];
  }

  /**
   * Categories/tags assigned to the item.
   */
  get categories(): FeedCategory[] {
    return [];
  }

  /**
   * JSON serialization of the feed item.
   */
  toJSON(): object {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      content: this.content,
      url: this.url,
      published: this.published ? this.published.toISOString() : null,
      updated: this.updated ? this.updated.toISOString() : null,
      media: this.media,
      mediaAudio: this.mediaAudio,
      mediaImages: this.mediaImages,
      mediaVideos: this.mediaVideos,
      authors: this.authors,
      categories: this.categories,
    };
  }
}
