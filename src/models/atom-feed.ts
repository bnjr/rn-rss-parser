import { BaseFeed } from './base-feed';
import { FeedAuthor, FeedCategory, FeedGenerator, FeedImage, FeedMeta } from '../types';
import { FeedItem } from './feed-item';
import { AtomFeedItem } from './atom-feed-item';

/**
 * Class representing an Atom feed.
 */
export class AtomFeed extends BaseFeed {
  private feedElement: Element;
  private cachedItems: FeedItem[] = [];

  /**
   * Class constructor.
   *
   * @param {Element} element
   *     The DOM element to extract data from.
   */
  constructor(element: Element) {
    super();
    this.feedElement = element;

    this.meta = {
      type: 'atom',
      version: '0.3', // Default, can be updated based on namespace
    };

    // Check Atom version from namespace
    if (element.namespaceURI === 'http://www.w3.org/2005/Atom') {
      this.meta.version = '1.0';
    } else if (element.namespaceURI === 'http://purl.org/atom/ns#') {
      this.meta.version = '0.3';
    }
  }

  /**
   * @returns {string | null}
   *     Returns the feed language.
   */
  override get language(): string | null {
    const lang = this.feedElement.getAttribute('xml:lang') || this.feedElement.getAttribute('lang');
    return lang || super.language;
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
    return this.findElementContent('subtitle') || super.description;
  }

  /**
   * @returns {string | null}
   *     Returns the feed copyright.
   */
  override get copyright(): string | null {
    return this.findElementContent('rights') || super.copyright;
  }

  /**
   * @returns {string | null}
   *     Returns the feed URL.
   */
  override get url(): string | null {
    const links = Array.from(this.feedElement.getElementsByTagName('link'));
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
   * @returns {string | null}
   *     Returns the feed self URL.
   */
  override get self(): string | null {
    const links = Array.from(this.feedElement.getElementsByTagName('link'));
    const selfLink = links.find((link) => link.getAttribute('rel') === 'self');
    if (selfLink) {
      const href = selfLink.getAttribute('href');
      return href || null;
    }
    return super.self;
  }

  /**
   * @returns {Date | null}
   *     Returns the date that the feed was published on.
   */
  override get published(): Date | null {
    // Check for published date (Atom 1.0)
    const publishedDate = this.findElementContent('published');
    if (publishedDate) {
      try {
        return new Date(publishedDate);
      } catch (_) {
        // Invalid date format, try next
      }
    }

    // Try issued (Atom 0.3)
    const issuedDate = this.findElementContent('issued');
    if (issuedDate) {
      try {
        return new Date(issuedDate);
      } catch (_) {
        // Invalid date format, try next
      }
    }

    return super.published;
  }

  /**
   * @returns {Date | null}
   *     Returns the date that the feed was last updated on.
   */
  override get updated(): Date | null {
    // Check for updated date (Atom 1.0)
    const updatedDate = this.findElementContent('updated');
    if (updatedDate) {
      try {
        return new Date(updatedDate);
      } catch (_) {
        // Invalid date format, try next
      }
    }

    // Try modified (Atom 0.3)
    const modifiedDate = this.findElementContent('modified');
    if (modifiedDate) {
      try {
        return new Date(modifiedDate);
      } catch (_) {
        // Invalid date format, try next
      }
    }

    return super.updated;
  }

  /**
   * @returns {FeedGenerator | null}
   *     Returns information about the software that generated the feed.
   */
  override get generator(): FeedGenerator | null {
    const generator = this.feedElement.getElementsByTagName('generator')[0];
    if (!generator) {
      return super.generator;
    }

    const name = generator.textContent || '';
    const version = generator.getAttribute('version');
    const url = generator.getAttribute('uri');

    if (!name) {
      return super.generator;
    }

    return {
      name,
      version: version || null,
      url: url || null,
    };
  }

  /**
   * @returns {FeedImage | null}
   *     Returns an image representing the feed.
   */
  override get image(): FeedImage | null {
    // Look for logo (Atom 1.0)
    const logo = this.findElementContent('logo');
    if (logo) {
      return {
        url: logo,
        title: null,
      };
    }

    // Look for icon (smaller but could be used as fallback)
    const icon = this.findElementContent('icon');
    if (icon) {
      return {
        url: icon,
        title: null,
      };
    }

    return super.image;
  }

  /**
   * @returns {Array<FeedAuthor>}
   *     Returns the authors of the feed.
   */
  override get authors(): FeedAuthor[] {
    const authorElements = Array.from(this.feedElement.getElementsByTagName('author'));
    const authors = authorElements
      .map((author) => {
        const name = this.getElementContentFromParent(author, 'name') || '';
        const email = this.getElementContentFromParent(author, 'email');
        const uri = this.getElementContentFromParent(author, 'uri');

        if (!name) {
          return null;
        }

        return {
          name,
          email,
          url: uri,
        };
      })
      .filter((item): item is FeedAuthor => item !== null);

    return authors.length > 0 ? authors : super.authors;
  }

  /**
   * @returns {Array<FeedCategory>}
   *     Returns the categories the feed belongs to.
   */
  override get categories(): FeedCategory[] {
    const categories = Array.from(this.feedElement.getElementsByTagName('category'))
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

    return categories.length > 0 ? categories : super.categories;
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

    // In Atom 1.0, entries are used
    let itemElements = Array.from(this.feedElement.getElementsByTagName('entry'));

    const items = [];

    for (let i = 0; i < itemElements.length; i++) {
      items.push(new AtomFeedItem(this, itemElements[i]));
    }

    this.cachedItems = items;
    return items;
  }

  // Utility methods
  private findElementContent(tagName: string): string | null {
    const element = this.feedElement.getElementsByTagName(tagName)[0];
    return element ? element.textContent || null : null;
  }

  private getElementContentFromParent(parent: Element, tagName: string): string | null {
    const element = parent.getElementsByTagName(tagName)[0];
    return element ? element.textContent || null : null;
  }
}
