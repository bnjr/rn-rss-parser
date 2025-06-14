import { BaseFeed } from './base-feed';
import { FeedAuthor, FeedCategory, FeedGenerator, FeedImage } from '../types';
import { FeedItem } from './feed-item';
import { RssFeedItem } from './rss-feed-item';
import {
  findElementContent,
  findElementContentNS,
  getElementContentFromParent,
  parseAuthor,
} from '../utils/dom-utils';

const httpRegExp = /^https?:\/\//i;

/**
 * Class representing an RSS 2.0 feed.
 */
export class Rss2Feed extends BaseFeed {
  private channelElement: Element;
  private cachedItems: FeedItem[] = [];

  /**
   * Class constructor.
   *
   * @param {Element} element
   *     The DOM element to extract data from.
   */
  constructor(element: Element) {
    super();
    this.channelElement = element;

    this.meta = {
      type: 'rss',
      version: '2.0',
    };
  }

  /**
   * @returns {string | null}
   *     Returns the feed language.
   */
  get language(): string | null {
    return findElementContent(this.channelElement, 'language') || null;
  }

  /**
   * @returns {string | null}
   *     Returns the feed title.
   */
  get title(): string | null {
    return findElementContent(this.channelElement, 'title') || null;
  }

  /**
   * @returns {string | null}
   *     Returns the feed description.
   */
  get description(): string | null {
    return findElementContent(this.channelElement, 'description') || null;
  }

  /**
   * @returns {string | null}
   *     Returns the feed copyright.
   */
  get copyright(): string | null {
    return findElementContent(this.channelElement, 'copyright') || null;
  }

  /**
   * @returns {string | null}
   *     Returns the feed URL.
   */
  get url(): string | null {
    return findElementContent(this.channelElement, 'link') || null;
  }

  /**
   * @returns {Date | null}
   *     Returns the date that the feed was published on.
   */
  override get published(): Date | null {
    const pubDate = findElementContent(this.channelElement, 'pubDate');
    if (pubDate) {
      try {
        return new Date(pubDate);
      } catch {
        // Invalid date format, use parent implementation
      }
    }
    const dcDate = findElementContentNS(
      this.channelElement,
      'http://purl.org/dc/elements/1.1/',
      'date',
    );
    if (dcDate) {
      try {
        return new Date(dcDate);
      } catch {
        // Invalid date format, use parent implementation
      }
    }
    return null;
  }

  /**
   * @returns {Date | null}
   *     Returns the date that the feed was last updated on.
   */
  override get updated(): Date | null {
    const lastBuildDate = findElementContent(this.channelElement, 'lastBuildDate');
    if (lastBuildDate) {
      try {
        return new Date(lastBuildDate);
      } catch {
        // Invalid date format, use parent implementation
      }
    }
    return null;
  }

  /**
   * @returns {FeedGenerator | null}
   *     Returns information about the software that generated the feed.
   */
  override get generator(): FeedGenerator | null {
    const generator = findElementContent(this.channelElement, 'generator');
    if (!generator) {
      return null;
    }

    // Attempt to parse the generator string
    // Format may be "Name vVersion (URL)" or just "Name"
    const parts = generator.match(/^([^v]+)\s+v?([^(]+)(?:\s+\(([^)]+)\))?$/i);

    if (parts) {
      return {
        name: parts[1].trim(),
        version: parts[2] ? parts[2].trim() : null,
        url: parts[3] ? parts[3].trim() : null,
      };
    }

    return {
      name: generator,
      version: null,
      url: null,
    };
  }

  /**
   * @returns {FeedImage | null}
   *     Returns an image representing the feed.
   */
  get image(): FeedImage | null {
    const imageElement = this.channelElement.getElementsByTagName('image')[0];
    if (!imageElement) {
      return null;
    }

    const url = getElementContentFromParent(imageElement, 'url');
    if (!url) {
      return null;
    }

    const title = getElementContentFromParent(imageElement, 'title');

    return {
      url,
      title,
    };
  }

  /**
   * @returns {Array<FeedAuthor>}
   *     Returns the authors of the feed.
   */
  override get authors(): FeedAuthor[] {
    const authors = [];

    // Check for DC creator first
    const dcCreator = findElementContentNS(
      this.channelElement,
      'http://purl.org/dc/elements/1.1/',
      'creator',
    );
    if (dcCreator) {
      authors.push(parseAuthor(dcCreator));
    }

    // Check for managingEditor
    const managingEditor = findElementContent(this.channelElement, 'managingEditor');
    if (managingEditor) {
      authors.push(parseAuthor(managingEditor));
    }

    // Check for iTunes author
    const itunesAuthor = findElementContentNS(
      this.channelElement,
      'http://www.itunes.com/dtds/podcast-1.0.dtd',
      'author',
    );
    if (itunesAuthor) {
      authors.push({
        name: itunesAuthor,
        email: null,
        url: null,
      });
    }

    return authors.length > 0 ? authors : [];
  }

  /**
   * @returns {Array<FeedCategory>}
   *     Returns the categories the feed belongs to.
   */
  override get categories(): FeedCategory[] {
    const categories = Array.from(this.channelElement.getElementsByTagName('category'))
      .map((category) => {
        const term = category.textContent || '';
        const domain = category.getAttribute('domain') || '';
        const url = httpRegExp.test(domain) ? domain : null;

        if (!term) {
          return null;
        }

        // Ensure label is always a string (never null)
        return {
          label: term as string,
          term,
          url,
        };
      })
      .filter((item): item is { label: string; term: string; url: string | null } => item !== null);

    // Process iTunes categories
    const itunesCategories = Array.from(
      this.channelElement.getElementsByTagNameNS(
        'http://www.itunes.com/dtds/podcast-1.0.dtd',
        'category',
      ),
    )
      .filter((category) => {
        // Only include top-level categories
        return !category.parentNode || category.parentNode.nodeName !== 'itunes:category';
      })
      .map((category) => {
        const term = category.getAttribute('text') || '';
        if (!term) {
          return null;
        }

        // Ensure label is always a string (never null)
        return {
          label: term as string,
          term,
          url: null,
        };
      })
      .filter((item): item is { label: string; term: string; url: null } => item !== null);

    // Cast to FeedCategory[] to satisfy the return type
    return [...categories, ...itunesCategories] as FeedCategory[];
  }

  /**
   * @returns {Array<FeedItem>}
   *     Returns all content items in the feed.
   */
  override get items(): FeedItem[] {
    // Cache items to avoid rebuilding the array on each access
    if (this.cachedItems.length > 0) {
      return this.cachedItems;
    }

    const itemElements = this.channelElement.getElementsByTagName('item');
    const items = [];

    for (let i = 0; i < itemElements.length; i++) {
      items.push(new RssFeedItem(this, itemElements[i]));
    }

    this.cachedItems = items;
    return items;
  }

  // Implement abstract members from BaseFeed
  get id(): string | null {
    // RSS 2.0 does not have a standard feed ID, so return the URL if available
    return this.url;
  }

  get self(): string | null {
    // RSS 2.0 does not have a standard self link, so return null
    return null;
  }
}
