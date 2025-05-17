import { BaseFeed } from './base-feed';
import { FeedAuthor, FeedCategory, FeedGenerator, FeedImage, FeedMeta } from '../types';
import { FeedItem } from './feed-item';
import { RssFeedItem } from './rss-feed-item';

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
  override get language(): string | null {
    return this.findElementContent('language') || super.language;
  }

  /**
   * @returns {string | null}
   *     Returns the feed title.
   */
  override get title(): string | null {
    return this.findElementContent('title') || super.title;
  }

  /**
   * @returns {string | null}
   *     Returns the feed description.
   */
  override get description(): string | null {
    return this.findElementContent('description') || super.description;
  }

  /**
   * @returns {string | null}
   *     Returns the feed copyright.
   */
  override get copyright(): string | null {
    return this.findElementContent('copyright') || super.copyright;
  }

  /**
   * @returns {string | null}
   *     Returns the feed URL.
   */
  override get url(): string | null {
    return this.findElementContent('link') || super.url;
  }

  /**
   * @returns {Date | null}
   *     Returns the date that the feed was published on.
   */
  override get published(): Date | null {
    const pubDate = this.findElementContent('pubDate');
    if (pubDate) {
      try {
        return new Date(pubDate);
      } catch (_) {
        // Invalid date format, use parent implementation
      }
    }

    const dcDate = this.findElementContentNS('http://purl.org/dc/elements/1.1/', 'date');
    if (dcDate) {
      try {
        return new Date(dcDate);
      } catch (_) {
        // Invalid date format, use parent implementation
      }
    }

    return super.published;
  }

  /**
   * @returns {Date | null}
   *     Returns the date that the feed was last updated on.
   */
  override get updated(): Date | null {
    const lastBuildDate = this.findElementContent('lastBuildDate');
    if (lastBuildDate) {
      try {
        return new Date(lastBuildDate);
      } catch (_) {
        // Invalid date format, use parent implementation
      }
    }
    return super.updated;
  }

  /**
   * @returns {FeedGenerator | null}
   *     Returns information about the software that generated the feed.
   */
  override get generator(): FeedGenerator | null {
    const generator = this.findElementContent('generator');
    if (!generator) {
      return super.generator;
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
  override get image(): FeedImage | null {
    const imageElement = this.channelElement.getElementsByTagName('image')[0];
    if (!imageElement) {
      return super.image;
    }

    const url = this.getElementContentFromParent(imageElement, 'url');
    if (!url) {
      return super.image;
    }

    const title = this.getElementContentFromParent(imageElement, 'title');

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
    const dcCreator = this.findElementContentNS('http://purl.org/dc/elements/1.1/', 'creator');
    if (dcCreator) {
      authors.push(this.parseAuthor(dcCreator));
    }

    // Check for managingEditor
    const managingEditor = this.findElementContent('managingEditor');
    if (managingEditor) {
      authors.push(this.parseAuthor(managingEditor));
    }

    // Check for iTunes author
    const itunesAuthor = this.findElementContentNS(
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

    return authors.length > 0 ? authors : super.authors;
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

  // Utility methods
  private findElementContent(tagName: string): string | null {
    const element = this.channelElement.getElementsByTagName(tagName)[0];
    return element ? element.textContent || null : null;
  }

  private findElementContentNS(namespace: string, localName: string): string | null {
    const element = this.channelElement.getElementsByTagNameNS(namespace, localName)[0];
    return element ? element.textContent || null : null;
  }

  private getElementContentFromParent(parent: Element, tagName: string): string | null {
    const element = parent.getElementsByTagName(tagName)[0];
    return element ? element.textContent || null : null;
  }

  private parseAuthor(text: string): FeedAuthor {
    // Simple parsing of author format "name <email>"
    const match = text.match(/^([^<]+)\s*<([^>]+)>/);
    if (match) {
      return {
        name: match[1].trim(),
        email: match[2].trim(),
        url: null,
      };
    }
    return {
      name: text,
      email: null,
      url: null,
    };
  }
}
