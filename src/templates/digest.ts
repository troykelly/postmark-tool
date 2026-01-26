import { escapeHtml, joinTextLines, renderImg, safeUrl, type TemplateImage } from './shared.js';

export type DigestItem = {
  title: string;
  url: string;
  source?: string;
  timeLabel?: string;
  summary?: string;
  image?: TemplateImage;
};

export type DigestExcerpt = {
  title: string;
  url: string;
  excerpt: string;
};

export type DigestFooter = {
  unsubscribeHint: string;
  signature: string;
};

export type DailyDigestInput = {
  dateLabel: string;
  title: string;
  intro?: string;
  headerImage?: TemplateImage;
  top5: DigestItem[];
  quickScan: DigestItem[];
  excerpts?: DigestExcerpt[];
  footer: DigestFooter;
};

export function renderDailyDigest(input: DailyDigestInput): { html: string; text: string } {
  const preheader = input.intro ?? 'Top stories and quick scan.';
  const maxWidth = 600;

  const headerImageHtml = input.headerImage
    ? `<tr><td style=\"padding:0 0 12px 0;\">${renderImg(input.headerImage)}</td></tr>`
    : '';

  const top5Rows = input.top5
    .slice(0, 5)
    .map((it, idx) => {
      const title = escapeHtml(it.title);
      const url = safeUrl(it.url);
      const meta = [it.source, it.timeLabel].filter(Boolean).join(' • ');
      const metaHtml = meta
        ? `<div style=\"font-size:12px;line-height:16px;color:#6b7280;padding-top:2px;\">${escapeHtml(meta)}</div>`
        : '';
      const imgHtml = it.image
        ? `<div style=\"padding:8px 0 0 0;\">${renderImg(it.image)}</div>`
        : '';
      const summaryHtml = it.summary
        ? `<div style=\"font-size:14px;line-height:20px;color:#111827;padding-top:6px;\">${escapeHtml(it.summary)}</div>`
        : '';

      return `
<tr>
  <td style=\"padding:10px 0;border-top:1px solid #e5e7eb;\">
    <div style=\"font-size:16px;line-height:22px;\"><strong>${idx + 1}.</strong> <a href=\"${url}\" style=\"color:#0b57d0;text-decoration:underline;\">${title}</a></div>
    ${metaHtml}
    ${summaryHtml}
    ${imgHtml}
  </td>
</tr>`;
    })
    .join('');

  const quickScanRows = input.quickScan.map((it) => {
    const title = escapeHtml(it.title);
    const url = safeUrl(it.url);
    const meta = [it.source, it.timeLabel].filter(Boolean).join(' • ');
    const metaHtml = meta ? ` <span style=\"color:#6b7280;\">(${escapeHtml(meta)})</span>` : '';
    return `<tr><td style=\"padding:6px 0;\">• <a href=\"${url}\" style=\"color:#0b57d0;text-decoration:underline;\">${title}</a>${metaHtml}</td></tr>`;
  });

  const excerptsHtml = (input.excerpts && input.excerpts.length > 0)
    ? `
<tr><td style=\"padding:18px 0 6px 0;\"><div style=\"font-size:18px;line-height:24px;font-weight:700;color:#111827;\">Cached excerpts</div></td></tr>
${input.excerpts.map((ex) => {
  const title = escapeHtml(ex.title);
  const url = safeUrl(ex.url);
  const excerpt = escapeHtml(ex.excerpt);
  return `
<tr>
  <td style=\"padding:10px 0;border-top:1px solid #e5e7eb;\">
    <div style=\"font-size:15px;line-height:21px;font-weight:700;\"><a href=\"${url}\" style=\"color:#111827;text-decoration:none;\">${title}</a></div>
    <div style=\"font-size:13px;line-height:19px;color:#374151;padding-top:6px;\">${excerpt}</div>
    <div style=\"font-size:12px;line-height:16px;color:#0b57d0;padding-top:6px;\"><a href=\"${url}\" style=\"color:#0b57d0;text-decoration:underline;\">Open story →</a></div>
  </td>
</tr>`;
}).join('')}`
    : '';

  const html = `<!doctype html>
<html xmlns=\"http://www.w3.org/1999/xhtml\">
<head>
  <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
  <meta name=\"x-apple-disable-message-reformatting\" />
  <title>${escapeHtml(input.title)}</title>
</head>
<body style=\"margin:0;padding:0;background-color:#0b1220;\">
  <!-- Preheader (hidden) -->
  <div style=\"display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;\">${escapeHtml(preheader)}</div>

  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"background-color:#0b1220;\">
    <tr>
      <td align=\"center\" style=\"padding:16px 10px;\">
        <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"max-width:${maxWidth}px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:8px;\">
          <tr>
            <td style=\"padding:18px 18px 8px 18px;font-family:Arial,Helvetica,sans-serif;color:#111827;\">
              ${headerImageHtml}
              <div style=\"font-size:20px;line-height:26px;font-weight:700;\">${escapeHtml(input.title)}</div>
              <div style=\"font-size:12px;line-height:16px;color:#6b7280;padding-top:4px;\">${escapeHtml(input.dateLabel)}</div>
              ${input.intro ? `<div style=\"font-size:14px;line-height:20px;color:#111827;padding-top:10px;\">${escapeHtml(input.intro)}</div>` : ''}
            </td>
          </tr>

          <tr>
            <td style=\"padding:8px 18px 18px 18px;font-family:Arial,Helvetica,sans-serif;color:#111827;\">
              <div style=\"font-size:18px;line-height:24px;font-weight:700;color:#111827;padding:8px 0;\">Top 5</div>
              <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\">
                ${top5Rows}
              </table>

              <div style=\"font-size:18px;line-height:24px;font-weight:700;color:#111827;padding:18px 0 6px 0;\">Quick scan</div>
              <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"font-size:14px;line-height:20px;\">
                ${quickScanRows.join('')}
              </table>

              ${excerptsHtml}

              <div style=\"padding-top:22px;border-top:1px solid #e5e7eb;\"></div>
              <div style=\"font-size:12px;line-height:18px;color:#6b7280;padding-top:10px;\">${escapeHtml(input.footer.unsubscribeHint)}</div>
              <div style=\"font-size:12px;line-height:18px;color:#6b7280;padding-top:6px;\">${escapeHtml(input.footer.signature)}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const textTop5 = input.top5.slice(0, 5).map((it, idx) => {
    const meta = [it.source, it.timeLabel].filter(Boolean).join(' • ');
    const metaText = meta ? ` (${meta})` : '';
    const summary = it.summary ? `\n   ${it.summary}` : '';
    return `${idx + 1}. ${it.title}${metaText}\n   ${it.url}${summary}`;
  });

  const textQuick = input.quickScan.map((it) => {
    const meta = [it.source, it.timeLabel].filter(Boolean).join(' • ');
    const metaText = meta ? ` (${meta})` : '';
    return `- ${it.title}${metaText} — ${it.url}`;
  });

  const textExcerpts = (input.excerpts && input.excerpts.length > 0)
    ? joinTextLines([
        '',
        'Cached excerpts',
        ...input.excerpts.map((ex) => joinTextLines([
          `- ${ex.title}`,
          `  ${ex.url}`,
          `  ${ex.excerpt}`
        ]))
      ])
    : '';

  const text = joinTextLines([
    input.title,
    input.dateLabel,
    input.intro,
    '',
    'Top 5',
    ...textTop5,
    '',
    'Quick scan',
    ...textQuick,
    textExcerpts,
    '',
    'Footer',
    input.footer.unsubscribeHint,
    input.footer.signature
  ]);

  return { html, text };
}
