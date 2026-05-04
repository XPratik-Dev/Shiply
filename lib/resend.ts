import { Resend } from "resend";

export async function sendChangelogPublishedEmail(
  to: string,
  changelogTitle: string,
  publicUrl: string,
) {
  if (!process.env.RESEND_API_KEY) {
    return { sent: false, reason: "RESEND_API_KEY is not configured." };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.EMAIL_FROM || "noreply@example.com",
    to,
    subject: `Your changelog is live: ${changelogTitle}`,
    html: `
      <h2>Your changelog is published</h2>
      <p><strong>${changelogTitle}</strong> is now live and shareable.</p>
      <p><a href="${publicUrl}" style="background:#111827;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;display:inline-block">View changelog</a></p>
      <p style="color:#555;font-size:14px">Public URL: <code>${publicUrl}</code></p>
    `,
  });

  return { sent: true };
}
