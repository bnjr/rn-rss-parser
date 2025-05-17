# rn-rss-parser

React Native compatible package to parse RSS feeds. This TypeScript library makes it easy to parse RSS 1.0, RSS 2.0, and Atom feeds in your React Native applications.

> This library is based on the works of:
> - [rowanmanning/feed-parser](https://github.com/rowanmanning/feed-parser)
> - [jameslawler/react-native-rss-parser](https://github.com/jameslawler/react-native-rss-parser)

---

✨ _This project has been **vibe coded**._ ✨

---

## Installation

To install the package, use npm or yarn:

```bash
npm install rn-rss-parser
```

or

```bash
yarn add rn-rss-parser
```

## Supported Platforms

- React Native (Android & iOS)
- Node.js (for server-side parsing)
- Web (with appropriate polyfills)

## Usage

To use the library, import it in your project:

```typescript
import { parseFeed, BaseFeed, FeedItem, Rss2Feed, AtomFeed, RssFeedItem, AtomFeedItem } from 'rn-rss-parser';
```

### Parsing RSS/Atom Feeds

The main entry point is `parseFeed`, which automatically detects and parses RSS 1.0, RSS 2.0, and Atom feeds:

```typescript
const xml = `<rss version="2.0">...</rss>`; // or Atom/RSS1.0 XML
try {
  const feed = parseFeed(xml);
  console.log('Feed title:', feed.title);
  console.log('Number of items:', feed.items.length);
  console.log('First item:', feed.items[0].title);
} catch (error) {
  console.error('Failed to parse feed:', error);
}
```

### Example Implementation

Here's a simple example of how to fetch and parse an RSS or Atom feed in a React Native app:

```typescript
import { parseFeed } from 'rn-rss-parser';

async function fetchAndParseFeed(url: string) {
  try {
    const response = await fetch(url);
    const responseText = await response.text();
    const feed = parseFeed(responseText);
    return feed;
  } catch (error) {
    console.error('Error fetching or parsing feed:', error);
    throw error;
  }
}
```

## Features

- Full support for RSS 1.0, RSS 2.0, and Atom feed formats
- Support for iTunes podcast extension tags
- Support for Dublin Core (DC) metadata
- TypeScript definitions for all feed elements
- Proper error handling for invalid feed formats
- Extracts all standard feed elements including:
  - Title, link, description
  - Categories and enclosures
  - Publication dates
  - Authors and contributors
  - Media attachments
  - Custom namespaces

## API

### Main Exports

- `parseFeed(xml: string): BaseFeed` — Parse any RSS/Atom feed (auto-detects type)
- `BaseFeed` — Abstract base class for all feeds
- `FeedItem` — Abstract base class for feed items
- `Rss2Feed` — RSS 2.0 feed class
- `AtomFeed` — Atom feed class
- `RssFeedItem` — RSS 2.0 item class
- `AtomFeedItem` — Atom item class

### Data Structure Types

- See TypeScript definitions in the source for details: `FeedAuthor`, `FeedCategory`, `FeedImage`, `FeedMeta`, etc.

## Error Handling

The parser provides specific error messages for common issues:

- "RSS feed is invalid format" - When the XML doesn't contain an RSS element
- "Channel not found in RSS feed" - When no channel element is present in RSS 2.0 feeds

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.