import { FeedAuthor, FeedCategory, FeedImage, FeedItemMedia } from '../types';
import { BaseFeed } from './base-feed';

/**
 * Class representing a single content item in a feed.
 */
export abstract class FeedItem {
  /**
   * @type {BaseFeed}
   */
  protected feedRef: BaseFeed;

  /**
   * Class constructor.
   *
   * @param {BaseFeed} feed
   *     The feed the item belongs to.
   */
  constructor(feed: BaseFeed) {
    this.feedRef = feed;
  }

  /**
   * @returns {BaseFeed}
   *     Returns the feed the item belongs to.
   */
  get feed(): BaseFeed {
    return this.feedRef;
  }

  /**
   * @returns {string | null}
   *     Returns the feed item unique identifier.
   */
  get id(): string | null {
    return null;
  }

  /**
   * @returns {string | null}
   *     Returns the feed item title.
   */
  get title(): string | null {
    return null;
  }

  /**
   * @returns {string | null}
   *     Returns the feed item description.
   */
  get description(): string | null {
    return null;
  }

  /**
   * @returns {string | null}
   *     Returns the feed item URL.
   */
  get url(): string | null {
    return null;
  }

  /**
   * @returns {Date | null}
   *     Returns the date that the feed item was published on.
   */
  get published(): Date | null {
    return null;
  }

  /**
   * @returns {Date | null}
   *     Returns the date that the feed item was last updated on.
   */
  get updated(): Date | null {
    return null;
  }

  /**
   * @returns {string | null}
   *     Returns the feed item content.
   */
  get content(): string | null {
    return null;
  }

  /**
   * @returns {FeedImage | null}
   *     Returns an image representing the feed item.
   */
  get image(): FeedImage | null {
    return null;
  }

  /**
   * @returns {Array<FeedItemMedia>}
   *     Returns the feed item media.
   */
  get media(): FeedItemMedia[] {
    return [];
  }

  /**
   * @returns {Array<FeedItemMedia>}
   *     Returns the feed item media with a type of "audio".
   */
  get mediaAudio(): FeedItemMedia[] {
    return this.media.filter((mediaItem) => mediaItem.type === 'audio');
  }

  /**
   * @returns {Array<FeedItemMedia>}
   *     Returns the feed item media with a type of "image".
   */
  get mediaImages(): FeedItemMedia[] {
    return this.media.filter((mediaItem) => mediaItem.type === 'image');
  }

  /**
   * @returns {Array<FeedItemMedia>}
   *     Returns the feed item media with a type of "video".
   */
  get mediaVideos(): FeedItemMedia[] {
    return this.media.filter((mediaItem) => mediaItem.type === 'video');
  }

  /**
   * @returns {Array<FeedAuthor>}
   *     Returns the authors of the feed item.
   */
  get authors(): FeedAuthor[] {
    return [];
  }

  /**
   * @returns {Array<FeedCategory>}
   *     Returns the categories the feed item belongs to.
   */
  get categories(): FeedCategory[] {
    return [];
  }

  /**
   * Get a JSON representation of the feed item.
   *
   * @returns {object}
   *     Returns a JSON representation of the feed item.
   */
  toJSON(): object {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      url: this.url,
      published: this.published ? this.published.toISOString() : null,
      updated: this.updated ? this.updated.toISOString() : null,
      content: this.content,
      image: this.image,
      media: this.media,
      authors: this.authors,
      categories: this.categories,
    };
  }
}
