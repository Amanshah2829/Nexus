
import { NextResponse } from 'next/server';
import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import User from '@/app/models/User';
import dbConnect from '@/app/lib/db';
import { decrypt } from '@/app/lib/crypto';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

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
      tls: true,
      authTimeout: 3000,
      tlsOptions: { rejectUnauthorized: false }
    };
}

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
    if (!entry) return name; 

    if (isGmail && entry.gmail) {
        return entry.gmail;
    }
    
    if(lowerName === 'sent' && !isGmail) return 'Sent Items';

    return entry.default;
};


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subjectQuery = searchParams.get('subject');

  if (!subjectQuery) {
    return NextResponse.json({ message: 'Subject query is required' }, { status: 400 });
  }

  let connection: imaps.ImapSimple | undefined;

  try {
    const config = await getUserEmailConfig();
    
    connection = await imaps.connect({ imap: config });

    const mailboxesToSearch = ['INBOX', getBoxName('sent', config.host)];
    let allEmails: any[] = [];

    for (const boxName of mailboxesToSearch) {
        try {
            await connection.openBox(boxName);
            
            const searchCriteria = [['SUBJECT', subjectQuery]];
            const fetchOptions = {
                bodies: [''],
                markSeen: false,
            };

            const messages = await connection.search(searchCriteria, fetchOptions);

            const emails = await Promise.all(
                messages.map(async (item) => {
                    const all = item.parts.find((part) => part.which === '');
                    const id = item.attributes.uid;
                    const mail = await simpleParser(all!.body);
                    return {
                        id: `${boxName}-${id}`,
                        from: mail.from?.text || '',
                        to: mail.to?.text || '',
                        subject: mail.subject || '',
                        text: mail.text || '',
                        html: mail.html || mail.textAsHtml || '',
                        date: mail.date,
                        attachments: mail.attachments,
                        messageId: mail.messageId,
                        references: mail.references,
                        inReplyTo: mail.inReplyTo,
                    };
                })
            );
            allEmails.push(...emails);
        } catch (boxError) {
            console.error(`Could not open or search in mailbox ${boxName}:`, boxError);
        }
    }
    
    // Sort all collected emails by date
    const sortedEmails = allEmails.sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
    
    return NextResponse.json(sortedEmails);
  } catch (error) {
    console.error(`Failed to search emails:`, error);
    return NextResponse.json({ message: `Failed to search emails` }, { status: 500 });
  } finally {
    if (connection && connection.state !== 'disconnected') {
      connection.end();
    }
  }
}
