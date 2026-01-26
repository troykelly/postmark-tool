# Contributing

Thanks for contributing!

## Development

Requirements:
- Node.js >= 20
- pnpm

```bash
pnpm install
pnpm test
pnpm lint
pnpm build
```

## Adding/adjusting templates

Templates live in `src/templates/` and are designed to be email-client compatible (Gmail, Outlook, iOS Mail). Prefer:
- table-based layout
- inline styles
- conservative CSS

Avoid relying on modern CSS features (grid, flex, `position: sticky`, etc.).

## Secrets

Never commit tokens. The CLI reads Postmark token from:
- `--token`, or
- `POSTMARK_TOKEN`, or
- `/home/clawdbot/.postmark_transactional_token`

