import * as rssParser from '../index';

// Import feed XML samples directly as CommonJS
const reuters = require('./samples/reuters');

describe('when parse reuters', () => {
  describe('valid document', () => {
    it('should return feed items', async () => {
      const result = rssParser.parseFeed(reuters.feed);

      expect(result.title).toBe('Reuters: World News');
      expect(result.url).toBe('http://www.reuters.com');
      expect(result.description).toBe(
        "Reuters.com is your source for breaking news, business, financial and investing news, including personal finance and stocks.  Reuters is the leading global provider of news, financial information and technology solutions to the world's media, financial institutions, businesses and individuals.",
      );
      // Note: image property not currently implemented in model
      expect(result.language).toBe('en-us');
      expect(result.copyright).toBe(
        'All rights reserved. Users may download and print extracts of content from this website for their own personal and non-commercial use only. Republication or redistribution of Reuters content, including by framing or similar means, is expressly prohibited without the prior written consent of Reuters. Reuters and the Reuters sphere logo are registered trademarks or trademarks of the Reuters group of companies around the world. © Reuters 2018',
      );
      expect(result.items.length).toBe(10);
      expect(result.items[0].title).toBe(
        'U.S. general says North Korea not demonstrated all components of ICBM',
      );
      expect(result.items[0].categories?.length || result.items[0].categories.length).toBe(1);
      expect(result.items[0].categories[0].term).toBe('worldNews');
      expect(result.items[1].title).toBe(
        "Publication of Russia 'oligarch list' may affect investors: group",
      );
      expect(result.items[1].categories?.length || result.items[1].categories.length).toBe(1);
      expect(result.items[1].categories[0].term).toBe('worldNews');
      expect(result).toMatchSnapshot();
    });
  });
});
