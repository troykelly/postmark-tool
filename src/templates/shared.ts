export type RemoteImage = {
  kind: 'remote';
  url: string;
  alt: string;
  width?: number;
  height?: number;
};

export type InlineImage = {
  kind: 'inline';
  contentId: string; // referenced as cid:contentId
  alt: string;
  width?: number;
  height?: number;
};

export type TemplateImage = RemoteImage | InlineImage;

export function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function safeUrl(url: string): string {
  // Basic safety: allow http(s) only.
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return '#';
    return u.toString();
  } catch {
    return '#';
  }
}

export function renderImg(img: TemplateImage): string {
  const alt = escapeHtml(img.alt);
  const width = img.width ? ` width=\"${img.width}\"` : '';
  const height = img.height ? ` height=\"${img.height}\"` : '';
  const src = img.kind === 'remote' ? safeUrl(img.url) : `cid:${escapeHtml(img.contentId)}`;

  // Inline style for email clients.
  return `<img src=\"${src}\" alt=\"${alt}\"${width}${height} border=\"0\" style=\"display:block;max-width:100%;height:auto;\" />`;
}

export function joinTextLines(lines: Array<string | undefined | null>): string {
  return lines.filter((l): l is string => typeof l === 'string' && l.trim().length > 0).join('\n');
}
