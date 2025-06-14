import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Button,
} from 'react-native';
import { parseFeed, BaseFeed } from 'rn-rss-parser';
import * as RNRssParser from 'react-native-rss-parser';

export default function Index() {
  const [feed, setFeed] = useState<BaseFeed | RNRssParser.Feed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [feedUrl, setFeedUrl] = useState('https://feeds.bbci.co.uk/news/rss.xml');
  const [inputUrl, setInputUrl] = useState(feedUrl);
  const [parserType, setParserType] = useState<'inbuilt' | 'package'>('inbuilt');

  const fetchFeed = async (url: string) => {
    setLoading(true);
    setError(null);
    setSelectedIdx(null);
    try {
      const response = await fetch(url);
      const responseText = await response.text();
      let rssFeed;
      if (parserType === 'inbuilt') {
        rssFeed = parseFeed(responseText);
      } else {
        rssFeed = await RNRssParser.parse(responseText);
      }
      setFeed(rssFeed);
      setFeedUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch feed');
      setFeed(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(feedUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parserType]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading RSS feed...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  const items = feed?.items || [];
  const selectedItem = selectedIdx !== null ? items[selectedIdx] : null;

  return (
    <View style={{ flex: 1, flexDirection: 'column' }}>
      {/* Parser Switcher */}
      <View style={styles.parserSwitcherRow}>
        <TouchableOpacity
          style={[styles.parserButton, parserType === 'inbuilt' && styles.selectedParserButton]}
          onPress={() => setParserType('inbuilt')}
        >
          <Text style={parserType === 'inbuilt' ? styles.selectedParserText : styles.parserText}>
            In-built Parser
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.parserButton, parserType === 'package' && styles.selectedParserButton]}
          onPress={() => setParserType('package')}
        >
          <Text style={parserType === 'package' ? styles.selectedParserText : styles.parserText}>
            react-native-rss-parser
          </Text>
        </TouchableOpacity>
      </View>
      {/* Feed URL input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={inputUrl}
          onChangeText={setInputUrl}
          placeholder="Enter RSS/Atom feed URL"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Button
          title="Go"
          onPress={() => fetchFeed(inputUrl)}
          disabled={loading || !inputUrl.trim()}
        />
      </View>
      {/* Top half: Feed item list */}
      <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#ccc' }}>
        <Text style={styles.feedTitle}>{feed?.title || 'RSS Feed'}</Text>
        <ScrollView>
          {items.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.itemRow, selectedIdx === idx && styles.selectedItem]}
              onPress={() => setSelectedIdx(idx)}
            >
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text numberOfLines={1} style={styles.itemUrl}>
                {item.id}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* Bottom half: Item details */}
      <View style={{ flex: 1, padding: 16 }}>
        {selectedItem ? (
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Raw Item JSON:</Text>
            <Text
              style={{
                fontFamily: 'Courier',
                fontSize: 13,
                color: '#222',
                backgroundColor: '#f6f8fa',
                padding: 8,
                borderRadius: 6,
              }}
              selectable
            >
              {JSON.stringify(selectedItem, null, 2)}
            </Text>
          </ScrollView>
        ) : (
          <View style={styles.centered}>
            <Text style={{ color: '#888' }}>Select an item to see details</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginVertical: 12,
    alignSelf: 'center',
  },
  itemRow: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  selectedItem: {
    backgroundColor: '#e6f0ff',
  },
  itemTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemUrl: {
    color: '#666',
    fontSize: 13,
  },
  detailTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  detailUrl: {
    color: '#007aff',
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  detailValue: {
    fontWeight: 'normal',
    color: '#333',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafbfc',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  parserSwitcherRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f0f4f8',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  parserButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 6,
    backgroundColor: '#e0e7ef',
  },
  selectedParserButton: {
    backgroundColor: '#007aff',
  },
  parserText: {
    color: '#333',
    fontWeight: 'bold',
  },
  selectedParserText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
