import { FeedAuthor, FeedCategory, FeedItemMedia } from '../types';
import { FeedItem } from './feed-item';
import { BaseFeed } from './base-feed';
import { findElementContent, getElementContentFromParent } from '../utils/dom-utils';

/**
 * Class representing a single content item in an Atom feed.
 */
export class AtomFeedItem extends FeedItem {
  private itemElement: Element;

  constructor(feed: BaseFeed, element: Element) {
    super(feed);
    this.itemElement = element;
  }

  override get id(): string | null {
    return findElementContent(this.itemElement, 'id') || this.feed.id;
  }

  override get title(): string | null {
    return findElementContent(this.itemElement, 'title') || this.feed.title;
  }

  override get description(): string | null {
    return findElementContent(this.itemElement, 'summary') || this.feed.description;
  }

  override get url(): string | null {
    const links = Array.from(this.itemElement.getElementsByTagName('link'));
    if (links.length === 0) {
      return this.feed.url;
    }

    const alternateLink = links.find((link) => link.getAttribute('rel') === 'alternate');
    if (alternateLink) {
      const href = alternateLink.getAttribute('href');
      return href || null;
    }

    const defaultLink = links.find((link) => !link.getAttribute('rel'));
    if (defaultLink) {
      const href = defaultLink.getAttribute('href');
      return href || null;
    }

    return this.feed.url;
  }

  override get published(): Date | null {
    const publishedDate = findElementContent(this.itemElement, 'published');
    if (publishedDate) {
      const date = new Date(publishedDate);
      if (!isNaN(date.getTime())) return date;
    }

    const issuedDate = findElementContent(this.itemElement, 'issued');
    if (issuedDate) {
      const date = new Date(issuedDate);
      if (!isNaN(date.getTime())) return date;
    }

    return null;
  }

  override get updated(): Date | null {
    const updatedDate = findElementContent(this.itemElement, 'updated');
    if (updatedDate) {
      const date = new Date(updatedDate);
      if (!isNaN(date.getTime())) return date;
    }

    const modifiedDate = findElementContent(this.itemElement, 'modified');
    if (modifiedDate) {
      const date = new Date(modifiedDate);
      if (!isNaN(date.getTime())) return date;
    }

    return this.published;
  }

  override get content(): string | null {
    const content = this.itemElement.getElementsByTagName('content')[0];
    if (!content) return null;

    if (content.getAttribute('type') === 'xhtml') {
      const div = content.getElementsByTagName('div')[0];
      if (div) return div.innerHTML;
    }

    return content.textContent || null;
  }

  override get media(): FeedItemMedia[] {
    return Array.from(this.itemElement.getElementsByTagName('link'))
      .filter((link) => link.getAttribute('rel') === 'enclosure')
      .map((enclosure) => {
        const url = enclosure.getAttribute('href');
        if (!url) return null;

        const length = enclosure.getAttribute('length');
        const mimeType = enclosure.getAttribute('type')?.toLowerCase() || null;
        const type = mimeType ? mimeType.split('/')[0] : null;

        return {
          url,
          image: type === 'image' ? url : null,
          title: enclosure.getAttribute('title'),
          length: length ? parseInt(length, 10) : null,
          type,
          mimeType,
        };
      })
      .filter((item): item is FeedItemMedia => item !== null);
  }

  override get authors(): FeedAuthor[] {
    const authorElements = Array.from(this.itemElement.getElementsByTagName('author'));
    const authors = authorElements.map((author) => {
      const name = getElementContentFromParent(author, 'name') || '';
      const email = getElementContentFromParent(author, 'email');
      const uri = getElementContentFromParent(author, 'uri');

      return { name, email, url: uri };
    });

    return authors.length > 0 ? authors : this.feed.authors;
  }

  override get categories(): FeedCategory[] {
    const categories = Array.from(this.itemElement.getElementsByTagName('category'))
      .map((category) => {
        const term = category.getAttribute('term');
        const label = category.getAttribute('label') || term;
        const scheme = category.getAttribute('scheme');

        if (!term) return null;

        return {
          label: label || null,
          term,
          url: scheme || null,
        };
      })
      .filter((item): item is FeedCategory => item !== null);

    return categories.length > 0 ? categories : this.feed.categories;
  }
}
