// This file is for testing the RSS parser in a simple example
import * as rssParser from '../src/index';

// Simple RSS feed for testing
const rssFeed = `
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <link>https://example.com</link>
    <description>A test RSS feed</description>
    <item>
      <title>Test Item 1</title>
      <link>https://example.com/item1</link>
      <description>Description of item 1</description>
      <pubDate>Mon, 06 Sep 2021 12:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Test Item 2</title>
      <link>https://example.com/item2</link>
      <description>Description of item 2</description>
      <pubDate>Tue, 07 Sep 2021 12:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>
`;

async function testRSS() {
  try {
    console.log('Testing RSS parser with simple feed...');
    const feed = await rssParser.parseFeed(rssFeed);
    console.log('Feed title:', feed.title);
    console.log('Feed url:', feed.url);
    console.log('Feed description:', feed.description);
    console.log('Number of items:', feed.items.length);
    console.log('First item title:', feed.items[0].title);
    console.log('First item url:', feed.items[0].url);
    console.log(
      'First item published date:',
      feed.items[0].published instanceof Date
        ? feed.items[0].published.toISOString()
        : feed.items[0].published,
    );
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error testing RSS parser:', error);
  }
}

testRSS();
