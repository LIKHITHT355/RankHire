import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

function mailConfig() {
  return {
    host: process.env.MAIL_IMAP_HOST,
    port: Number(process.env.MAIL_IMAP_PORT),
    secure: process.env.MAIL_IMAP_SECURE === "true",
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_APP_PASSWORD },
  };
}

function cleanText(html = "") {
  return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/\s+\n/g, "\n").trim();
}

async function withMailbox(work) {
  const client = new ImapFlow({ ...mailConfig(), logger: false });
  let lock;
  client.on("error", () => {});
  try {
    await client.connect();
    lock = await client.getMailboxLock(process.env.MAIL_FOLDER, { readOnly: true });
    return await work(client);
  } finally {
    if (lock) lock.release();
    if (client.usable) await client.logout();
  }
}

function address(from) {
  const item = from?.[0];
  return { name: item?.name || "", address: item?.address || "" };
}

export async function listInbox() {
  const limit = Math.max(1, Number(process.env.MAIL_FETCH_LIMIT) || 20);
  return withMailbox(async (client) => {
    const total = client.mailbox.exists;
    if (!total) return [];
    const messages = [];
    for await (const email of client.fetch(`${Math.max(1, total - limit + 1)}:*`, { uid: true, envelope: true })) {
      messages.push({
        uid: email.uid,
        messageId: email.envelope?.messageId || `uid:${email.uid}`,
        subject: email.envelope?.subject || "",
        from: address(email.envelope?.from),
        date: email.envelope?.date || null,
      });
    }
    return messages.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  });
}

export async function getEmail(uid) {
  return withMailbox(async (client) => {
    const email = await client.fetchOne(uid, { uid: true, envelope: true, source: true }, { uid: true });
    if (!email?.source) return null;
    const parsed = await simpleParser(email.source);
    return {
      uid: email.uid,
      messageId: parsed.messageId || email.envelope?.messageId || `uid:${email.uid}`,
      subject: parsed.subject || email.envelope?.subject || "",
      from: address(parsed.from?.value || email.envelope?.from),
      date: parsed.date || email.envelope?.date || null,
      text: parsed.text || cleanText(parsed.html || ""),
    };
  });
}
