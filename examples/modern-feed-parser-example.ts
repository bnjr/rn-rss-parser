// Example usage of the new feed parser model
import { parseFeed } from '../src';
import fs from 'fs';
import path from 'path';

// Example 1: Using the modern parser
async function parseWithModernApi() {
  try {
    // Load an example RSS feed
    const xmlContent = fs.readFileSync(path.join(__dirname, 'example-feed.xml'), 'utf-8');

    // Parse using the modern API
    const feed = parseFeed(xmlContent);

    console.log('Feed Title:', feed.title);
    console.log('Feed URL:', feed.url);
    console.log('Feed Description:', feed.description);

    // Print items
    console.log('\nItems:');
    feed.items.forEach((item, index) => {
      console.log(`\nItem ${index + 1}:`);
      console.log(`- Title: ${item.title}`);
      console.log(`- URL: ${item.url}`);
      console.log(
        `- Pub Date: ${item.published instanceof Date ? item.published.toISOString() : item.published}`,
      );
      console.log(`- Description: ${item.description?.substring(0, 50)}...`);
    });
  } catch (error) {
    console.error('Error parsing feed:', error);
  }
}

// Run the examples
console.log('====== MODERN API EXAMPLE ======');
parseWithModernApi();
