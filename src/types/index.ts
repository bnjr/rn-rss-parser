/**
 * Represents an author of a feed or feed item.
 */
export interface FeedAuthor {
  name: string;
  email: string | null;
  url: string | null;
}

/**
 * Represents the content category of a feed or feed item.
 */
export interface FeedCategory {
  term: string;
  label: string | null;
  url: string | null;
}

/**
 * Represents the software that generated a feed.
 */
export interface FeedGenerator {
  name: string;
  version: string | null;
  url: string | null;
}

/**
 * Represents an image attached to a feed or feed item.
 */
export interface FeedImage {
  url: string;
  title: string | null;
  width?: number;
  height?: number;
}

/**
 * Represents a piece of media attached to a feed item.
 */
export interface FeedItemMedia {
  url: string;
  image: string | null;
  title: string | null;
  length: number | null;
  type: string | null;
  mimeType: string | null;
  width?: number;
  height?: number;
}

/**
 * Represents meta information about a feed.
 */
export interface FeedMeta {
  type: 'atom' | 'rss';
  version: '0.3' | '0.9' | '1.0' | '2.0' | null;
}

export type RSSVersion = '1.0' | '2.0' | 'atom';
