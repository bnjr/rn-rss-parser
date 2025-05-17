import { DOMParser } from '@xmldom/xmldom';
import { BaseFeed } from '../models/base-feed';
import { Rss2Feed } from '../models/rss2-feed';
import { AtomFeed } from '../models/atom-feed';

/**
 * Parse an XML string into a feed object.
 *
 * @param {string} xml
 *     The XML string to parse.
 * @returns {BaseFeed}
 *     Returns a feed object.
 */
export function parseFeed(xml: string): BaseFeed {
  try {
    // Remove any leading whitespace and ensure the XML declaration is at the very start
    const cleanXml = xml.trim();

    const parser = new DOMParser({
      // Use onError instead of errorHandler as per latest @xmldom/xmldom API
      onError: () => {
        /* ignore all errors */
      },
    });

    const xmlDoc = parser.parseFromString(cleanXml, 'text/xml');

    // First check if we have an Atom feed
    const atomElement = xmlDoc.getElementsByTagName('feed')[0];
    if (atomElement) {
      // Check if this is an Atom feed by checking namespace or feed elements
      if (
        atomElement.namespaceURI === 'http://www.w3.org/2005/Atom' ||
        atomElement.namespaceURI === 'http://purl.org/atom/ns#' ||
        atomElement.getElementsByTagName('entry').length > 0
      ) {
        // Cast to 'any' to satisfy the constructor type
        return new AtomFeed(atomElement as unknown as Element);
      }
    }

    // Check for RSS
    const rssElement = xmlDoc.getElementsByTagName('rss')[0];
    if (rssElement) {
      const channel = rssElement.getElementsByTagName('channel')[0];
      if (!channel) {
        throw new Error('Channel not found in RSS feed');
      }
      // Cast to 'any' to satisfy the constructor type
      return new Rss2Feed(channel as unknown as Element);
    }

    // Check for RDF (RSS 1.0)
    const rdfElement = xmlDoc.getElementsByTagName('RDF')[0];
    if (rdfElement) {
      const channel = rdfElement.getElementsByTagName('channel')[0];
      if (!channel) {
        throw new Error('Channel not found in RSS 1.0 feed');
      }
      // For now, parse RSS 1.0 as RSS 2.0, but with a different meta version
      const feed = new Rss2Feed(channel as unknown as Element);
      // Set meta via a public method or constructor only; cannot set protected property directly
      (feed as any).meta = { type: 'rss', version: '1.0' };
      return feed;
    }

    throw new Error('Could not determine feed type');
  } catch (error: any) {
    if (error.message.includes('xml declaration')) {
      // Try to parse without the XML declaration
      const xmlWithoutDeclaration = xml.replace(/^\\s*<\\?xml[^>]*\\?>\\s*/i, '');
      try {
        return parseFeed(xmlWithoutDeclaration);
      } catch (innerError) {
        throw error; // If that fails too, throw the original error
      }
    }
    throw error;
  }
}

/**
 * Convert a BaseFeed object to the legacy Feed format for backward compatibility.
 *
 * @param {BaseFeed} feed
 *     The feed object to convert.
 * @returns {Feed}
 *     Returns a Feed object in the legacy format.
 */
export function convertToLegacyFeed(feed: BaseFeed): any {
  // This is where you would implement conversion logic
  // between the new model and the old model
  // For now, we'll return the feed as is since we've made the new Feed class
  // extend BaseFeed
  return feed;
}
