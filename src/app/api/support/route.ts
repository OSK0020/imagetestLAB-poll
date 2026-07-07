import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, subject, message, userId } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save submission to Firestore database on the server side
    try {
      await addDoc(collection(db, 'support_tickets'), {
        name,
        email,
        subject,
        message,
        userId: userId || 'guest',
        createdAt: new Date()
      });
    } catch (dbErr: any) {
      console.error('Failed to write support ticket to Firestore:', dbErr);
      return NextResponse.json({ error: `Database write failed: ${dbErr.message}` }, { status: 500 });
    }

    // If Resend API Key is missing, print warning and fail gracefully
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is not defined in environment variables. Skipping background email dispatch.');
      return NextResponse.json({ success: true, warning: 'Email configuration missing' });
    }

    const { data, error } = await resend.emails.send({
      from: 'AI Models Lab Support <onboarding@resend.dev>',
      to: 'oristern8@gmail.com',
      subject: `Support Transmission: ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px; background-color: #0A0A0B; color: #ffffff;">
          <h2 style="color: #a855f7; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
            Initialize Transmission
          </h2>
          <p style="margin: 15px 0;"><strong>Sender Name:</strong> ${name}</p>
          <p style="margin: 15px 0;"><strong>Sender Email:</strong> ${email}</p>
          <p style="margin: 15px 0;"><strong>Department/Subject:</strong> ${subject}</p>
          <div style="margin-top: 25px; padding: 15px; border-left: 4px solid #a855f7; background-color: rgba(255, 255, 255, 0.05); border-radius: 4px;">
            <p style="margin: 0; font-weight: bold; color: #a855f7; text-transform: uppercase; font-size: 11px; tracking-wider;">Transmission Content:</p>
            <p style="margin: 10px 0 0 0; white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #e2e8f0;">${message}</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend email error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Support API route error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
