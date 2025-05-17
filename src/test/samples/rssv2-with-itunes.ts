export const feed = `
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
    <channel>
        <title>All About Everything</title>
        <link>http://www.example.com/podcasts/everything/index.html</link>
        <language>en-us</language>
        <copyright>℗ &amp; © 2014 John Doe &amp; Family</copyright>
        <itunes:subtitle>A show about everything</itunes:subtitle>
        <itunes:author>John Doe</itunes:author>
        <itunes:summary>All About Everything is a show about everything. Each week we dive into any subject known to man and talk about it as much as we can. Look for our podcast in the Podcasts app or in the iTunes Store</itunes:summary>
        <description>All About Everything is a show about everything. Each week we dive into any subject known to man and talk about it as much as we can. Look for our podcast in the Podcasts app or in the iTunes Store</description>
        <itunes:owner>
            <itunes:name>John Doe</itunes:name>
            <itunes:email>john.doe@example.com</itunes:email>
        </itunes:owner>
        <itunes:image href="http://example.com/podcasts/everything/AllAboutEverything.jpg"/>
        <itunes:category text="Technology">
            <itunes:category text="Gadgets"/>
        </itunes:category>
        <itunes:category text="TV &amp; Film"/>
        <itunes:category text="Arts">
            <itunes:category text="Food"/>
        </itunes:category>
        <itunes:explicit>no</itunes:explicit>
        <itunes:complete>yes</itunes:complete>
        <itunes:new-feed-url>http://newlocation.com/example.rss</itunes:new-feed-url>
        <itunes:block>no</itunes:block>
        <item>
            <title>Socket Wrench Shootout</title>
            <itunes:author>John Doe</itunes:author>
            <itunes:subtitle>A short primer on table spices</itunes:subtitle>
            <itunes:summary>This week we talk about <a href="https://itunes/apple.com/us/book/antique-trader-salt-pepper/id429691295?mt=11">salt and pepper shakers</a>, comparing and contrasting pour rates, construction materials, and overall aesthetics. Come and join the party!</itunes:summary>
            <itunes:image href="http://example.com/podcasts/everything/AllAboutEverything/Episode1.jpg"/>
            <enclosure url="http://example.com/podcasts/everything/AllAboutEverythingEpisode3.m4a" length="8727310" type="audio/x-m4a"/>
            <guid>http://example.com/podcasts/archive/aae20140615.m4a</guid>
            <pubDate>Tue, 08 Mar 2016 12:00:00 GMT</pubDate>
            <itunes:duration>07:04</itunes:duration>
            <itunes:explicit>yes</itunes:explicit>
            <itunes:order>1</itunes:order>
            <itunes:block>yes</itunes:block>
        </item>
        <item>
            <title>Maple Syrup</title>
            <itunes:author>John Doe</itunes:author>
            <itunes:subtitle>Comparing socket wrenches is fun!</itunes:subtitle>
            <itunes:summary>This week we talk about metric vs. Old English socket wrenches. Which one is better? Do you really need both? Get all of your answers here.</itunes:summary>
            <itunes:image href="http://example.com/podcasts/everything/AllAboutEverything/Episode2.jpg"/>
            <enclosure url="http://example.com/podcasts/everything/AllAboutEverythingEpisode2.mp3" length="5650889" type="audio/mpeg"/>
            <guid>http://example.com/podcasts/archive/aae20140608.mp3</guid>
            <pubDate>Wed, 09 Mar 2016 13:00:00 EST</pubDate>
            <itunes:duration>04:34</itunes:duration>
            <itunes:explicit>no</itunes:explicit>
            <itunes:order>2</itunes:order>
            <itunes:block>no</itunes:block>
            <itunes:isClosedCaptioned>yes</itunes:isClosedCaptioned>
        </item>
        <item>
            <title>Red Leicester</title>
            <itunes:author>Jane Doe</itunes:author>
            <itunes:subtitle>Red Leicester is a cheese!</itunes:subtitle>
            <itunes:summary>This week we talk about Red Leicester cheese. It's a cheese!</itunes:summary>
            <itunes:image href="http://example.com/podcasts/everything/AllAboutEverything/Episode3.jpg"/>
            <enclosure url="http://example.com/podcasts/everything/AllAboutEverythingEpisode3.mp3" length="5650889" type="audio/mpeg"/>
            <guid>http://example.com/podcasts/archive/aae20140697.mp3</guid>
            <pubDate>Fri, 10 Mar 2016 13:00:00 EST</pubDate>
            <itunes:duration>03:45</itunes:duration>
            <itunes:explicit>no</itunes:explicit>
            <itunes:order>3</itunes:order>
            <itunes:block>no</itunes:block>
            <itunes:isClosedCaptioned>no</itunes:isClosedCaptioned>
        </item>
    </channel>
</rss>
`;
