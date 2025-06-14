import { FeedAuthor, FeedCategory, FeedItemMedia } from '../types';
import { FeedItem } from './feed-item';
import { BaseFeed } from './base-feed';
import { findElementContent, findElementContentNS, parseAuthor } from '../utils/dom-utils';

const httpRegExp = /^https?:\/\//i;

/**
 * Class representing a single content item in an RSS feed.
 */
export class RssFeedItem extends FeedItem {
  private itemElement: Element;

  /**
   * Class constructor.
   *
   * @param {BaseFeed} feed
   *     The feed the item belongs to.
   * @param {Element} element
   *     The DOM element to extract data from.
   */
  constructor(feed: BaseFeed, element: Element) {
    super(feed);
    this.itemElement = element;
  }

  /**
   * @returns {string | null}
   *     Returns the feed item unique identifier.
   */
  override get id(): string | null {
    const guidElement = findElementContent(this.itemElement, 'guid');
    return guidElement || this.feed.id;
  }

  /**
   * @returns {string | null}
   *     Returns the feed item title.
   */
  override get title(): string | null {
    return findElementContent(this.itemElement, 'title') || this.feed.title;
  }

  /**
   * @returns {string | null}
   *     Returns the feed item description.
   */
  override get description(): string | null {
    return findElementContent(this.itemElement, 'description') || this.feed.description;
  }

  /**
   * @returns {string | null}
   *     Returns the feed item URL.
   */
  override get url(): string | null {
    const link = findElementContent(this.itemElement, 'link');
    if (!link) {
      return this.feed.url;
    }
    return link;
  }

  /**
   * @returns {Date | null}
   *     Returns the date that the feed item was published on.
   */
  override get published(): Date | null {
    const pubDate = findElementContent(this.itemElement, 'pubDate');
    if (pubDate) {
      try {
        return new Date(pubDate);
      } catch {
        // Invalid date format, continue
      }
    }
    return null;
  }

  /**
   * @returns {Date | null}
   *     Returns the date that the feed item was last updated on.
   */
  override get updated(): Date | null {
    const lastModified = findElementContent(this.itemElement, 'lastModified');
    if (lastModified) {
      try {
        return new Date(lastModified);
      } catch {
        // Invalid date format, continue
      }
    }
    return this.published;
  }

  /**
   * @returns {string | null}
   *     Returns the feed item content.
   */
  override get content(): string | null {
    const contentEncoded = findElementContentNS(
      this.itemElement,
      'http://purl.org/rss/1.0/modules/content/',
      'encoded',
    );
    if (contentEncoded) {
      return contentEncoded;
    }
    return null;
  }

  /**
   * @returns {Array<FeedItemMedia>}
   *     Returns the feed item media.
   */
  override get media(): FeedItemMedia[] {
    const enclosures = Array.from(this.itemElement.getElementsByTagName('enclosure'))
      .map((enclosure) => {
        const url = enclosure.getAttribute('url');
        if (!url) {
          return null;
        }
        const lengthAttr = enclosure.getAttribute('length');
        const length = lengthAttr ? parseInt(lengthAttr, 10) : null;
        const mimeType = enclosure.getAttribute('type')?.toLowerCase() || null;
        const type = typeof mimeType === 'string' ? mimeType.split('/')[0] : null;
        const image = type === 'image' ? url : null;
        const title = enclosure.getAttribute('title') || null;
        return {
          url,
          image,
          title,
          length,
          type,
          mimeType,
        } as FeedItemMedia;
      })
      .filter((item): item is FeedItemMedia => item !== null);

    // Add media:thumbnail as media, including width/height
    const mediaThumbs = Array.from(this.itemElement.getElementsByTagName('media:thumbnail'));
    for (const thumb of mediaThumbs) {
      const url = thumb.getAttribute('url');
      if (url) {
        const width = thumb.getAttribute('width')
          ? parseInt(thumb.getAttribute('width')!, 10)
          : undefined;
        const height = thumb.getAttribute('height')
          ? parseInt(thumb.getAttribute('height')!, 10)
          : undefined;
        enclosures.push({
          url,
          image: url,
          title: null,
          length: null,
          type: 'image',
          mimeType: null,
          width,
          height,
        });
      }
    }

    // Add media:content as media, including width/height, type, and description/credit if present
    const mediaContents = Array.from(this.itemElement.getElementsByTagName('media:content'));
    for (const media of mediaContents) {
      const url = media.getAttribute('url');
      if (url) {
        const width = media.getAttribute('width')
          ? parseInt(media.getAttribute('width')!, 10)
          : undefined;
        const height = media.getAttribute('height')
          ? parseInt(media.getAttribute('height')!, 10)
          : undefined;
        const type = media.getAttribute('medium') || 'image';
        let title = null;
        let description = null;
        let credit = null;
        // Try to get a title, description, and credit if present (child)
        const descEl = media.getElementsByTagName('media:description')[0];
        if (descEl && descEl.textContent) description = descEl.textContent;
        const creditEl = media.getElementsByTagName('media:credit')[0];
        if (creditEl && creditEl.textContent) credit = creditEl.textContent;
        // If not found as child, try as sibling (NYT style)
        if (!description || !credit) {
          let sibling = media.nextSibling;
          while (sibling) {
            if (
              !description &&
              sibling.nodeType === 1 &&
              sibling.nodeName === 'media:description' &&
              sibling.textContent
            ) {
              description = sibling.textContent;
            }
            if (
              !credit &&
              sibling.nodeType === 1 &&
              sibling.nodeName === 'media:credit' &&
              sibling.textContent
            ) {
              credit = sibling.textContent;
            }
            sibling = sibling.nextSibling;
          }
        }
        enclosures.push({
          url,
          image: url,
          title,
          description,
          credit,
          length: null,
          type,
          mimeType: null,
          width,
          height,
        } as any);
      }
    }

    return enclosures;
  }

  /**
   * @returns {FeedAuthor[]}
   *     Returns the feed item authors.
   */
  override get authors(): FeedAuthor[] {
    const dcCreator = findElementContentNS(
      this.itemElement,
      'http://purl.org/dc/elements/1.1/',
      'creator',
    );
    if (dcCreator) {
      return [parseAuthor(dcCreator)];
    }
    return this.feed.authors;
  }

  /**
   * @returns {FeedCategory[]}
   *     Returns the feed item categories.
   */
  override get categories(): FeedCategory[] {
    const categories = Array.from(this.itemElement.getElementsByTagName('category'))
      .map((category) => {
        const term = category.textContent || '';
        const domain = category.getAttribute('domain') || '';
        const url = httpRegExp.test(domain) ? domain : domain || null;
        if (!term) return null;
        return {
          label: term,
          term,
          url,
        } as FeedCategory;
      })
      .filter((item): item is FeedCategory => item !== null);
    return categories.length > 0 ? categories : this.feed.categories;
  }
}
