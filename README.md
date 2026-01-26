# postmark-tool

CLI + renderer for elegant, email-client-compliant Postmark emails:

- Daily news digest
- Breaking news alert

Defaults:
- Token: `/home/clawdbot/.postmark_transactional_token`
- From: `news.updates@execdesk.ai`
- Reply-To: `quasar@execdesk.ai`

## Install

```bash
pnpm install
pnpm build
node dist/cli.js --help
```

Or run in dev:

```bash
pnpm dev --help
```

## Usage

### Send a daily digest

```bash
postmark-tool digest \
  --to troy@troykelly.com --to me@mattyjcompton.com \
  --subject "Daily News Digest" \
  --input examples/digest.json
```

### Send a breaking alert

```bash
postmark-tool alert \
  --to troy@troykelly.com --to me@mattyjcompton.com \
  --subject "Breaking: Something happened" \
  --input examples/alert.json
```

### Dry-run (render only)

```bash
postmark-tool digest --input examples/digest.json --dry-run
```

### Inline images

Inline images are sent as Postmark attachments with a ContentID and can be referenced in HTML as `cid:...`.

```bash
postmark-tool digest \
  --to troy@troykelly.com \
  --subject "Daily News Digest" \
  --input examples/digest.json \
  --inline-image ./examples/logo.png=logo.png,image/png,execdesk-logo
```

## Input formats

See `examples/` for JSON schemas-in-practice.

## CI

GitHub Actions runs typecheck, lint, test, and build.

