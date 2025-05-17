import { FeedAuthor, FeedCategory, FeedImage, FeedItemMedia } from '../types';
import { FeedItem } from './feed-item';
import { BaseFeed } from './base-feed';

/**
 * Class representing a single content item in an Atom feed.
 */
export class AtomFeedItem extends FeedItem {
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
    return this.findElementContent('id') || super.id;
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
    return this.findElementContent('summary') || super.description;
  }

  /**
   * @returns {string | null}
   *     Returns the feed item URL.
   */
  override get url(): string | null {
    const links = Array.from(this.itemElement.getElementsByTagName('link'));
    if (links.length === 0) {
      return super.url;
    }

    // First try to find an alternate link
    const alternateLink = links.find((link) => link.getAttribute('rel') === 'alternate');
    if (alternateLink) {
      const href = alternateLink.getAttribute('href');
      return href || null;
    }

    // Then try any link without a rel attribute
    const defaultLink = links.find((link) => !link.getAttribute('rel'));
    if (defaultLink) {
      const href = defaultLink.getAttribute('href');
      return href || null;
    }

    return super.url;
  }

  /**
   * @returns {Date | null}
   *     Returns the date that the feed item was published on.
   */
  override get published(): Date | null {
    const publishedDate = this.findElementContent('published');
    if (publishedDate) {
      try {
        return new Date(publishedDate);
      } catch (_) {
        // Invalid date format, continue
      }
    }

    // Fallback to issued (older Atom versions)
    const issuedDate = this.findElementContent('issued');
    if (issuedDate) {
      try {
        return new Date(issuedDate);
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
    const updatedDate = this.findElementContent('updated');
    if (updatedDate) {
      try {
        return new Date(updatedDate);
      } catch (_) {
        // Invalid date format, continue
      }
    }

    // Fallback to modified (older Atom versions)
    const modifiedDate = this.findElementContent('modified');
    if (modifiedDate) {
      try {
        return new Date(modifiedDate);
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
    const content = this.itemElement.getElementsByTagName('content')[0];
    if (!content) {
      return super.content;
    }

    // Handle XHTML content (as per Atom spec)
    if (content.getAttribute('type') === 'xhtml') {
      const div = content.getElementsByTagName('div')[0];
      if (div) {
        return div.innerHTML;
      }
    }

    return content.textContent || super.content;
  }

  /**
   * @returns {FeedImage | null}
   *     Returns an image representing the feed item.
   */
  override get image(): FeedImage | null {
    // Try to find the first media image
    const mediaImage = this.mediaImages[0];
    if (mediaImage) {
      return {
        url: mediaImage.url,
        title: mediaImage.title,
      };
    }

    // Get any media thumbnail
    const thumbnails = this.media.filter((item) => item.image);
    if (thumbnails.length > 0 && thumbnails[0].image) {
      return {
        url: thumbnails[0].image,
        title: thumbnails[0].title,
      };
    }

    // Look for media:thumbnail element
    const thumbnail = this.itemElement.getElementsByTagName('thumbnail')[0];
    if (thumbnail) {
      const url = thumbnail.getAttribute('url');
      if (url) {
        return {
          url,
          title: null,
        };
      }
    }

    return super.image;
  }

  /**
   * @returns {Array<FeedItemMedia>}
   *     Returns the feed item media.
   */
  override get media(): FeedItemMedia[] {
    // In Atom, enclosures are indicated by link elements with rel="enclosure"
    const enclosures = Array.from(this.itemElement.getElementsByTagName('link'))
      .filter((link) => link.getAttribute('rel') === 'enclosure')
      .map((enclosure) => {
        const url = enclosure.getAttribute('href');
        if (!url) {
          return null;
        }

        const lengthAttr = enclosure.getAttribute('length');
        const length = lengthAttr ? parseInt(lengthAttr, 10) : null;

        const mimeType = enclosure.getAttribute('type')?.toLowerCase() || null;
        const type = typeof mimeType === 'string' ? mimeType.split('/')[0] : null;

        const image = type === 'image' ? url : null;
        const title = enclosure.getAttribute('title');

        return {
          url,
          image,
          title,
          length,
          type,
          mimeType,
        };
      })
      .filter((item): item is FeedItemMedia => item !== null);

    return enclosures;
  }

  /**
   * @returns {Array<FeedAuthor>}
   *     Returns the authors of the feed item, defaulting to the authors
   *     of the feed if none are found.
   */
  override get authors(): FeedAuthor[] {
    const authorElements = Array.from(this.itemElement.getElementsByTagName('author'));
    const authors = authorElements.map((author) => {
      const name = this.getElementContentFromParent(author, 'name') || '';
      const email = this.getElementContentFromParent(author, 'email');
      const uri = this.getElementContentFromParent(author, 'uri');

      return {
        name,
        email,
        url: uri,
      };
    });

    return authors.length > 0 ? authors : this.feed.authors;
  }

  /**
   * @returns {Array<FeedCategory>}
   *     Returns the categories the feed item belongs to.
   */
  override get categories(): FeedCategory[] {
    const categories = Array.from(this.itemElement.getElementsByTagName('category'))
      .map((category) => {
        const term = category.getAttribute('term');
        const label = category.getAttribute('label') || term;
        const scheme = category.getAttribute('scheme');

        if (!term) {
          return null;
        }

        return {
          label: label || null,
          term,
          url: scheme || null,
        };
      })
      .filter((item): item is FeedCategory => item !== null);

    return categories.length > 0 ? categories : this.feed.categories;
  }

  // Utility methods
  private findElementContent(tagName: string): string | null {
    const element = this.itemElement.getElementsByTagName(tagName)[0];
    return element ? element.textContent || null : null;
  }

  private getElementContentFromParent(parent: Element, tagName: string): string | null {
    const element = parent.getElementsByTagName(tagName)[0];
    return element ? element.textContent || null : null;
  }
}
