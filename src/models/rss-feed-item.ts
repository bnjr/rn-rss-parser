import { FeedAuthor, FeedCategory, FeedImage, FeedItemMedia } from '../types';
import { FeedItem } from './feed-item';
import { BaseFeed } from './base-feed';

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
    const guidElement = this.findElementContent('guid');
    return guidElement || super.id;
  }

  /**
   * @returns {string | null}
   *     Returns the feed item title.
   */
  override get title(): string | null {
    return this.findElementContent('title') || super.title;
  }

  /**
   * @returns {string | null}
   *     Returns the feed item description.
   */
  override get description(): string | null {
    return this.findElementContent('description') || super.description;
  }

  /**
   * @returns {string | null}
   *     Returns the feed item URL.
   */
  override get url(): string | null {
    const link = this.findElementContent('link');
    if (!link) {
      return super.url;
    }
    return link;
  }

  /**
   * @returns {Date | null}
   *     Returns the date that the feed item was published on.
   */
  override get published(): Date | null {
    const pubDate = this.findElementContent('pubDate');
    if (pubDate) {
      try {
        return new Date(pubDate);
      } catch (_) {
        // Invalid date format, continue
      }
    }
    return super.published;
  }

  /**
   * @returns {Date | null}
   *     Returns the date that the feed item was last updated on.
   */
  override get updated(): Date | null {
    // Try different date fields in order of preference
    const lastModified = this.findElementContent('lastModified');
    if (lastModified) {
      try {
        return new Date(lastModified);
      } catch (_) {
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
    const contentEncoded = this.findElementContentNS(
      'http://purl.org/rss/1.0/modules/content/',
      'encoded',
    );
    if (contentEncoded) {
      return contentEncoded;
    }
    return super.content;
  }

  /**
   * @returns {FeedImage | null}
   *     Returns an image representing the feed item.
   */
  override get image(): FeedImage | null {
    // Try to find an image from various sources
    const images = Array.from(this.itemElement.getElementsByTagName('image')).filter(
      (img) => !this.hasNamespace(img, 'itunes'),
    );

    const itunesImage = Array.from(this.itemElement.getElementsByTagName('image')).find((img) =>
      this.hasNamespace(img, 'itunes'),
    );

    let title: string | null = null;
    let url: string | null = null;
    let width: number | undefined = undefined;
    let height: number | undefined = undefined;

    // Try a regular image first
    if (images.length > 0) {
      title = this.getElementContentFromParent(images[0], 'title');
      url = this.getElementContentFromParent(images[0], 'url');
    }

    // If that fails, check for an itunes image
    if (!url && itunesImage) {
      url = itunesImage.getAttribute('href') || null;
    }

    // If that fails, check for the first media image
    const mediaImage = this.mediaImages[0];
    if (!url && mediaImage) {
      return {
        url: mediaImage.url,
        title: mediaImage.title,
        width: mediaImage.width,
        height: mediaImage.height,
      };
    }

    // Get any media thumbnail
    const thumbnails = this.media.filter((item) => item.image);
    if (!url && thumbnails.length > 0 && thumbnails[0].image) {
      return {
        url: thumbnails[0].image,
        title: thumbnails[0].title,
        width: thumbnails[0].width,
        height: thumbnails[0].height,
      };
    }

    // Check for media:thumbnail and extract width/height
    const mediaThumbs = Array.from(this.itemElement.getElementsByTagName('media:thumbnail'));
    if (!url && mediaThumbs.length > 0) {
      const thumbUrl = mediaThumbs[0].getAttribute('url');
      if (thumbUrl) {
        width = mediaThumbs[0].getAttribute('width')
          ? parseInt(mediaThumbs[0].getAttribute('width')!, 10)
          : undefined;
        height = mediaThumbs[0].getAttribute('height')
          ? parseInt(mediaThumbs[0].getAttribute('height')!, 10)
          : undefined;
        return {
          url: thumbUrl,
          title: null,
          width,
          height,
        };
      }
    }

    // If we found a valid image URL from any source
    if (url) {
      return {
        url,
        title,
        width,
        height,
      };
    }

    return super.image;
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
        // Try to get a title attribute if present, else null
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
    // Try dc:creator (Dublin Core)
    const dcCreator = this.findElementContentNS('http://purl.org/dc/elements/1.1/', 'creator');
    if (dcCreator) {
      return [this.parseAuthor(dcCreator)];
    }
    // Fallback to feed authors
    return this.feed.authors;
  }

  /**
   * @returns {FeedCategory[]}
   *     Returns the feed item categories.
   */
  override get categories(): FeedCategory[] {
    // Standard RSS <category> tags
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

  private findElementContent(tagName: string): string | null {
    const element = this.itemElement.getElementsByTagName(tagName)[0];
    return element ? element.textContent || null : null;
  }

  private findElementContentNS(namespace: string, localName: string): string | null {
    const element = this.itemElement.getElementsByTagNameNS(namespace, localName)[0];
    return element ? element.textContent || null : null;
  }

  private getElementContentFromParent(parent: Element, tagName: string): string | null {
    const element = parent.getElementsByTagName(tagName)[0];
    return element ? element.textContent || null : null;
  }

  private hasNamespace(element: Element, namespace: string): boolean {
    return (
      element.namespaceURI === 'http://www.itunes.com/dtds/podcast-1.0.dtd' ||
      element.prefix === namespace
    );
  }
}
