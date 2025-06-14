// Utility functions for DOM element extraction and parsing
import { FeedAuthor } from '../types';

export function findElementContent(parent: Element, tagName: string): string | null {
  const element = parent.getElementsByTagName(tagName)[0];
  return element ? element.textContent || null : null;
}

export function findElementContentNS(
  parent: Element,
  namespace: string,
  localName: string,
): string | null {
  const element = parent.getElementsByTagNameNS(namespace, localName)[0];
  return element ? element.textContent || null : null;
}

export function getElementContentFromParent(parent: Element, tagName: string): string | null {
  const element = parent.getElementsByTagName(tagName)[0];
  return element ? element.textContent || null : null;
}

export function parseAuthor(text: string): FeedAuthor {
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
