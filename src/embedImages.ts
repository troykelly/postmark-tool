import crypto from 'node:crypto';
import { type PostmarkAttachment } from './postmark.js';
import { type TemplateImage } from './templates/shared.js';
import { type DailyDigestInput } from './templates/digest.js';
import { type BreakingAlertInput } from './templates/alert.js';

function guessContentType(url: string, header: string | null): string {
  const h = (header ?? '').toLowerCase();
  if (h.includes('image/')) return header as string;

  const u = url.toLowerCase();
  if (u.endsWith('.png')) return 'image/png';
  if (u.endsWith('.webp')) return 'image/webp';
  if (u.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

function guessName(contentType: string): string {
  if (contentType === 'image/png') return 'image.png';
  if (contentType === 'image/webp') return 'image.webp';
  if (contentType === 'image/gif') return 'image.gif';
  return 'image.jpg';
}

async function remoteToInline(
  img: Extract<TemplateImage, { kind: 'remote' }>,
  label: string,
  attachments: PostmarkAttachment[],
  fetchTimeoutMs = 8000
): Promise<TemplateImage | null> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), fetchTimeoutMs);

  try {
    const res = await fetch(img.url, { signal: ac.signal });
    if (!res.ok) return null;

    const contentType = guessContentType(img.url, res.headers.get('content-type'));
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0) return null;

    // deterministic-ish content id based on content, plus label to reduce collisions
    const hash = crypto.createHash('sha256').update(buf).update(label).digest('hex').slice(0, 16);
    const contentId = `img-${hash}`;

    attachments.push({
      Name: guessName(contentType),
      Content: buf.toString('base64'),
      ContentType: contentType,
      ContentID: `cid:${contentId}`
    });

    return {
      kind: 'inline',
      contentId,
      alt: img.alt,
      width: img.width,
      height: img.height
    };
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function ensureInline(
  img: TemplateImage | undefined,
  label: string,
  attachments: PostmarkAttachment[]
): Promise<TemplateImage | undefined> {
  if (!img) return undefined;
  if (img.kind === 'inline') return img;
  const converted = await remoteToInline(img, label, attachments);
  return converted ?? undefined;
}

export async function embedImagesForDigest(
  input: DailyDigestInput,
  attachments: PostmarkAttachment[]
): Promise<DailyDigestInput> {
  const out: DailyDigestInput = { ...input };

  out.headerImage = await ensureInline(out.headerImage, 'digest-header', attachments);

  out.top5 = await Promise.all(
    out.top5.map(async (it, idx) => {
      const image = await ensureInline(it.image, `digest-top5-${idx}`, attachments);
      return { ...it, image };
    })
  );

  out.quickScan = await Promise.all(
    out.quickScan.map(async (it, idx) => {
      const image = await ensureInline(it.image, `digest-quick-${idx}`, attachments);
      return { ...it, image };
    })
  );

  return out;
}

export async function embedImagesForAlert(
  input: BreakingAlertInput,
  attachments: PostmarkAttachment[]
): Promise<BreakingAlertInput> {
  const out: BreakingAlertInput = { ...input };
  out.image = await ensureInline(out.image, 'alert-image', attachments);
  return out;
}
