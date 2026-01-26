import fs from 'node:fs/promises';

export type PostmarkAttachment = {
  Name: string;
  Content: string; // base64
  ContentType: string;
  ContentID?: string;
};

export type SendEmailRequest = {
  From: string;
  To: string;
  Subject: string;
  HtmlBody: string;
  TextBody: string;
  ReplyTo?: string;
  Tag?: string;
  MessageStream?: string;
  Attachments?: PostmarkAttachment[];
};

export async function readDefaultToken(): Promise<string | null> {
  const env = process.env.POSTMARK_TOKEN;
  if (env && env.trim().length > 0) return env.trim();

  try {
    const raw = await fs.readFile('/home/clawdbot/.postmark_transactional_token', 'utf8');
    const token = raw.trim();
    return token.length > 0 ? token : null;
  } catch {
    return null;
  }
}

export async function sendPostmarkEmail(token: string, req: SendEmailRequest): Promise<{ MessageID: string; To: string; SubmittedAt: string }>{
  const res = await fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': token
    },
    body: JSON.stringify(req)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Postmark API error: ${res.status} ${res.statusText}: ${text}`);
  }

  return await res.json() as any;
}
