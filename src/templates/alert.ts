import { escapeHtml, joinTextLines, renderImg, safeUrl, type TemplateImage } from './shared.js';

export type AlertFooter = {
  unsubscribeHint: string;
  signature: string;
};

export type AlertLink = {
  title: string;
  url: string;
};

export type BreakingAlertInput = {
  title: string;
  urgencyLabel: string;
  summary: string;
  bullets?: string[];
  image?: TemplateImage;
  links: AlertLink[];
  footer: AlertFooter;
};

export function renderBreakingAlert(input: BreakingAlertInput): { html: string; text: string } {
  const maxWidth = 600;
  const preheader = input.summary;

  const imgHtml = input.image
    ? `<div style=\"padding:0 0 12px 0;\">${renderImg(input.image)}</div>`
    : '';

  const bulletsHtml = (input.bullets && input.bullets.length > 0)
    ? `<div style=\"padding:10px 0;\">
        <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"font-size:14px;line-height:20px;\">
          ${input.bullets.map((b) => `<tr><td style=\"padding:4px 0;\">• ${escapeHtml(b)}</td></tr>`).join('')}
        </table>
      </div>`
    : '';

  const linksHtml = input.links.map((l) => {
    const title = escapeHtml(l.title);
    const url = safeUrl(l.url);
    return `<tr><td style=\"padding:6px 0;\">• <a href=\"${url}\" style=\"color:#0b57d0;text-decoration:underline;\">${title}</a></td></tr>`;
  }).join('');

  const html = `<!doctype html>
<html xmlns=\"http://www.w3.org/1999/xhtml\">
<head>
  <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
  <meta name=\"x-apple-disable-message-reformatting\" />
  <title>${escapeHtml(input.title)}</title>
</head>
<body style=\"margin:0;padding:0;background-color:#0b1220;\">
  <div style=\"display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;\">${escapeHtml(preheader)}</div>

  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"background-color:#0b1220;\">
    <tr>
      <td align=\"center\" style=\"padding:16px 10px;\">
        <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"max-width:${maxWidth}px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:8px;\">
          <tr>
            <td style=\"padding:18px;font-family:Arial,Helvetica,sans-serif;color:#111827;\">
              ${imgHtml}
              <div style=\"font-size:12px;line-height:16px;color:#b91c1c;font-weight:700;text-transform:uppercase;\">${escapeHtml(input.urgencyLabel)}</div>
              <div style=\"font-size:22px;line-height:28px;font-weight:800;padding-top:6px;\">Breaking alert</div>
              <div style=\"font-size:16px;line-height:22px;font-weight:700;padding-top:6px;\">${escapeHtml(input.title)}</div>
              <div style=\"font-size:14px;line-height:20px;padding-top:10px;\">${escapeHtml(input.summary)}</div>

              ${bulletsHtml}

              <div style=\"font-size:16px;line-height:22px;font-weight:800;padding:12px 0 6px 0;\">Related links</div>
              <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"font-size:14px;line-height:20px;\">
                ${linksHtml}
              </table>

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

  const text = joinTextLines([
    'Breaking alert',
    `${input.urgencyLabel}: ${input.title}`,
    '',
    input.summary,
    ...(input.bullets && input.bullets.length > 0 ? ['', 'Details', ...input.bullets.map((b) => `- ${b}`)] : []),
    '',
    'Quick scan',
    ...input.links.map((l) => `- ${l.title} — ${l.url}`),
    '',
    'Footer',
    input.footer.unsubscribeHint,
    input.footer.signature
  ]);

  return { html, text };
}
