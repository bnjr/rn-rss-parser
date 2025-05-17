import * as rssParser from '../index';

// Import feed XML samples directly as CommonJS
const rssv2 = require('./samples/rssv2');
const rssv2InvalidFormat = require('./samples/rssv2-invalid-format');
const rssv2MultipleCategories = require('./samples/rssv2-multiple-categories');
const rssv2InvalidNoChannel = require('./samples/rssv2-invalid-no-channel');
const rssv2WithItunes = require('./samples/rssv2-with-itunes');
const rssv2WithContent = require('./samples/rssv2-with-content');
const rssv2WithDc = require('./samples/rssv2-with-dc');

describe('when rss parse', () => {
  describe('valid document', () => {
    it('should return rss items', async () => {
      const result = await rssParser.parseFeed(rssv2.feed);

      expect(result.title).toBe('Scripting News');
      expect(result.description).toBe('A weblog about scripting and stuff like that.');
      expect(result.language).toBe('en-us');
      expect(result.copyright).toBe('Copyright 1997-2002 Dave Winer');
      expect(result.categories?.length || result.categories.length).toBe(1);
      expect(result.categories[0].term).toBe('1765');
      expect(result.image?.url).toBe('http://www.example.com/image.jpg');
      expect(result.image?.title).toBe('test image');
      expect(result.authors?.length || result.authors.length).toBe(1);
      expect(result.authors[0].name).toBe('dave@userland.com');
      expect(result.items.length).toBe(9);
      expect(result.items[0].id).toBe(
        'http://scriptingnews.userland.com/backissues/2002/09/29#When:6:56:02PM',
      );
      expect(result.items[0].media.length).toBe(1);
      expect(result.items[0].media[0].url).toBe(
        'http://www.scripting.com/mp3s/weatherReportSuite.mp3',
      );
      expect(String(result.items[0].media[0].length)).toBe('12216320');
      expect(result.items[0].media[0].mimeType).toBe('audio/mpeg');
      expect(result.items[0].content).toBe(null);
      expect(result).toMatchSnapshot();
    });
  });

  describe('multiple categories', () => {
    it('should return correct arrays when multiple groups with the same key', async () => {
      const result = await rssParser.parseFeed(rssv2MultipleCategories.feed);

      expect(result.categories?.length || result.categories.length).toBe(5);
      expect(result.categories[0].term).toBe('1765');
      expect(result.categories[1].term).toBe('1766');
      expect(result.items[0].categories?.length || result.items[0].categories.length).toBe(3);
      expect(result.items[0].categories[0].term).toBe('Grateful Dead');
      expect(result.items[0].categories[1].term).toBe('Dead');
      expect(result.items[0].categories[2].term).toBe('GD');
    });
  });

  describe('with itunes elements', () => {
    it('should return itunes information for channel and item elements', async () => {
      const result = await rssParser.parseFeed(rssv2WithItunes.feed);

      expect(result.items.length).toBe(3);
      expect(result).toMatchSnapshot();
    });
  });

  describe('with content', () => {
    it('should return content information for channel elements', async () => {
      const result = await rssParser.parseFeed(rssv2WithContent.feed);

      expect(result.items.length).toBe(2);
      expect(result.items[0].content).toBe(
        "<p>We don't need a referendum to leave the EU, we can just leave.</p>",
      );
    });
  });

  describe('with dc', () => {
    it('should return dc information for channel elements', async () => {
      const result = await rssParser.parseFeed(rssv2WithDc.feed);

      expect(result.authors?.length || result.authors.length).toBe(2);
      expect(result.authors[0].name).toBe('dave@userland.com (Dave Winer)');
      expect(result.items[0].authors?.length || result.items[0].authors.length).toBe(1);
      expect(result.items[0].authors[0].name).toBe('paul@userland.com (Paul Prescod)');
    });
  });

  describe('invalid document format', () => {
    it('should return parsing errors for format', async () => {
      try {
        await rssParser.parseFeed(rssv2InvalidFormat.feed);
        fail('Should not reach here');
      } catch (error: any) {
        expect(error.message).toBe('Could not determine feed type');
      }
    });
  });

  describe('invalid document no channel', () => {
    it('should return parsing errors for format', async () => {
      try {
        await rssParser.parseFeed(rssv2InvalidNoChannel.feed);
        fail('Should not reach here');
      } catch (error: any) {
        expect(error.message).toBe('Channel not found in RSS feed');
      }
    });
  });
});
