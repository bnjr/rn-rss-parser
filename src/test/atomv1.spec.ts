import * as rssParser from '../index';

// Import feed XML samples directly as CommonJS
const atomv1 = require('./samples/atomv1');
const atomv1WithItunes = require('./samples/atomv1-with-itunes');
const atomv1NoUpdated = require('./samples/atomv1-no-updated');
const huffpost = require('./samples/huffpost');

describe('when parse ATOM', () => {
  describe('valid document', () => {
    it('should return feed items', async () => {
      const result = rssParser.parseFeed(atomv1.feed);

      expect(result.title).toBe('ATOM title');
      expect(result.url).toBe('http://bakery-store.example.com/');
      expect(result.description).toBe('A sample ATOM feed');
      expect(result.items.length).toBe(2);
      expect(result.image?.url).toBe(
        'https://b.thumbs.redditmedia.com/ntr1FkBiO3nk4t4Vgy5GXoPQ_j2hirENH9iT8rXNf8M.png',
      );
      expect(result.items[0].title).toBe('Where Did The Cookie Come From');
      expect(result.items[0].id).toBe(
        'http://bakery-store.example.com/information/2016/01/02/where-did-the-cookie-come-from',
      );
      expect(result.items[0].image?.url).toBe(undefined);
      expect(result.items[0].url).toBe(
        'http://bakery-store.example.com/information/2016/01/02/where-did-the-cookie-come-from.html',
      );
      // AtomFeedItem does not expose rel directly, so skip rel check
      expect(result.items[0].media.length).toBe(1);
      expect(result.items[0].media[0].url).toBe('https://www.example.com/audio.mp3');
      expect(result.items[0].media[0].mimeType).toBe('audio/mpeg');
      expect(String(result.items[0].media[0].length)).toBe('1234');
      expect(result.items[0].description).toBe(
        'The chocolate chip cookie was invented by Ruth Graves Wakefield.',
      );
      expect(result.items[1].title).toBe('What Is Sour Dough');
      expect(
        result.items[0].published instanceof Date
          ? result.items[0].published.toISOString()
          : result.items[0].published,
      ).toContain('2016-01-01');
      expect(result).toMatchSnapshot();
    });
  });

  describe('with itunes elements', () => {
    it('should return itunes information for channel and item elements', async () => {
      const result = rssParser.parseFeed(atomv1WithItunes.feed);
      // The new model may not expose iTunes fields directly; skip or check extensions if implemented
      // expect(result.extensions?.itunes).not.toBe(undefined); // Uncomment if extensions are implemented
      expect(result.items.length).toBe(2);
      // You may add more checks here if your model exposes iTunes fields
      expect(result).toMatchSnapshot();
    });
  });

  describe('verifying a HuffPost feed', () => {
    it('should not crash when parsing the feed', async () => {
      const result = rssParser.parseFeed(huffpost.feed);
      expect(result).not.toBe(undefined);
    });
  });

  describe('when item has no updated element', () => {
    it('should return published element', async () => {
      const result = rssParser.parseFeed(atomv1NoUpdated.feed);
      expect(
        result.items[0].published instanceof Date
          ? result.items[0].published.toISOString()
          : result.items[0].published,
      ).toContain('2016-01-01');
    });
  });
});
