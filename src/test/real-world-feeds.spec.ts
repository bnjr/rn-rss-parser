import * as rssParser from '../index';
import { feedList } from './samples/real-world-feed-list';

describe('real-world feeds list', () => {
  it('should demonstrate feed list information', () => {
    // This test just shows what's available in the feed list without actually fetching
    expect(feedList.length).toBeGreaterThan(0);

    // Count feed types
    const feedTypes: Record<string, number> = {};
    feedList.forEach((feed) => {
      feedTypes[feed.type] = (feedTypes[feed.type] || 0) + 1;
    });

    console.log(`Feed list contains ${feedList.length} feeds:`);
    Object.entries(feedTypes).forEach(([type, count]) => {
      console.log(`- ${type}: ${count} feeds`);
    });

    // Just a simple assertion to make the test pass
    expect(Object.keys(feedTypes).length).toBeGreaterThan(0);
  });

  it('should verify feeds are properly defined', () => {
    // Check that each feed has the expected structure
    feedList.forEach((feed) => {
      expect(feed.hash).toBeTruthy();
      expect(feed.title).toBeTruthy();
      expect(feed.type).toBeTruthy();
      expect(['RSS', 'Atom']).toContain(feed.type);
      expect(feed.urls).toBeTruthy();
      expect(feed.urls.feed).toMatch(/^https:\/\/sample-feeds\.rowanmanning\.com\/real-world/);
    });
  });

  // Instead of fetching and testing the feeds in real-time,
  // we'll test our parser on the pre-stored XML feed samples
  it('should parse sample Atom feed correctly (FYI Center)', async () => {
    // Import sample directly to avoid issues with TypeScript module detection
    const sample = require('./samples/real-world-feed-samples').realWorldFeedSamples.fyiCenterAtom;
    const result = await rssParser.parseFeed(sample);

    expect(result).not.toBeUndefined();
    expect(result.title).toBe('FYI Center for Software Developers');
    expect(result.items.length).toBe(2);
    expect(result.items[0].title).toBe('What Is SSO (Single Sign-On)?');
  });

  it('should parse sample RSS feed correctly (Mastodon)', async () => {
    // Import sample directly to avoid issues with TypeScript module detection
    const sample = require('./samples/real-world-feed-samples').realWorldFeedSamples.mastodonRSS;
    const result = await rssParser.parseFeed(sample);

    expect(result).not.toBeUndefined();
    expect(result.title).toBe('Mastodon User Feed');
    expect(result.items.length).toBe(2);
    expect(result.items[0].title).toBe('Sample Mastodon Post');
  });
});
