// filepath: /Users/sahil/Documents/Development/rn-rss-parser/src/test/samples/real-world-feed-samples.ts
// This file contains sample XML content from real-world feeds

export const realWorldFeedSamples = {
  fyiCenterAtom: `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en-US">
  <title>FYI Center for Software Developers</title>
  <link href="http://dev.fyicenter.com/" />
  <link rel="self" type="application/atom+xml" href="http://dev.fyicenter.com/atom_xml.php" />
  <id>http://dev.fyicenter.com/</id>
  <author>
    <name>FYIcenter.com</name>
  </author>
  <updated>2022-03-31T00:00:00Z</updated>
  <entry>
    <title>What Is SSO (Single Sign-On)?</title>
    <link href="http://dev.fyicenter.com/Interview-Questions/SSO-Single-Sign-On/What_Is_SSO_Single_Sign-On_.html" />
    <id>http://dev.fyicenter.com/Interview-Questions/SSO-Single-Sign-On/What_Is_SSO_Single_Sign-On_.html</id>
    <author><name>FYIcenter.com</name></author>
    <updated>2022-03-31T00:00:00Z</updated>
    <content type="html">SSO (Single Sign-On) is an access control mechanism that allows you to access multiple systems with a single login credential and session.</content>
  </entry>
  <entry>
    <title>What Is JWT (JSON Web Token)?</title>
    <link href="http://dev.fyicenter.com/Interview-Questions/JWT-JSON-Web-Token/What_Is_JWT_JSON_Web_Token_.html" />
    <id>http://dev.fyicenter.com/Interview-Questions/JWT-JSON-Web-Token/What_Is_JWT_JSON_Web_Token_.html</id>
    <author><name>FYIcenter.com</name></author>
    <updated>2022-03-29T00:00:00Z</updated>
    <content type="html">JWT (JSON Web Token) is an open standard that defines a way of securely transmitting JSON objects between parties.</content>
  </entry>
</feed>`,

  mastodonRSS: `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:webfeeds="http://webfeeds.org/rss/1.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Mastodon User Feed</title>
    <description>A public Mastodon feed</description>
    <link>https://mastodon.social/@Username</link>
    <webfeeds:icon>https://mastodon.social/avatars/original/missing.png</webfeeds:icon>
    <item>
      <title>Sample Mastodon Post</title>
      <link>https://mastodon.social/@Username/post1</link>
      <pubDate>Wed, 26 Jan 2022 21:49:59 +0000</pubDate>
      <description>This is a sample mastodon post with some content</description>
      <guid isPermaLink="true">https://mastodon.social/@Username/post1</guid>
    </item>
    <item>
      <title>Another Mastodon Post</title>
      <link>https://mastodon.social/@Username/post2</link>
      <pubDate>Tue, 25 Jan 2022 19:22:32 +0000</pubDate>
      <description>This is another sample mastodon post with some more content</description>
      <guid isPermaLink="true">https://mastodon.social/@Username/post2</guid>
    </item>
  </channel>
</rss>`,
};
