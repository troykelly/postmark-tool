#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'node:fs/promises';
import { renderDailyDigest } from './templates/digest.js';
import { renderBreakingAlert } from './templates/alert.js';
import { inlineImageToAttachment, parseInlineImageFlag } from './inlineImages.js';
import { readDefaultToken, sendPostmarkEmail, type PostmarkAttachment } from './postmark.js';

// Defaults in the public repo use example addresses.
// Override via --from / --reply-to in real use.
const DEFAULT_FROM = 'News Updates <news@example.com>';
const DEFAULT_REPLY_TO = 'reply@example.com';

async function readJsonInput(inputPath?: string): Promise<any> {
  if (!inputPath || inputPath === '-') {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
    const raw = Buffer.concat(chunks).toString('utf8');
    return JSON.parse(raw);
  }

  const raw = await fs.readFile(inputPath, 'utf8');
  return JSON.parse(raw);
}

function collect(value: string, previous: string[]): string[] {
  return [...previous, value];
}

const program = new Command();
program
  .name('postmark-tool')
  .description('Send client-compliant Postmark emails (daily digest + breaking alerts).')
  .version('0.1.0');

function addCommonOptions(cmd: Command) {
  return cmd
    .requiredOption('--to <email>', 'Recipient (repeatable)', collect, [])
    .requiredOption('--subject <subject>', 'Email subject')
    .option('--from <email>', 'From address', DEFAULT_FROM)
    .option('--reply-to <email>', 'Reply-To address', DEFAULT_REPLY_TO)
    .option('--token <token>', 'Postmark server token (else POSTMARK_TOKEN or token file)')
    .option('--tag <tag>', 'Postmark tag')
    .option('--message-stream <stream>', 'Postmark MessageStream (optional)')
    .option('--inline-image <spec>', 'Inline image: filePath=contentId,contentType,name (repeatable)', collect, [])
    .option('--dry-run', 'Render only; do not send', false);
}

addCommonOptions(
  program
    .command('digest')
    .description('Send a daily news digest')
    .option('--input <path>', 'JSON input file (or - for stdin)', 'examples/digest.json')
    .action(async (opts) => {
      const input = await readJsonInput(opts.input);
      const rendered = renderDailyDigest(input);

      const inlineFlags: string[] = opts.inlineImage ?? [];
      const attachments: PostmarkAttachment[] = [];
      for (const f of inlineFlags) {
        const spec = parseInlineImageFlag(f);
        attachments.push(await inlineImageToAttachment(spec));
      }

      if (opts.dryRun) {
        process.stdout.write(rendered.text + '\n');
        process.stderr.write(`\n[dry-run] HTML length: ${rendered.html.length}\n`);
        return;
      }

      const token = (opts.token as string | undefined)?.trim() || await readDefaultToken();
      if (!token) throw new Error('No Postmark token provided. Use --token, POSTMARK_TOKEN, or /home/clawdbot/.postmark_transactional_token');

      const To = (opts.to as string[]).join(',');
      const resp = await sendPostmarkEmail(token, {
        From: opts.from,
        To,
        Subject: opts.subject,
        ReplyTo: opts.replyTo,
        HtmlBody: rendered.html,
        TextBody: rendered.text,
        Tag: opts.tag,
        MessageStream: opts.messageStream,
        Attachments: attachments.length > 0 ? attachments : undefined
      });

      process.stdout.write(JSON.stringify(resp, null, 2) + '\n');
    })
);

addCommonOptions(
  program
    .command('alert')
    .description('Send a breaking news alert')
    .option('--input <path>', 'JSON input file (or - for stdin)', 'examples/alert.json')
    .action(async (opts) => {
      const input = await readJsonInput(opts.input);
      const rendered = renderBreakingAlert(input);

      const inlineFlags: string[] = opts.inlineImage ?? [];
      const attachments: PostmarkAttachment[] = [];
      for (const f of inlineFlags) {
        const spec = parseInlineImageFlag(f);
        attachments.push(await inlineImageToAttachment(spec));
      }

      if (opts.dryRun) {
        process.stdout.write(rendered.text + '\n');
        process.stderr.write(`\n[dry-run] HTML length: ${rendered.html.length}\n`);
        return;
      }

      const token = (opts.token as string | undefined)?.trim() || await readDefaultToken();
      if (!token) throw new Error('No Postmark token provided. Use --token, POSTMARK_TOKEN, or /home/clawdbot/.postmark_transactional_token');

      const To = (opts.to as string[]).join(',');
      const resp = await sendPostmarkEmail(token, {
        From: opts.from,
        To,
        Subject: opts.subject,
        ReplyTo: opts.replyTo,
        HtmlBody: rendered.html,
        TextBody: rendered.text,
        Tag: opts.tag,
        MessageStream: opts.messageStream,
        Attachments: attachments.length > 0 ? attachments : undefined
      });

      process.stdout.write(JSON.stringify(resp, null, 2) + '\n');
    })
);

program.parseAsync(process.argv).catch((err) => {
  process.stderr.write(String(err?.stack ?? err) + '\n');
  process.exitCode = 1;
});
