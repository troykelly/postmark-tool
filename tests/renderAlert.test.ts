import { describe, it, expect } from 'vitest';
import { renderBreakingAlert } from '../src/templates/alert.js';

describe('renderBreakingAlert', () => {
  it('includes required sections in HTML and text', () => {
    const { html, text } = renderBreakingAlert({
      title: 'Breaking News',
      urgencyLabel: 'Breaking',
      summary: 'A short summary of what happened.',
      bullets: [
        'Key point one',
        'Key point two'
      ],
      links: [
        { title: 'Read more', url: 'https://example.com/breaking' }
      ],
      footer: {
        unsubscribeHint: 'You are receiving this because you asked for it.',
        signature: 'ExecDesk News Updates'
      }
    });

    expect(html).toContain('Breaking alert');
    expect(html).toContain('Quick scan');
    expect(html).toContain('Footer');

    expect(text).toContain('Breaking alert');
    expect(text).toContain('Quick scan');
    expect(text).toContain('Footer');
  });
});
