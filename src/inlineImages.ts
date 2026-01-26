import fs from 'node:fs/promises';
import path from 'node:path';
import { type PostmarkAttachment } from './postmark.js';

export type InlineImageSpec = {
  filePath: string;
  contentId: string;
  contentType: string;
  name: string;
};

// flag format: ./path/to.png=cid,contentType,name
export function parseInlineImageFlag(flag: string): InlineImageSpec {
  const [filePath, rest] = flag.split('=');
  if (!filePath || !rest) throw new Error(`Invalid --inline-image value: ${flag}`);

  const parts = rest.split(',');
  const contentId = (parts[0] ?? '').trim();
  const contentType = (parts[1] ?? 'image/png').trim();
  const name = (parts[2] ?? path.basename(filePath)).trim();

  if (!contentId) throw new Error(`Invalid --inline-image (missing contentId): ${flag}`);

  return { filePath, contentId, contentType, name };
}

export async function inlineImageToAttachment(spec: InlineImageSpec): Promise<PostmarkAttachment> {
  const data = await fs.readFile(spec.filePath);
  return {
    Name: spec.name,
    Content: data.toString('base64'),
    ContentType: spec.contentType,
    ContentID: `cid:${spec.contentId}`
  };
}
