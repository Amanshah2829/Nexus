
import { NextResponse, NextRequest } from 'next/server';
import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import dbConnect from '@/app/lib/db';
import User from '@/app/models/User';
import { decrypt } from '@/app/lib/crypto';
import { cookies } from 'next/headers';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

const getBoxName = (name: string, host: string) => {
    const lowerName = name.toLowerCase();
    const isGmail = host.toLowerCase().includes('gmail');

    const map: { [key: string]: { default: string; gmail?: string } } = {
        inbox: { default: 'INBOX' },
        sent: { default: 'Sent', gmail: '[Gmail]/Sent Mail' },
        drafts: { default: 'Drafts', gmail: '[Gmail]/Drafts' },
        trash: { default: 'Trash', gmail: '[Gmail]/Trash' },
        spam: { default: 'Spam', gmail: '[Gmail]/Spam' },
    };

    const entry = map[lowerName];
    if (!entry) return name; // Return original name if not a special folder

    if (isGmail && entry.gmail) {
        return entry.gmail;
    }
    
    // For non-Gmail, we might have 'Sent Items' instead of 'Sent'.
    // A robust solution would involve listing mailboxes, but for now we try common names.
    if(lowerName === 'sent' && !isGmail) return 'Sent Items';


    return entry.default;
};

async function getUserEmailConfig() {
    await dbConnect();
    const sessionCookie = cookies().get('session');
    if (!sessionCookie) throw new Error('Not authenticated');

    const session = JSON.parse(sessionCookie.value);
    const userId = session.userId;
    if (!userId) throw new Error('Invalid session');

    const user = await User.findById(userId).select('+emailConfig');
    if (!user || !user.emailConfig) throw new Error('Email not configured for this user.');

    const { imapHost, imapPort, imapUser, imapPassword } = user.emailConfig;
    if (!imapHost || !imapPort || !imapUser || !imapPassword) {
        throw new Error('Incomplete IMAP configuration.');
    }
    
    return {
      user: imapUser,
      password: decrypt(imapPassword),
      host: imapHost,
      port: imapPort,
      tls: true, // Assuming TLS is always true for security
      authTimeout: 3000,
      tlsOptions: { rejectUnauthorized: false }
    };
}


export async function GET(request: NextRequest) {
  let connection: imaps.ImapSimple | undefined;

  try {
    const imapConfig = await getUserEmailConfig();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const mailbox = searchParams.get('mailbox') || 'inbox';
    const uid = searchParams.get('uid');
    
    const boxName = getBoxName(mailbox, imapConfig.host);

    
    connection = await imaps.connect({ imap: imapConfig });

    const box = await connection.openBox(boxName);

    if (uid) {
        // Fetch a single email's body
        const searchCriteria = [['UID', uid]];
        const fetchOptions = { bodies: [''], markSeen: true };
        const messages = await connection.search(searchCriteria, fetchOptions);

        if (messages.length === 0) {
            return NextResponse.json({ message: 'Email not found' }, { status: 404 });
        }

        const item = messages[0];
        const all = item.parts.find((part) => part.which === '');
        const mail = await simpleParser(all!.body);
        
        const email = {
          id: item.attributes.uid,
          from: mail.from?.text || '',
          subject: mail.subject || '',
          text: mail.text || '',
          html: mail.html || mail.textAsHtml || '',
          date: mail.date,
          attachments: mail.attachments,
          messageId: mail.messageId,
          references: mail.references,
          inReplyTo: mail.inReplyTo,
          seen: true, // It's seen now
        };
        connection.end();
        return NextResponse.json(email);
    }
    
    const totalEmails = box.messages.total;
    
    if (totalEmails === 0) {
      connection.end();
      return NextResponse.json({ emails: [], totalEmails: 0 });
    }

    const start = Math.max(1, totalEmails - (page * limit) + 1);
    const end = Math.min(totalEmails, totalEmails - ((page - 1) * limit));
    
    if (start > end) {
        connection.end();
        return NextResponse.json({ emails: [], totalEmails: 0 });
    }
    
    const searchCriteria = [`${start}:${end}`];
    const fetchOptions = {
      bodies: ['HEADER.FIELDS (FROM SUBJECT DATE MESSAGE-ID REFERENCES IN-REPLY-TO)', 'TEXT'],
      markSeen: false,
    };
    
    const messages = await connection.search(searchCriteria, fetchOptions);

    const emails = messages.map((item) => {
        const headerPart = item.parts.find(part => part.which === 'HEADER.FIELDS (FROM SUBJECT DATE MESSAGE-ID REFERENCES IN-REPLY-TO)');
        const header = headerPart?.body;

        if (!header || typeof header !== 'object') {
          return {
            id: item.attributes.uid,
            from: 'Unknown Sender',
            subject: 'No Subject',
            text: '',
            html: '',
            date: item.attributes.date,
            attachments: [],
            messageId: undefined,
            references: undefined,
            inReplyTo: undefined,
            seen: item.attributes.flags.includes('\\Seen'),
          };
        }
        
        const textPart = item.parts.find(part => part.which === 'TEXT');
        const snippet = textPart && typeof textPart.body === 'string' ? textPart.body.substring(0, 100) : '';
        
        const from = Array.isArray(header.from) && header.from.length > 0 ? header.from[0] : 'Unknown Sender';
        const subject = Array.isArray(header.subject) && header.subject.length > 0 ? header.subject[0] : 'No Subject';
        const date = Array.isArray(header.date) && header.date.length > 0 ? new Date(header.date[0]) : item.attributes.date;
        const messageId = Array.isArray(header['message-id']) && header['message-id'].length > 0 ? header['message-id'][0] : undefined;
        const references = header.references;
        const inReplyTo = header['in-reply-to'];

        return {
          id: item.attributes.uid,
          from: from,
          subject: subject,
          text: snippet, 
          html: '',
          date: date,
          attachments: [], // Cannot get attachments from headers only
          messageId: messageId,
          references: references,
          inReplyTo: inReplyTo,
          seen: item.attributes.flags.includes('\\Seen'),
        };
      });
    
    const sortedEmails = emails.sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
    
    return NextResponse.json({emails: sortedEmails, totalEmails});
  } catch (error: any) {
    console.error(`Failed to fetch emails:`, error);
    return NextResponse.json({ message: `Failed to fetch emails: ${error.message}` }, { status: 500 });
  } finally {
    if (connection && connection.state !== 'disconnected') {
      connection.end();
    }
  }
}
