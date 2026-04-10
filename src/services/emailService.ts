import { Resend } from "resend";

export interface SendEmailParams {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Service to send emails using Resend.
 * This abstracts the logic so it can be easily updated or mocked.
 */
export async function sendEmail({ apiKey, from, to, subject, text, html }: SendEmailParams) {
  try {
    // Initialize a new instance per request since the API Key
    // comes from the specific Gym Owner's configuration.
    const resend = new Resend(apiKey);
    
    const { data, error } = await resend.emails.send({
      from, // Must be a verified domain on Resend (e.g. notifications@yourdomain.com)
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, '<br/>'),
    });

    if (error) {
      console.error("[EmailService] Resend API Error:", error);
      throw new Error(error.message);
    }
    
    return { success: true, data };
  } catch (error: any) {
    console.error("[EmailService] Failed to send email via Resend:", error);
    throw new Error(error.message || "Email sending failed");
  }
}
