import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { embedImagesForAlert } from '../src/embedImages.js';

describe('embedImages', () => {
  const origFetch = globalThis.fetch;

  beforeEach(() => {
    // @ts-ignore - test override
    globalThis.fetch = vi.fn(async () => {
      return new Response(new Uint8Array([1, 2, 3, 4]), {
        status: 200,
        headers: { 'content-type': 'image/png' }
      });
    });
  });

  afterEach(() => {
    globalThis.fetch = origFetch;
  });

  it('converts remote alert image to inline attachment', async () => {
    const attachments: any[] = [];
    const input: any = {
      title: 'Test',
      urgencyLabel: 'Breaking',
      summary: 'Summary',
      image: { kind: 'remote', url: 'https://example.com/a.png?x=1&y=2', alt: 'alt', width: 560 },
      links: [{ title: 'x', url: 'https://example.com' }],
      footer: { unsubscribeHint: 'You are receiving this because you asked for it.', signature: 'Sig' }
    };

    const out = await embedImagesForAlert(input, attachments);
    expect(out.image).toBeTruthy();
    expect(out.image!.kind).toBe('inline');
    expect(attachments.length).toBe(1);
    expect(attachments[0].ContentType).toBe('image/png');
    expect(attachments[0].ContentID).toMatch(/^cid:img-/);
  });
});
