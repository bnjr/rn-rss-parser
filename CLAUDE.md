# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development Commands
- `npm test` - Run Jest tests with coverage
- `npm run build` - Build TypeScript to dist/ folder using tsconfig.build.json
- `npm run type-check` - Run TypeScript compiler without emitting files
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run clean` - Remove dist/ and coverage/ directories

### Pre-publish
- `npm run prepublishOnly` - Runs tests and build (automatically called before npm publish)

## Architecture

This is a TypeScript library for parsing RSS and Atom feeds in React Native and JavaScript environments.

### Core Structure
- **Entry Point**: `src/index.ts` exports the main `parseFeed` function and all model classes
- **Parser**: `src/parsers/modern-feed-parser.ts` contains the main `parseFeed()` function that auto-detects feed type (RSS 1.0, RSS 2.0, or Atom) and returns appropriate feed objects
- **Models**: Abstract base classes in `src/models/` with concrete implementations:
  - `BaseFeed` - Abstract base class for all feeds
  - `FeedItem` - Abstract base class for all feed items  
  - `Rss2Feed` - RSS 2.0 feed implementation
  - `AtomFeed` - Atom feed implementation
  - `RssFeedItem` - RSS item implementation
  - `AtomFeedItem` - Atom item implementation

### Feed Detection Logic
The parser uses DOM parsing with `@xmldom/xmldom` and detects feed types by:
1. Looking for `<feed>` element (Atom feeds)
2. Looking for `<rss>` element (RSS 2.0)
3. Looking for `<RDF>` element (RSS 1.0, parsed as RSS 2.0 with version override)

### Dependencies
- Uses `xml2js` and `@xmldom/xmldom` for XML parsing
- Supports Dublin Core (DC) and iTunes podcast extensions
- React Native compatible (no Node.js specific dependencies)

### Testing
- Tests are in `src/test/` with sample feeds in `src/test/samples/`
- Uses Jest with snapshot testing for feed parsing validation
- Real-world feed samples included for testing edge cases

## Development Setup

### Using Local Package in Examples
When working with the Expo example app, the local package is linked using `npm install ../..` from the examples/expo-example directory. This creates a symlink to the local development version.

**Important**: After linking the local package, you must update the Metro configuration to properly resolve the package:

1. The `metro.config.js` file in examples/expo-example includes:
   - `watchFolders` pointing to the root directory (`../../`)
   - `nodeModulesPaths` including both local and parent node_modules

2. Always restart Expo with `--clear` flag after linking: `npx expo start --clear`

3. If you get "Unable to resolve" errors, ensure:
   - The package is built: `npm run build` in the root directory
   - The package is properly linked: `npm install ../..` in the example directory
   - Metro config includes the watchFolders and nodeModulesPaths settings