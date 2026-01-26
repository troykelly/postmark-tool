import { describe, it, expect } from 'vitest';
import { renderDailyDigest } from '../src/templates/digest.js';

describe('renderDailyDigest', () => {
  it('includes required sections in HTML and text', () => {
    const { html, text } = renderDailyDigest({
      dateLabel: '2026-01-26',
      title: 'Daily News Digest',
      intro: 'Here are today\'s highlights.',
      top5: [
        { title: 'Story One', url: 'https://example.com/1', source: 'Example', timeLabel: '09:00' },
        { title: 'Story Two', url: 'https://example.com/2', source: 'Example', timeLabel: '09:10' },
        { title: 'Story Three', url: 'https://example.com/3', source: 'Example', timeLabel: '09:20' },
        { title: 'Story Four', url: 'https://example.com/4', source: 'Example', timeLabel: '09:30' },
        { title: 'Story Five', url: 'https://example.com/5', source: 'Example', timeLabel: '09:40' }
      ],
      quickScan: [
        { title: 'Quick item', url: 'https://example.com/q', source: 'Example' }
      ],
      excerpts: [
        { title: 'Cached excerpt', url: 'https://example.com/e', excerpt: 'This is an excerpt.' }
      ],
      footer: {
        unsubscribeHint: 'You are receiving this because you asked for it.',
        signature: 'ExecDesk News Updates'
      }
    });

    expect(html).toContain('Top 5');
    expect(html).toContain('Quick scan');
    expect(html).toContain('Cached excerpts');
    expect(html).toContain('Footer');

    expect(text).toContain('Top 5');
    expect(text).toContain('Quick scan');
    expect(text).toContain('Cached excerpts');
    expect(text).toContain('Footer');
  });
});
